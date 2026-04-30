Implement an `Evaluator` that processes a sequence of commands and evaluates arithmetic expressions with variables.

## Commands

- `SET name number` — assign a numeric value to a variable. The value is always a literal (integer or decimal).
- `EVAL expression` — evaluate the expression and print the result.

## Expression syntax

| Feature | Examples |
|---|---|
| Numeric literals | `42`, `3.14`, `0.5` |
| Variables | `x`, `total` (set via `SET`) |
| Binary operators | `+`, `-`, `*`, `/` — standard precedence, left-associative |
| Unary minus | `-x`, `-(a + 1)` |
| Parentheses | `(a + b) * c` |
| Functions | `min(a, b)`, `max(a, b)`, `abs(x)`, `pow(x, y)` |

Operator precedence: `*` and `/` bind tighter than `+` and `-`. All binary operators are left-associative.

## Output

For each `EVAL`, print the result on its own line using `%.6g` formatting (6 significant figures, no trailing zeros).

## Examples

```
SET x 6
EVAL x * (x - 2)       → 24
EVAL max(x, 10) / 2    → 5
EVAL pow(2, x / 2)     → 8
```

## Constraints

- Variable names consist of lowercase letters only, max length 16.
- Numeric literals are integers or decimals; no scientific notation in input.
- All variables referenced in `EVAL` will have been `SET` beforehand.
- Expressions are well-formed and parentheses are balanced.
- At most 500 commands total.

## Notes

This problem is intentionally open-ended. A clean solution will likely decompose into a **lexer**, a **parser**, and an **evaluator** — feel free to use as many files as you need.
