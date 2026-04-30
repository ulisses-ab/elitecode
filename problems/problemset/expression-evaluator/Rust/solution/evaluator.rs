use std::collections::HashMap;

pub struct Evaluator {
    vars: HashMap<String, f64>,
}

impl Evaluator {
    pub fn new() -> Self {
        Self { vars: HashMap::new() }
    }

    pub fn set(&mut self, name: &str, value: f64) {
        self.vars.insert(name.to_string(), value);
    }

    pub fn eval(&mut self, expression: &str) -> f64 {
        let mut p = Parser { src: expression.as_bytes(), pos: 0, vars: &self.vars };
        p.expr()
    }
}

struct Parser<'a> {
    src: &'a [u8],
    pos: usize,
    vars: &'a HashMap<String, f64>,
}

impl<'a> Parser<'a> {
    fn skip(&mut self) {
        while self.pos < self.src.len() && self.src[self.pos].is_ascii_whitespace() {
            self.pos += 1;
        }
    }

    fn peek(&self) -> Option<u8> {
        self.src.get(self.pos).copied()
    }

    fn expr(&mut self) -> f64 {
        let mut v = self.term();
        self.skip();
        while matches!(self.peek(), Some(b'+') | Some(b'-')) {
            let op = self.src[self.pos]; self.pos += 1;
            let r = self.term();
            v = if op == b'+' { v + r } else { v - r };
            self.skip();
        }
        v
    }

    fn term(&mut self) -> f64 {
        let mut v = self.unary();
        self.skip();
        while matches!(self.peek(), Some(b'*') | Some(b'/')) {
            let op = self.src[self.pos]; self.pos += 1;
            let r = self.unary();
            v = if op == b'*' { v * r } else { v / r };
            self.skip();
        }
        v
    }

    fn unary(&mut self) -> f64 {
        self.skip();
        if self.peek() == Some(b'-') { self.pos += 1; return -self.unary(); }
        self.primary()
    }

    fn primary(&mut self) -> f64 {
        self.skip();
        match self.peek() {
            Some(b'(') => {
                self.pos += 1;
                let v = self.expr();
                self.skip();
                if self.peek() == Some(b')') { self.pos += 1; }
                v
            }
            Some(c) if c.is_ascii_digit() || c == b'.' => {
                let start = self.pos;
                while matches!(self.peek(), Some(c) if c.is_ascii_digit() || c == b'.') {
                    self.pos += 1;
                }
                std::str::from_utf8(&self.src[start..self.pos]).unwrap().parse().unwrap_or(0.0)
            }
            Some(c) if c.is_ascii_alphabetic() => {
                let start = self.pos;
                while matches!(self.peek(), Some(c) if c.is_ascii_alphanumeric()) {
                    self.pos += 1;
                }
                let name = std::str::from_utf8(&self.src[start..self.pos]).unwrap();
                self.skip();
                if self.peek() == Some(b'(') {
                    self.pos += 1;
                    let mut args = vec![];
                    self.skip();
                    if self.peek() != Some(b')') {
                        args.push(self.expr());
                        self.skip();
                        while self.peek() == Some(b',') {
                            self.pos += 1;
                            args.push(self.expr());
                            self.skip();
                        }
                    }
                    if self.peek() == Some(b')') { self.pos += 1; }
                    return match name {
                        "min" => args[0].min(args[1]),
                        "max" => args[0].max(args[1]),
                        "abs" => args[0].abs(),
                        "pow" => args[0].powf(args[1]),
                        _ => 0.0,
                    };
                }
                *self.vars.get(name).unwrap_or(&0.0)
            }
            _ => 0.0,
        }
    }
}
