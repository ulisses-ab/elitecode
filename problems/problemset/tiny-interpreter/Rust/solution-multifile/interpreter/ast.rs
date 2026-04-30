#[derive(Debug, Clone)]
pub enum Expr {
    Num(i64),
    Var(String),
    Bin(String, Box<Expr>, Box<Expr>),
    Unary(String, Box<Expr>),
    Call(String, Vec<Expr>),
}

#[derive(Debug, Clone)]
pub enum Stmt {
    Assign(String, Expr),
    Print(Expr),
    Return(Expr),
    If(Vec<(Expr, Vec<Stmt>)>, Vec<Stmt>),
    While(Expr, Vec<Stmt>),
    Def(String, Vec<String>, Vec<Stmt>),
    Expr(Expr),
}
