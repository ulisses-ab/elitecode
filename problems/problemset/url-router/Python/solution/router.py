from dataclasses import dataclass, field

@dataclass
class RouteMatch:
    pattern: str = ''
    params: list[tuple[str, str]] = field(default_factory=list)

class Router:
    def __init__(self):
        self._routes: list[tuple[str, str, list[str]]] = []  # (method, pattern, segments)

    def register(self, method: str, pattern: str) -> None:
        self._routes.append((method, pattern, pattern.split('/')))

    def match(self, method: str, url: str) -> RouteMatch:
        url_segs = url.split('/')
        best_pattern = None
        best_score = None
        best_params = None

        for route_method, pattern, segs in self._routes:
            if route_method != method or len(segs) != len(url_segs):
                continue
            score = []
            params = []
            ok = True
            for ps, us in zip(segs, url_segs):
                if ps.startswith(':'):
                    params.append((ps[1:], us))
                    score.append(1)
                elif ps == us:
                    score.append(0)
                else:
                    ok = False
                    break
            if ok and (best_score is None or score < best_score):
                best_pattern = pattern
                best_score = score
                best_params = params

        if best_pattern is None:
            return RouteMatch()
        return RouteMatch(pattern=best_pattern, params=best_params)
