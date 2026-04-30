#include <bits/stdc++.h>

class Chess {
public:
    Chess();

    // Start a new game (white to move).
    void newGame();

    // Attempt a move in UCI notation (e.g. "e2e4", "e1g1", "e7e8q").
    // Returns "OK", "ILLEGAL", "CHECKMATE", "STALEMATE", or "DRAW".
    std::string move(const std::string& uci);

    // Print the board: rank 8 at top, files a-h left to right.
    // Uppercase = white, lowercase = black, '.' = empty.
    // Returns an 8-line string (each line ends with '\n').
    std::string print() const;

    // Return legal destination squares for the piece at sq (e.g. "e2"),
    // space-separated and sorted. Empty string if no legal moves.
    std::string moves(const std::string& sq);

    // Return current game status: WHITE_TO_MOVE, BLACK_TO_MOVE, CHECK,
    // CHECKMATE, STALEMATE, or DRAW.
    std::string status();

    // Return move history, one UCI move per line.
    std::string history();

private:
    // Add your board representation and helper methods here.
};
