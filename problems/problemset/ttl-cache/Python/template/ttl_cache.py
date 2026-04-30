class TTLCache:
    def __init__(self):
        pass

    def set(self, key: str, value: str, ttl: int) -> None:
        pass

    def get(self, key: str) -> str:
        pass

    def delete(self, key: str) -> None:
        pass

    def size(self) -> int:
        pass

    def tick(self, delta: int) -> None:
        pass
