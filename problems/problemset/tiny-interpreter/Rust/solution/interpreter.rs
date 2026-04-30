use std::collections::HashMap;

// ── Tokens ────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, PartialEq)]
enum TT {
    Num(i64), Ident(String),
    If, Elif, Else, While, Def, Return, Print, And, Or, Not,
    Plus, Minus, Star, Slash, Percent,
    Eq, Neq, Lt, Le, Gt, Ge, Assign,
    LParen, RParen, Comma, Colon,
    Newline, Indent, Dedent, End,
}

fn lex(src: &str) -> Vec<TT> {
    let mut out = Vec::new();
    let mut indents: Vec<usize> = vec![0];

    for line in src.lines() {
        let first = line.len() - line.trim_start_matches(|c| c == ' ' || c == '\t').len();
        let stripped = &line[first..];
        if stripped.is_empty() || stripped.starts_with('#') { continue; }

        let ind = first;
        if ind > *indents.last().unwrap() {
            indents.push(ind);
            out.push(TT::Indent);
        } else {
            while ind < *indents.last().unwrap() {
                indents.pop();
                out.push(TT::Dedent);
            }
        }

        let bytes = stripped.as_bytes();
        let mut i = 0;
        while i < bytes.len() {
            let c = bytes[i];
            if c == b' ' || c == b'\t' { i += 1; continue; }
            if c == b'#' { break; }

            if c.is_ascii_digit() {
                let start = i;
                while i < bytes.len() && bytes[i].is_ascii_digit() { i += 1; }
                let n: i64 = stripped[start..i].parse().unwrap();
                out.push(TT::Num(n));
                continue;
            }
            if c.is_ascii_alphabetic() || c == b'_' {
                let start = i;
                while i < bytes.len() && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_') { i += 1; }
                let word = &stripped[start..i];
                out.push(match word {
                    "if"     => TT::If,   "elif"   => TT::Elif,   "else"   => TT::Else,
                    "while"  => TT::While, "def"   => TT::Def,    "return" => TT::Return,
                    "print"  => TT::Print, "and"   => TT::And,    "or"     => TT::Or,
                    "not"    => TT::Not,
                    _        => TT::Ident(word.to_string()),
                });
                continue;
            }
            if i + 1 < bytes.len() {
                let two = &stripped[i..i+2];
                match two {
                    "==" => { out.push(TT::Eq);  i += 2; continue; }
                    "!=" => { out.push(TT::Neq); i += 2; continue; }
                    "<=" => { out.push(TT::Le);  i += 2; continue; }
                    ">=" => { out.push(TT::Ge);  i += 2; continue; }
                    _ => {}
                }
            }
            out.push(match c {
                b'+' => TT::Plus,   b'-' => TT::Minus,  b'*' => TT::Star,
                b'/' => TT::Slash,  b'%' => TT::Percent, b'=' => TT::Assign,
                b'<' => TT::Lt,     b'>' => TT::Gt,
                b'(' => TT::LParen, b')' => TT::RParen,
                b',' => TT::Comma,  b':' => TT::Colon,
                _    => { i += 1; continue; }
            });
            i += 1;
        }
        out.push(TT::Newline);
    }
    while indents.len() > 1 { indents.pop(); out.push(TT::Dedent); }
    out.push(TT::End);
    out
}

// ── AST ───────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
enum Expr {
    Num(i64),
    Var(String),
    Bin(String, Box<Expr>, Box<Expr>),
    Unary(String, Box<Expr>),
    Call(String, Vec<Expr>),
}

#[derive(Debug, Clone)]
enum Stmt {
    Assign(String, Expr),
    Print(Expr),
    Return(Expr),
    If(Vec<(Expr, Vec<Stmt>)>, Vec<Stmt>),
    While(Expr, Vec<Stmt>),
    Def(String, Vec<String>, Vec<Stmt>),
    Expr(Expr),
}

// ── Parser ────────────────────────────────────────────────────────────────────

struct Parser { tok: Vec<TT>, pos: usize }

impl Parser {
    fn cur(&self) -> &TT  { &self.tok[self.pos] }
    fn peek(&self) -> &TT { self.tok.get(self.pos + 1).unwrap_or(&TT::End) }
    fn consume(&mut self) -> TT { let t = self.tok[self.pos].clone(); self.pos += 1; t }
    fn expect(&mut self, t: &TT) { assert!(std::mem::discriminant(self.cur()) == std::mem::discriminant(t)); self.pos += 1; }
    fn skip_nl(&mut self) { while *self.cur() == TT::Newline { self.pos += 1; } }

    fn parse(&mut self) -> Vec<Stmt> {
        let mut out = vec![];
        self.skip_nl();
        while *self.cur() != TT::End {
            out.push(self.stmt());
            self.skip_nl();
        }
        out
    }

    fn block(&mut self) -> Vec<Stmt> {
        self.expect(&TT::Indent);
        let mut out = vec![];
        while *self.cur() != TT::Dedent && *self.cur() != TT::End {
            out.push(self.stmt());
        }
        if *self.cur() == TT::Dedent { self.pos += 1; }
        out
    }

    fn stmt(&mut self) -> Stmt {
        self.skip_nl();
        match self.cur().clone() {
            TT::If    => self.if_stmt(),
            TT::While => {
                self.pos += 1;
                let cond = self.expr(); self.expect(&TT::Colon);
                if *self.cur() == TT::Newline { self.pos += 1; }
                Stmt::While(cond, self.block())
            }
            TT::Def => {
                self.pos += 1;
                let name = if let TT::Ident(n) = self.consume() { n } else { panic!() };
                self.expect(&TT::LParen);
                let mut params = vec![];
                while *self.cur() != TT::RParen {
                    if let TT::Ident(n) = self.consume() { params.push(n); }
                    if *self.cur() == TT::Comma { self.pos += 1; }
                }
                self.expect(&TT::RParen); self.expect(&TT::Colon);
                if *self.cur() == TT::Newline { self.pos += 1; }
                Stmt::Def(name, params, self.block())
            }
            TT::Return => {
                self.pos += 1;
                let e = self.expr();
                if *self.cur() == TT::Newline { self.pos += 1; }
                Stmt::Return(e)
            }
            TT::Print => {
                self.pos += 1; self.expect(&TT::LParen);
                let e = self.expr(); self.expect(&TT::RParen);
                if *self.cur() == TT::Newline { self.pos += 1; }
                Stmt::Print(e)
            }
            TT::Ident(name) if *self.peek() == TT::Assign => {
                self.pos += 2;
                let e = self.expr();
                if *self.cur() == TT::Newline { self.pos += 1; }
                Stmt::Assign(name, e)
            }
            _ => {
                let e = self.expr();
                if *self.cur() == TT::Newline { self.pos += 1; }
                Stmt::Expr(e)
            }
        }
    }

    fn if_stmt(&mut self) -> Stmt {
        self.pos += 1;
        let mut branches = vec![];
        let cond = self.expr(); self.expect(&TT::Colon);
        if *self.cur() == TT::Newline { self.pos += 1; }
        branches.push((cond, self.block()));
        while *self.cur() == TT::Elif {
            self.pos += 1;
            let c = self.expr(); self.expect(&TT::Colon);
            if *self.cur() == TT::Newline { self.pos += 1; }
            branches.push((c, self.block()));
        }
        let else_block = if *self.cur() == TT::Else {
            self.pos += 1; self.expect(&TT::Colon);
            if *self.cur() == TT::Newline { self.pos += 1; }
            self.block()
        } else { vec![] };
        Stmt::If(branches, else_block)
    }

    fn expr(&mut self)    -> Expr { self.or() }
    fn or(&mut self)      -> Expr { self.bin_left(&[TT::Or],      Self::and) }
    fn and(&mut self)     -> Expr { self.bin_left(&[TT::And],     Self::not_expr) }
    fn not_expr(&mut self) -> Expr {
        if *self.cur() == TT::Not { self.pos += 1; return Expr::Unary("not".into(), Box::new(self.not_expr())); }
        self.cmp()
    }
    fn cmp(&mut self) -> Expr {
        let l = self.add();
        let op = match self.cur() {
            TT::Eq => "==", TT::Neq => "!=", TT::Lt => "<",
            TT::Le => "<=", TT::Gt => ">",   TT::Ge => ">=",
            _ => return l,
        }.to_string();
        self.pos += 1;
        Expr::Bin(op, Box::new(l), Box::new(self.add()))
    }
    fn add(&mut self) -> Expr {
        let mut l = self.mul();
        while matches!(self.cur(), TT::Plus | TT::Minus) {
            let op = if *self.cur() == TT::Plus { "+" } else { "-" }.to_string();
            self.pos += 1; l = Expr::Bin(op, Box::new(l), Box::new(self.mul()));
        }
        l
    }
    fn mul(&mut self) -> Expr {
        let mut l = self.unary();
        while matches!(self.cur(), TT::Star | TT::Slash | TT::Percent) {
            let op = match self.cur() { TT::Star => "*", TT::Slash => "/", _ => "%" }.to_string();
            self.pos += 1; l = Expr::Bin(op, Box::new(l), Box::new(self.unary()));
        }
        l
    }
    fn unary(&mut self) -> Expr {
        if *self.cur() == TT::Minus { self.pos += 1; return Expr::Unary("-".into(), Box::new(self.unary())); }
        self.primary()
    }
    fn primary(&mut self) -> Expr {
        match self.cur().clone() {
            TT::Num(n) => { self.pos += 1; Expr::Num(n) }
            TT::Ident(name) => {
                self.pos += 1;
                if *self.cur() == TT::LParen {
                    self.pos += 1;
                    let mut args = vec![];
                    while *self.cur() != TT::RParen {
                        args.push(self.expr());
                        if *self.cur() == TT::Comma { self.pos += 1; }
                    }
                    self.pos += 1;
                    Expr::Call(name, args)
                } else {
                    Expr::Var(name)
                }
            }
            TT::LParen => { self.pos += 1; let e = self.expr(); self.expect(&TT::RParen); e }
            _ => Expr::Num(0),
        }
    }

    fn bin_left(&mut self, ops: &[TT], next: fn(&mut Self) -> Expr) -> Expr {
        let mut l = next(self);
        while ops.iter().any(|o| std::mem::discriminant(o) == std::mem::discriminant(self.cur())) {
            let op = match self.cur() { TT::Or => "or", TT::And => "and", _ => "" }.to_string();
            self.pos += 1; l = Expr::Bin(op, Box::new(l), Box::new(next(self)));
        }
        l
    }
}

// ── Interpreter ───────────────────────────────────────────────────────────────

struct ReturnSignal(i64);

pub struct Interpreter;

impl Interpreter {
    pub fn new() -> Self { Self }

    pub fn run(&mut self, source: &str) -> String {
        let tokens = lex(source);
        let mut parser = Parser { tok: tokens, pos: 0 };
        let program = parser.parse();

        let mut funcs: HashMap<String, (Vec<String>, Vec<Stmt>)> = HashMap::new();
        for s in &program {
            if let Stmt::Def(name, params, body) = s {
                funcs.insert(name.clone(), (params.clone(), body.clone()));
            }
        }

        let mut output = String::new();
        let mut globals: HashMap<String, i64> = HashMap::new();
        let _ = exec_block(&program, &mut globals, &funcs, &mut output);
        output
    }
}

fn exec_block(
    block: &[Stmt],
    env: &mut HashMap<String, i64>,
    funcs: &HashMap<String, (Vec<String>, Vec<Stmt>)>,
    out: &mut String,
) -> Option<ReturnSignal> {
    for s in block {
        if let Some(r) = exec_stmt(s, env, funcs, out) { return Some(r); }
    }
    None
}

fn exec_stmt(
    s: &Stmt,
    env: &mut HashMap<String, i64>,
    funcs: &HashMap<String, (Vec<String>, Vec<Stmt>)>,
    out: &mut String,
) -> Option<ReturnSignal> {
    match s {
        Stmt::Assign(name, expr) => { let v = eval(expr, env, funcs, out); env.insert(name.clone(), v); }
        Stmt::Print(expr)  => { let v = eval(expr, env, funcs, out); out.push_str(&v.to_string()); out.push('\n'); }
        Stmt::Return(expr) => return Some(ReturnSignal(eval(expr, env, funcs, out))),
        Stmt::If(branches, else_block) => {
            for (cond, body) in branches {
                if eval(cond, env, funcs, out) != 0 {
                    let mut local = env.clone();
                    if let Some(r) = exec_block(body, &mut local, funcs, out) {
                        env.extend(local); return Some(r);
                    }
                    env.extend(local); return None;
                }
            }
            let mut local = env.clone();
            if let Some(r) = exec_block(else_block, &mut local, funcs, out) {
                env.extend(local); return Some(r);
            }
            env.extend(local);
        }
        Stmt::While(cond, body) => {
            while eval(cond, env, funcs, out) != 0 {
                let mut local = env.clone();
                if let Some(r) = exec_block(body, &mut local, funcs, out) {
                    env.extend(local); return Some(r);
                }
                env.extend(local);
            }
        }
        Stmt::Def(name, params, body) => {
            let _ = (name, params, body); // already registered
        }
        Stmt::Expr(expr) => { eval(expr, env, funcs, out); }
    }
    None
}

fn eval(
    e: &Expr,
    env: &HashMap<String, i64>,
    funcs: &HashMap<String, (Vec<String>, Vec<Stmt>)>,
    out: &mut String,
) -> i64 {
    match e {
        Expr::Num(n) => *n,
        Expr::Var(name) => *env.get(name).unwrap_or(&0),
        Expr::Unary(op, e) => {
            let v = eval(e, env, funcs, out);
            match op.as_str() { "-" => -v, "not" => if v == 0 { 1 } else { 0 }, _ => v }
        }
        Expr::Bin(op, l, r) => {
            match op.as_str() {
                "and" => { let lv = eval(l, env, funcs, out); if lv == 0 { 0 } else { eval(r, env, funcs, out) } }
                "or"  => { let lv = eval(l, env, funcs, out); if lv != 0 { lv } else { eval(r, env, funcs, out) } }
                _ => {
                    let lv = eval(l, env, funcs, out);
                    let rv = eval(r, env, funcs, out);
                    match op.as_str() {
                        "+"  => lv + rv,
                        "-"  => lv - rv,
                        "*"  => lv * rv,
                        "/"  => lv / rv,
                        "%"  => lv % rv,
                        "==" => (lv == rv) as i64,
                        "!=" => (lv != rv) as i64,
                        "<"  => (lv <  rv) as i64,
                        "<=" => (lv <= rv) as i64,
                        ">"  => (lv >  rv) as i64,
                        ">=" => (lv >= rv) as i64,
                        _    => 0,
                    }
                }
            }
        }
        Expr::Call(name, args) => {
            if let Some((params, body)) = funcs.get(name) {
                let params = params.clone();
                let body = body.clone();
                let mut local: HashMap<String, i64> = params.iter()
                    .zip(args.iter())
                    .map(|(p, a)| (p.clone(), eval(a, env, funcs, out)))
                    .collect();
                if let Some(ReturnSignal(v)) = exec_block(&body, &mut local, funcs, out) {
                    return v;
                }
            }
            0
        }
    }
}
