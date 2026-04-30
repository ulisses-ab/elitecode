from dataclasses import dataclass, field

@dataclass
class RouteMatch:
    pattern: str = ''
    params: list[tuple[str, str]] = field(default_factory=list)

class Router:
    def __init__(self):
        pass

    def register(self, method: str, pattern: str) -> None:
        pass

    def match(self, method: str, url: str) -> RouteMatch:
        pass
