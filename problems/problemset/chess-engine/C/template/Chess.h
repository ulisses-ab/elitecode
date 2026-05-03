#ifndef CHESS_H
#define CHESS_H

/* All returned strings are malloc'd; the caller (testbench) frees them. */

typedef struct Chess Chess;

Chess *chess_create(void);

/* Start a new game (white to move). */
void   chess_new_game(Chess *g);

/* Attempt a move in UCI notation (e.g. "e2e4", "e1g1", "e7e8q").
   Returns malloc'd: "OK", "ILLEGAL", "CHECKMATE", "STALEMATE", or "DRAW". */
char  *chess_move(Chess *g, const char *uci);

/* Print the board: rank 8 at top, files a-h left to right.
   Uppercase = white, lowercase = black, '.' = empty.
   Returns malloc'd 8-line string (each line ends with '\n'). */
char  *chess_print(const Chess *g);

/* Return legal destination squares for the piece at sq (e.g. "e2"),
   space-separated and sorted. Returns malloc'd string, empty if none. */
char  *chess_moves(Chess *g, const char *sq);

/* Return malloc'd current status: WHITE_TO_MOVE, BLACK_TO_MOVE, CHECK,
   CHECKMATE, STALEMATE, or DRAW. */
char  *chess_status(Chess *g);

/* Return malloc'd move history, one UCI move per line. */
char  *chess_history(Chess *g);

void   chess_destroy(Chess *g);

#endif
