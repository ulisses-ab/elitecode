class Interpreter:
    def run(self, source: str) -> str:
        """Execute a program in the tiny language and return all printed output
        as a newline-terminated string.

        The language supports:
        - Integer variables and arithmetic: + - * / %
        - Comparison operators: == != < <= > >=
        - Boolean operators: and or not
        - if / elif / else statements
        - while loops
        - def / return (including recursion)
        - print(expr)
        - Indentation-based blocks (4 spaces)
        - Single-line comments with #

        A clean solution will split into Lexer, Parser (AST), and Interpreter
        classes — add as many helper files as you need.
        """
        pass
