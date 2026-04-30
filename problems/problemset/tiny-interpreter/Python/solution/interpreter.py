from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any

# ── Tokens ────────────────────────────────────────────────────────────────────

NUM, IDENT = 'NUM', 'IDENT'
KEYWORDS = {'if', 'elif', 'else', 'while', 'def', 'return', 'print', 'and', 'or', 'not'}
NEWLINE, INDENT, DEDENT, END = 'NEWLINE', 'INDENT', 'DEDENT', 'END'

def lex(src: str):
    tokens = []
    indents = [0]

    for line in src.splitlines():
        first = len(line) - len(line.lstrip(' \t'))
        stripped = line[first:]
        if not stripped or stripped.startswith('#'):
            continue

        ind = first
        if ind > indents[-1]:
            indents.append(ind)
            tokens.append((INDENT, ''))
        else:
            while ind < indents[-1]:
                indents.pop()
                tokens.append((DEDENT, ''))

        i = 0
        while i < len(stripped):
            c = stripped[i]
            if c in ' \t':
                i += 1; continue
            if c == '#':
                break
            if c.isdigit():
                j = i
                while i < len(stripped) and stripped[i].isdigit():
                    i += 1
                tokens.append((NUM, int(stripped[j:i]))); continue
            if c.isalpha() or c == '_':
                j = i
                while i < len(stripped) and (stripped[i].isalnum() or stripped[i] == '_'):
                    i += 1
                word = stripped[j:i]
                tokens.append((word if word in KEYWORDS else IDENT, word)); continue
            two = stripped[i:i+2]
            if two in ('==', '!=', '<=', '>='):
                tokens.append((two, two)); i += 2; continue
            tokens.append((c, c)); i += 1

        tokens.append((NEWLINE, ''))

    while len(indents) > 1:
        indents.pop()
        tokens.append((DEDENT, ''))
    tokens.append((END, ''))
    return tokens

# ── AST nodes (plain tuples for speed) ───────────────────────────────────────
# Expr: ('num', v) | ('var', name) | ('bin', op, l, r) | ('unary', op, e) | ('call', name, args)
# Stmt: ('assign', name, expr) | ('print', expr) | ('return', expr)
#     | ('if', [(cond, block)], else_block) | ('while', cond, block)
#     | ('def', name, params, block) | ('expr', expr)

# ── Parser ────────────────────────────────────────────────────────────────────

class Parser:
    def __init__(self, tokens):
        self.tok = tokens
        self.pos = 0

    def cur(self):  return self.tok[self.pos][0]
    def val(self):  return self.tok[self.pos][1]
    def peek(self): return self.tok[self.pos+1][0] if self.pos+1 < len(self.tok) else END
    def consume(self):
        t = self.tok[self.pos]; self.pos += 1; return t
    def expect(self, t):
        assert self.cur() == t, f"expected {t} got {self.cur()}"
        return self.consume()
    def skip_nl(self):
        while self.cur() == NEWLINE: self.pos += 1

    def parse(self):
        block = []
        self.skip_nl()
        while self.cur() != END:
            block.append(self.stmt())
            self.skip_nl()
        return block

    def block(self):
        self.expect(INDENT)
        stmts = []
        while self.cur() not in (DEDENT, END):
            stmts.append(self.stmt())
        if self.cur() == DEDENT: self.pos += 1
        return stmts

    def stmt(self):
        self.skip_nl()
        c = self.cur()
        if c == 'if':
            return self.if_stmt()
        if c == 'while':
            self.pos += 1
            cond = self.expr(); self.expect(':')
            if self.cur() == NEWLINE: self.pos += 1
            return ('while', cond, self.block())
        if c == 'def':
            self.pos += 1
            name = self.expect(IDENT)[1]
            self.expect('(')
            params = []
            while self.cur() != ')':
                params.append(self.expect(IDENT)[1])
                if self.cur() == ',': self.pos += 1
            self.expect(')'); self.expect(':')
            if self.cur() == NEWLINE: self.pos += 1
            return ('def', name, params, self.block())
        if c == 'return':
            self.pos += 1
            e = self.expr()
            if self.cur() == NEWLINE: self.pos += 1
            return ('return', e)
        if c == 'print':
            self.pos += 1; self.expect('(')
            e = self.expr(); self.expect(')')
            if self.cur() == NEWLINE: self.pos += 1
            return ('print', e)
        if c == IDENT and self.peek() == '=':
            name = self.val(); self.pos += 2
            e = self.expr()
            if self.cur() == NEWLINE: self.pos += 1
            return ('assign', name, e)
        e = self.expr()
        if self.cur() == NEWLINE: self.pos += 1
        return ('expr', e)

    def if_stmt(self):
        self.pos += 1
        branches = []
        cond = self.expr(); self.expect(':')
        if self.cur() == NEWLINE: self.pos += 1
        branches.append((cond, self.block()))
        while self.cur() == 'elif':
            self.pos += 1
            c = self.expr(); self.expect(':')
            if self.cur() == NEWLINE: self.pos += 1
            branches.append((c, self.block()))
        else_block = []
        if self.cur() == 'else':
            self.pos += 1; self.expect(':')
            if self.cur() == NEWLINE: self.pos += 1
            else_block = self.block()
        return ('if', branches, else_block)

    def expr(self):   return self.or_expr()
    def or_expr(self):
        l = self.and_expr()
        while self.cur() == 'or':
            self.pos += 1; r = self.and_expr()
            l = ('bin', 'or', l, r)
        return l
    def and_expr(self):
        l = self.not_expr()
        while self.cur() == 'and':
            self.pos += 1; r = self.not_expr()
            l = ('bin', 'and', l, r)
        return l
    def not_expr(self):
        if self.cur() == 'not':
            self.pos += 1; return ('unary', 'not', self.not_expr())
        return self.cmp()
    def cmp(self):
        l = self.add()
        if self.cur() in ('==','!=','<','<=','>','>='):
            op = self.consume()[0]; return ('bin', op, l, self.add())
        return l
    def add(self):
        l = self.mul()
        while self.cur() in ('+', '-'):
            op = self.consume()[0]; l = ('bin', op, l, self.mul())
        return l
    def mul(self):
        l = self.unary()
        while self.cur() in ('*', '/', '%'):
            op = self.consume()[0]; l = ('bin', op, l, self.unary())
        return l
    def unary(self):
        if self.cur() == '-':
            self.pos += 1; return ('unary', '-', self.unary())
        return self.primary()
    def primary(self):
        c = self.cur()
        if c == NUM:
            return ('num', self.consume()[1])
        if c == IDENT:
            name = self.consume()[1]
            if self.cur() == '(':
                self.pos += 1
                args = []
                while self.cur() != ')':
                    args.append(self.expr())
                    if self.cur() == ',': self.pos += 1
                self.pos += 1
                return ('call', name, args)
            return ('var', name)
        if c == '(':
            self.pos += 1; e = self.expr(); self.expect(')'); return e
        return ('num', 0)

# ── Interpreter ───────────────────────────────────────────────────────────────

class ReturnSignal(Exception):
    def __init__(self, val): self.val = val

class Interpreter:
    def run(self, source: str) -> str:
        self._output = []
        self._funcs = {}
        tokens = lex(source)
        program = Parser(tokens).parse()
        for s in program:
            if s[0] == 'def':
                self._funcs[s[1]] = s
        try:
            self._exec_block(program, {})
        except ReturnSignal:
            pass
        return ''.join(self._output)

    def _exec_block(self, block, env):
        for s in block:
            self._exec(s, env)

    def _exec(self, s, env):
        kind = s[0]
        if kind == 'assign':
            env[s[1]] = self._eval(s[2], env)
        elif kind == 'print':
            self._output.append(str(self._eval(s[1], env)) + '\n')
        elif kind == 'return':
            raise ReturnSignal(self._eval(s[1], env))
        elif kind == 'if':
            for cond, body in s[1]:
                if self._eval(cond, env):
                    self._exec_block(body, env); return
            self._exec_block(s[2], env)
        elif kind == 'while':
            while self._eval(s[1], env):
                self._exec_block(s[2], env)
        elif kind == 'def':
            self._funcs[s[1]] = s
        elif kind == 'expr':
            self._eval(s[1], env)

    def _eval(self, e, env):
        kind = e[0]
        if kind == 'num':   return e[1]
        if kind == 'var':   return env.get(e[1], self._funcs.get(e[1], 0)) if e[1] not in self._funcs else env.get(e[1], 0)
        if kind == 'unary':
            v = self._eval(e[2], env)
            return -v if e[1] == '-' else (0 if v else 1)
        if kind == 'bin':
            op = e[1]
            if op == 'and':
                l = self._eval(e[2], env); return self._eval(e[3], env) if l else 0
            if op == 'or':
                l = self._eval(e[2], env); return l if l else self._eval(e[3], env)
            l, r = self._eval(e[2], env), self._eval(e[3], env)
            if op == '+':  return l + r
            if op == '-':  return l - r
            if op == '*':  return l * r
            if op == '/':  return int(l / r)
            if op == '%':  return l % r
            if op == '==': return 1 if l == r else 0
            if op == '!=': return 1 if l != r else 0
            if op == '<':  return 1 if l < r else 0
            if op == '<=': return 1 if l <= r else 0
            if op == '>':  return 1 if l > r else 0
            if op == '>=': return 1 if l >= r else 0
        if kind == 'call':
            fn = self._funcs.get(e[1])
            if fn is None: return 0
            # fn = ('def', name, params, body)  e = ('call', name, args)
            local = {p: self._eval(a, env) for p, a in zip(fn[2], e[2])}
            try:
                self._exec_block(fn[3], local)
            except ReturnSignal as ret:
                return ret.val
            return 0
        return 0
