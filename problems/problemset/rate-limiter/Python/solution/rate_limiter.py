from collections import deque

class RateLimiter:
    def __init__(self, max_requests: int, window_ms: int):
        self.max_requests = max_requests
        self.window_ms = window_ms
        self.window: deque[int] = deque()

    def allow(self, timestamp: int) -> bool:
        cutoff = timestamp - self.window_ms
        while self.window and self.window[0] < cutoff:
            self.window.popleft()
        if len(self.window) < self.max_requests:
            self.window.append(timestamp)
            return True
        return False
