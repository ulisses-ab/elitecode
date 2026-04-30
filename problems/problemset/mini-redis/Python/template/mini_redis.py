import socket

class MiniRedis:
    def __init__(self):
        pass

    def start(self, port: int) -> None:
        """Start a TCP server on the given port.
        Accept one connection at a time.
        For each connection, read RESP commands and write RESP responses.
        This method should block indefinitely."""
        pass
