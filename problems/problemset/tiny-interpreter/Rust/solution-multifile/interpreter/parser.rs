use super::lexer::TT;
use super::ast::{Expr, Stmt};

pub struct Parser {
    tok: Vec<TT>,
    pos: usize,
}

impl Parser {
    pub fn new(tok: Vec<TT>) -> Self { Self { tok, pos: 0 } }

    fn cur(&self)  -> &TT { &self.tok[self.pos] }
    fn peek(&self) -> &TT { self.tok.get(self.pos + 1).unwrap_or(&TT::End) }
    fn consume(&mut self) -> TT { let t = self.tok[self.pos].clone(); self.pos += 1; t }
    fn expect(&mut self, t: &TT) {
        assert!(std::mem::discriminant(self.cur()) == std::mem::discriminant(t));
        self.pos += 1;
    }
    fn skip_nl(&mut self) { while *self.cur() == TT::Newline { self.pos += 1; } }

    pub fn parse(&mut self) -> Vec<Stmt> {
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

    fn expr(&mut self)     -> Expr { self.or() }
    fn or(&mut self)       -> Expr { self.bin_left(&[TT::Or],  Self::and) }
    fn and(&mut self)      -> Expr { self.bin_left(&[TT::And], Self::not_expr) }
    fn not_expr(&mut self) -> Expr {
        if *self.cur() == TT::Not {
            self.pos += 1;
            return Expr::Unary("not".into(), Box::new(self.not_expr()));
        }
        self.cmp()
    }
    fn cmp(&mut self) -> Expr {
        let l = self.add();
        let op = match self.cur() {
            TT::Eq => "==", TT::Neq => "!=", TT::Lt => "<",
            TT::Le => "<=", TT::Gt  => ">",  TT::Ge => ">=",
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
        if *self.cur() == TT::Minus {
            self.pos += 1;
            return Expr::Unary("-".into(), Box::new(self.unary()));
        }
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
