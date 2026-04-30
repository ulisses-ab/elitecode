/// Execute a program in the tiny language and return all printed output
/// as a newline-terminated string.
///
/// The language supports:
/// - Integer variables and arithmetic: + - * / %
/// - Comparison operators: == != < <= > >=
/// - Boolean operators: and or not
/// - if / elif / else statements
/// - while loops
/// - def / return (including recursion)
/// - print(expr)
/// - Indentation-based blocks
/// - Single-line comments with #
///
/// A clean solution will split into lexer, parser, and interpreter modules.
/// Add as many helper files as you need.
pub struct Interpreter {
    // Add your fields here
}

impl Interpreter {
    pub fn new() -> Self {
        todo!()
    }

    pub fn run(&mut self, source: &str) -> String {
        todo!()
    }
}
