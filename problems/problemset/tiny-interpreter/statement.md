Implement an interpreter for a small imperative language. Given a source program as a string, execute it and return all output produced by `print()` calls, separated by newlines.

## Language Reference

### Values
All values are **integers** (64-bit signed). Boolean results are `1` (true) or `0` (false).

### Statements

| Syntax | Description |
|---|---|
| `x = expr` | Assign a variable |
| `print(expr)` | Print a value (one per line) |
| `return expr` | Return from a function |
| `if cond:` / `elif cond:` / `else:` | Conditional |
| `while cond:` | Loop |
| `def name(p1, p2):` | Define a function |

Blocks are **indentation-delimited** (4 spaces per level).

### Expressions

| Feature | Operators |
|---|---|
| Arithmetic | `+` `-` `*` `/` `%` (integer division) |
| Comparison | `==` `!=` `<` `<=` `>` `>=` |
| Boolean | `and` `or` `not` |
| Grouping | `( expr )` |
| Call | `name(arg1, arg2)` |

Operator precedence (low → high): `or` → `and` → `not` → comparisons → `+`/`-` → `*`/`/`/`%` → unary `-`.

### Scoping
Top-level variables are global. Functions have their own local scope; they can **read** globals but assignments always go into the local scope.

## Example

```
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))   → 120
print(factorial(10))  → 3628800
```

## Constraints

- Programs are well-formed (no syntax errors).
- At most 2000 statements total.
- Recursion depth ≤ 500.
- All integer results fit in a 64-bit signed integer.

## Notes

A clean solution naturally decomposes into a **Lexer** (tokenisation + indentation), a **Parser** (recursive descent → AST), and an **Interpreter** (AST walker). Feel free to use as many files as you need.
