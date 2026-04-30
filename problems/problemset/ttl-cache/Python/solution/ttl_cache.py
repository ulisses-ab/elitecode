class TTLCache:
    def __init__(self):
        self._now = 0
        self._store: dict[str, tuple[str, int]] = {}  # key -> (value, expiry)

    def set(self, key: str, value: str, ttl: int) -> None:
        self._store[key] = (value, self._now + ttl)

    def get(self, key: str) -> str:
        entry = self._store.get(key)
        if entry is None or self._now >= entry[1]:
            return ''
        return entry[0]

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def size(self) -> int:
        return sum(1 for _, expiry in self._store.values() if self._now < expiry)

    def tick(self, delta: int) -> None:
        self._now += delta
