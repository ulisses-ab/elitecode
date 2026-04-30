import math

class Evaluator:
    def __init__(self):
        self._vars: dict[str, float] = {}

    def set(self, name: str, value: float) -> None:
        self._vars[name] = value

    def eval(self, expression: str) -> float:
        self._src = expression
        self._pos = 0
        return self._expr()

    def _skip(self):
        while self._pos < len(self._src) and self._src[self._pos].isspace():
            self._pos += 1

    def _expr(self):
        v = self._term()
        self._skip()
        while self._pos < len(self._src) and self._src[self._pos] in '+-':
            op = self._src[self._pos]; self._pos += 1
            r = self._term()
            v = v + r if op == '+' else v - r
            self._skip()
        return v

    def _term(self):
        v = self._unary()
        self._skip()
        while self._pos < len(self._src) and self._src[self._pos] in '*/':
            op = self._src[self._pos]; self._pos += 1
            r = self._unary()
            v = v * r if op == '*' else v / r
            self._skip()
        return v

    def _unary(self):
        self._skip()
        if self._pos < len(self._src) and self._src[self._pos] == '-':
            self._pos += 1
            return -self._unary()
        return self._primary()

    def _primary(self):
        self._skip()
        s = self._src
        p = self._pos
        if p < len(s) and s[p] == '(':
            self._pos += 1
            v = self._expr()
            self._skip()
            if self._pos < len(s) and s[self._pos] == ')':
                self._pos += 1
            return v
        if p < len(s) and (s[p].isdigit() or s[p] == '.'):
            start = p
            while self._pos < len(s) and (s[self._pos].isdigit() or s[self._pos] == '.'):
                self._pos += 1
            return float(s[start:self._pos])
        if p < len(s) and s[p].isalpha():
            start = p
            while self._pos < len(s) and s[self._pos].isalnum():
                self._pos += 1
            name = s[start:self._pos]
            self._skip()
            if self._pos < len(s) and s[self._pos] == '(':
                self._pos += 1
                args = []
                self._skip()
                if self._pos < len(s) and s[self._pos] != ')':
                    args.append(self._expr())
                    self._skip()
                    while self._pos < len(s) and s[self._pos] == ',':
                        self._pos += 1
                        args.append(self._expr())
                        self._skip()
                if self._pos < len(s) and s[self._pos] == ')':
                    self._pos += 1
                return {'min': min, 'max': max, 'abs': abs, 'pow': math.pow}.get(name, lambda *a: 0)(*args)
            return self._vars.get(name, 0.0)
        return 0.0
