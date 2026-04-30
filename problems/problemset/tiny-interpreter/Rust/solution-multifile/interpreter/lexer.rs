#[derive(Debug, Clone, PartialEq)]
pub enum TT {
    Num(i64), Ident(String),
    If, Elif, Else, While, Def, Return, Print, And, Or, Not,
    Plus, Minus, Star, Slash, Percent,
    Eq, Neq, Lt, Le, Gt, Ge, Assign,
    LParen, RParen, Comma, Colon,
    Newline, Indent, Dedent, End,
}

pub fn lex(src: &str) -> Vec<TT> {
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
                    "if"     => TT::If,    "elif"   => TT::Elif,   "else"   => TT::Else,
                    "while"  => TT::While, "def"    => TT::Def,    "return" => TT::Return,
                    "print"  => TT::Print, "and"    => TT::And,    "or"     => TT::Or,
                    "not"    => TT::Not,
                    _        => TT::Ident(word.to_string()),
                });
                continue;
            }
            if i + 1 < bytes.len() {
                match &stripped[i..i+2] {
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
