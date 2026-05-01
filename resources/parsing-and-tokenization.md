# Parsing & Tokenization

Parsing is the process of converting raw text into a structured representation that a program can work with. Almost all interpreters, compilers, configuration parsers, and command-line tools begin with the same two-stage pipeline: lexing followed by parsing.

## Stage 1 — Lexing (Tokenization)

The lexer reads raw characters and groups them into tokens — the smallest meaningful units of the language. A token has a type (number, identifier, operator, bracket) and a value (the actual text it was matched from).

For example, the string `3 + (4 * 2)` produces a flat list of tokens: `NUMBER(3)`, `PLUS`, `LPAREN`, `NUMBER(4)`, `STAR`, `NUMBER(2)`, `RPAREN`.

The lexer's output throws away whitespace and comments, leaving only the semantically significant pieces. This simplifies the next stage considerably.

## Stage 2 — Parsing

The parser consumes the token stream and builds an Abstract Syntax Tree (AST) — a tree that captures the grammatical structure of the input. Each node in the AST represents a construct: a binary operation, a function call, an if-statement, and so on.

The AST makes the nesting and precedence of operations explicit in its shape. The expression `3 + 4 * 2` becomes a tree where the `*` node is a child of the `+` node, correctly encoding that multiplication binds tighter.

## Recursive descent parsing

Recursive descent is the most natural technique for hand-written parsers. You define one function per grammatical rule, and each function calls other functions for the sub-rules it contains. The call stack mirrors the tree structure being built.

Operator precedence is encoded by the order of the grammar rules: rules for lower-precedence operators appear higher in the call chain and invoke rules for higher-precedence operators as sub-rules. When the parser wants a `term` (for multiplication), it calls `factor` (for atoms and parenthesised expressions) — the nesting naturally gives multiplication priority over addition.

## Handling parentheses

Parentheses are not stored in the AST — they only affect which sub-expressions are grouped together. The parser handles them by recursively calling the top-level expression-parsing rule when it encounters an open parenthesis, then consuming the matching close parenthesis. Whatever tree is built inside the parentheses becomes a single subtree at that position.

## Evaluation

Once the AST is built, evaluating it is a post-order traversal: recursively evaluate the left and right children, then apply the current node's operator to the results. Leaf nodes (numbers, variables) return their value directly. This cleanly separates parsing (what does the structure mean?) from evaluation (what does it compute?).

## Alternative approaches

**Shunting-yard** converts infix notation to postfix (reverse Polish notation) using a stack, without building an explicit tree. The postfix form can then be evaluated with a second stack pass. This is simpler to implement than a full recursive descent parser for expression evaluation specifically.

**Pratt parsing** associates a binding power with each token instead of encoding precedence in the grammar rules. It handles complex precedence and right-associativity elegantly and is the basis of many production parsers.

## Common challenges

- Left recursion: a grammar rule that calls itself as its first action causes infinite recursion in a recursive descent parser and must be refactored.
- Error recovery: deciding what to do when the input doesn't match the grammar — skip tokens, insert synthetic tokens, or report and abort.
- Operator associativity: `a - b - c` should parse as `(a - b) - c` (left-associative), not `a - (b - c)`.
