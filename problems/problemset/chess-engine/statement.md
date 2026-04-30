Implement a fully rule-compliant chess game engine.

Implement a `Chess` class that supports the following commands (received line by line via the testbench):

| Command | Description |
|---|---|
| `NEW` | Start a fresh game. White moves first. |
| `MOVE <uci>` | Attempt a move in UCI notation (e.g. `e2e4`, `e1g1` for castling, `e7e8q` for promotion). Prints one of: `OK`, `ILLEGAL`, `CHECKMATE`, `STALEMATE`, or `DRAW`. |
| `PRINT` | Print the board — rank 8 at the top, files a–h left to right. Uppercase = white, lowercase = black, `.` = empty. |
| `MOVES <sq>` | Print all legal destination squares for the piece at `<sq>`, space-separated and sorted (e.g. `e3 e4`). |
| `STATUS` | Print current game state: `WHITE_TO_MOVE`, `BLACK_TO_MOVE`, `CHECK`, `CHECKMATE`, `STALEMATE`, or `DRAW`. |
| `HISTORY` | Print each move played so far, one per line, in UCI notation. |

## Rules

Implement **all** standard chess rules:

- **Castling** (both kingside and queenside): not allowed while in check, through an attacked square, or if the king/rook has previously moved.
- **En passant**: only on the move immediately after a double pawn push.
- **Pawn promotion**: always promote to queen when the promotion piece is omitted. If specified (e.g. `e7e8n`), promote to the given piece (`q`=queen, `r`=rook, `b`=bishop, `n`=knight).
- **Fifty-move draw rule**: 100 half-moves without a pawn move or capture = `DRAW`.
- A move is **illegal** if it leaves the moving side's king in check.

## Example

```
NEW
MOVE e2e4   → OK
MOVE e7e5   → OK
MOVE f1c4   → OK
MOVE b8c6   → OK
MOVE d1h5   → OK
MOVE a7a6   → OK
MOVE h5f7   → CHECKMATE
STATUS      → CHECKMATE
PRINT       →
  rnbqkb.r
  pppp.Qpp
  ..n.....
  ....p...
  ..B.P...
  ........
  PPPP.PPP
  RNB.K.NR
```

## Constraints

- At most 500 moves per game
- `MOVES` and `STATUS` may be called at any time, including mid-game
- A `NEW` command resets the game entirely
