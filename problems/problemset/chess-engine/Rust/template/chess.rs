pub struct Chess {
    // Add your board representation here
}

impl Chess {
    pub fn new() -> Self {
        let mut c = Chess { /* ... */ };
        c.new_game();
        c
    }

    /// Start a new game (white to move).
    pub fn new_game(&mut self) {
        todo!()
    }

    /// Attempt a move in UCI notation (e.g. "e2e4", "e1g1", "e7e8q").
    /// Returns "OK", "ILLEGAL", "CHECKMATE", "STALEMATE", or "DRAW".
    pub fn make_move(&mut self, uci: &str) -> String {
        todo!()
    }

    /// Print the board: rank 8 at top, files a-h left to right.
    /// Uppercase = white, lowercase = black, '.' = empty.
    /// Returns an 8-line string (each line ends with '\n').
    pub fn print_board(&self) -> String {
        todo!()
    }

    /// Return legal destination squares for the piece at sq (e.g. "e2"),
    /// space-separated and sorted. Empty string if no legal moves.
    pub fn moves(&mut self, sq: &str) -> String {
        todo!()
    }

    /// Return current game status: WHITE_TO_MOVE, BLACK_TO_MOVE, CHECK,
    /// CHECKMATE, STALEMATE, or DRAW.
    pub fn status(&mut self) -> String {
        todo!()
    }

    /// Return move history, one UCI move per line.
    pub fn history(&self) -> String {
        todo!()
    }
}
