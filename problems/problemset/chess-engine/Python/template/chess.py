class Chess:
    def __init__(self):
        self.new_game()

    def new_game(self) -> None:
        pass

    def move(self, uci: str) -> str:
        """Attempt a move in UCI notation (e.g. 'e2e4', 'e1g1', 'e7e8q').
        Returns 'OK', 'ILLEGAL', 'CHECKMATE', 'STALEMATE', or 'DRAW'."""
        pass

    def print_board(self) -> str:
        """Print the board: rank 8 at top, files a-h left to right.
        Uppercase = white, lowercase = black, '.' = empty.
        Returns an 8-line string (each line ends with '\\n')."""
        pass

    def moves(self, sq: str) -> str:
        """Return legal destination squares for the piece at sq (e.g. 'e2'),
        space-separated and sorted. Empty string if no legal moves."""
        pass

    def status(self) -> str:
        """Return current game status: WHITE_TO_MOVE, BLACK_TO_MOVE, CHECK,
        CHECKMATE, STALEMATE, or DRAW."""
        pass

    def history(self) -> str:
        """Return move history, one UCI move per line."""
        pass
