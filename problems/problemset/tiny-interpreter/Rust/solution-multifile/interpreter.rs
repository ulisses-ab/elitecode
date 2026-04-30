mod lexer;
mod ast;
mod parser;
mod exec;

use std::collections::HashMap;
use ast::Stmt;
use exec::exec_block;

pub struct Interpreter;

impl Interpreter {
    pub fn new() -> Self { Self }

    pub fn run(&mut self, source: &str) -> String {
        let tokens = lexer::lex(source);
        let mut p = parser::Parser::new(tokens);
        let program = p.parse();

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
