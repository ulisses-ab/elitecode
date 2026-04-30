# Board: b[rank][file], rank 0 = rank 1 (chess), rank 7 = rank 8
# Pieces: 0=empty, 1=P, 2=N, 3=B, 4=R, 5=Q, 6=K
# Positive = white, negative = black

_KN = [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)]
_DD = [(1,1),(1,-1),(-1,1),(-1,-1)]
_RD = [(1,0),(-1,0),(0,1),(0,-1)]
_BACK = [4,2,3,5,6,3,2,4]
_WPC = ' PNBRQK'
_BPC = ' pnbrqk'

def _clr(p):
    return 0 if p > 0 else (1 if p < 0 else -1)

def _sgn(c):
    return 1 if c == 0 else -1

def _sq(r, f):
    return chr(ord('a') + f) + chr(ord('1') + r)

def _parse_sq(s):
    if len(s) < 2:
        return None
    f, r = ord(s[0]) - ord('a'), ord(s[1]) - ord('1')
    if 0 <= f < 8 and 0 <= r < 8:
        return r, f
    return None

class Chess:
    def __init__(self):
        self.new_game()

    def new_game(self):
        self._b = [[0]*8 for _ in range(8)]
        for f in range(8):
            self._b[0][f] = _BACK[f]
            self._b[1][f] = 1
            self._b[6][f] = -1
            self._b[7][f] = -_BACK[f]
        self._turn = 0
        self._cr = [True, True, True, True]  # WK, WQ, BK, BQ
        self._epf = -1
        self._hm = 0
        self._hist = []

    def _attacked(self, r, f, by_c):
        b = self._b
        s = _sgn(by_c)
        pr = r + (-1 if by_c == 0 else 1)
        if 0 <= pr < 8:
            if f > 0 and b[pr][f-1] == s:   return True
            if f < 7 and b[pr][f+1] == s:   return True
        for dr, df in _KN:
            nr, nf = r+dr, f+df
            if 0<=nr<8 and 0<=nf<8 and b[nr][nf] == s*2: return True
        for dr, df in _DD:
            for i in range(1, 8):
                nr, nf = r+dr*i, f+df*i
                if not (0<=nr<8 and 0<=nf<8): break
                if b[nr][nf]:
                    if b[nr][nf] in (s*3, s*5): return True
                    break
        for dr, df in _RD:
            for i in range(1, 8):
                nr, nf = r+dr*i, f+df*i
                if not (0<=nr<8 and 0<=nf<8): break
                if b[nr][nf]:
                    if b[nr][nf] in (s*4, s*5): return True
                    break
        for dr in range(-1, 2):
            for df in range(-1, 2):
                if dr == 0 and df == 0: continue
                nr, nf = r+dr, f+df
                if 0<=nr<8 and 0<=nf<8 and b[nr][nf] == s*6: return True
        return False

    def _find_king(self, c):
        k = _sgn(c) * 6
        for r in range(8):
            for f in range(8):
                if self._b[r][f] == k:
                    return r, f
        return -1, -1

    def _in_check(self, c):
        r, f = self._find_king(c)
        return r >= 0 and self._attacked(r, f, 1-c)

    def _save(self):
        return ([row[:] for row in self._b], self._cr[:], self._epf, self._hm)

    def _restore(self, state):
        b, cr, epf, hm = state
        self._b = [row[:] for row in b]
        self._cr = cr[:]
        self._epf = epf
        self._hm = hm

    def _pseudo_moves(self, c):
        b = self._b
        s = _sgn(c)
        d = 1 if c == 0 else -1
        start_r = 1 if c == 0 else 6
        promo_r = 7 if c == 0 else 0
        mv = []

        def slide(r, f, dirs):
            for dr, df in dirs:
                for k in range(1, 8):
                    nr, nf = r+dr*k, f+df*k
                    if not (0<=nr<8 and 0<=nf<8): break
                    if _clr(b[nr][nf]) == c: break
                    mv.append((r, f, nr, nf, 0))
                    if b[nr][nf]: break

        for r in range(8):
            for f in range(8):
                if _clr(b[r][f]) != c: continue
                p = b[r][f] * s

                if p == 1:
                    nr = r + d
                    if not (0 <= nr < 8): continue
                    if not b[nr][f]:
                        if nr == promo_r:
                            for pr in (5, 4, 3, 2): mv.append((r, f, nr, f, pr))
                        else:
                            mv.append((r, f, nr, f, 0))
                            if r == start_r and not b[r+2*d][f]:
                                mv.append((r, f, r+2*d, f, 0))
                    for df in (-1, 1):
                        nf = f + df
                        if not (0 <= nf < 8): continue
                        if b[nr][nf] and _clr(b[nr][nf]) != c:
                            if nr == promo_r:
                                for pr in (5, 4, 3, 2): mv.append((r, f, nr, nf, pr))
                            else:
                                mv.append((r, f, nr, nf, 0))
                        if self._epf == nf and ((c==0 and r==4) or (c==1 and r==3)):
                            mv.append((r, f, nr, nf, 0))

                elif p == 2:
                    for dr, df in _KN:
                        nr, nf = r+dr, f+df
                        if 0<=nr<8 and 0<=nf<8 and _clr(b[nr][nf]) != c:
                            mv.append((r, f, nr, nf, 0))

                elif p == 3: slide(r, f, _DD)
                elif p == 4: slide(r, f, _RD)
                elif p == 5: slide(r, f, _DD); slide(r, f, _RD)
                elif p == 6:
                    for dr in range(-1, 2):
                        for df in range(-1, 2):
                            if dr == 0 and df == 0: continue
                            nr, nf = r+dr, f+df
                            if 0<=nr<8 and 0<=nf<8 and _clr(b[nr][nf]) != c:
                                mv.append((r, f, nr, nf, 0))
                    rank = 0 if c == 0 else 7
                    if r == rank and f == 4:
                        if (self._cr[c*2] and not b[rank][5] and not b[rank][6]
                                and not self._attacked(rank,4,1-c)
                                and not self._attacked(rank,5,1-c)
                                and not self._attacked(rank,6,1-c)):
                            mv.append((r, f, rank, 6, 0))
                        if (self._cr[c*2+1] and not b[rank][3] and not b[rank][2] and not b[rank][1]
                                and not self._attacked(rank,4,1-c)
                                and not self._attacked(rank,3,1-c)
                                and not self._attacked(rank,2,1-c)):
                            mv.append((r, f, rank, 2, 0))
        return mv

    def _apply_move(self, m):
        fr, ff, tr, tf, promo = m
        b = self._b
        s = _sgn(self._turn)
        p = b[fr][ff] * s
        is_ep = (p == 1 and tf == self._epf and ff != tf and not b[tr][tf])
        is_castle = (p == 6 and abs(tf - ff) == 2)

        self._epf = -1
        if p == 1 and abs(tr - fr) == 2:
            self._epf = ff

        if p == 1 or b[tr][tf] or is_ep:
            self._hm = 0
        else:
            self._hm += 1

        if p == 6: self._cr[self._turn*2] = self._cr[self._turn*2+1] = False
        if fr==0 and ff==0: self._cr[1] = False
        if fr==0 and ff==7: self._cr[0] = False
        if fr==7 and ff==0: self._cr[3] = False
        if fr==7 and ff==7: self._cr[2] = False
        if tr==0 and tf==0: self._cr[1] = False
        if tr==0 and tf==7: self._cr[0] = False
        if tr==7 and tf==0: self._cr[3] = False
        if tr==7 and tf==7: self._cr[2] = False

        b[tr][tf] = s * promo if promo else b[fr][ff]
        b[fr][ff] = 0

        if is_ep:    b[fr][tf] = 0
        if is_castle:
            rk = fr
            if tf == 6: b[rk][5] = b[rk][7]; b[rk][7] = 0
            else:       b[rk][3] = b[rk][0]; b[rk][0] = 0

        return not self._in_check(self._turn)

    def _legal_moves(self, c):
        saved_turn = self._turn
        self._turn = c
        legal = []
        for m in self._pseudo_moves(c):
            st = self._save()
            if self._apply_move(m):
                legal.append(m)
            self._restore(st)
        self._turn = saved_turn
        return legal

    def move(self, uci):
        if len(uci) < 4: return 'ILLEGAL'
        sq1 = _parse_sq(uci[:2])
        sq2 = _parse_sq(uci[2:4])
        if sq1 is None or sq2 is None: return 'ILLEGAL'
        fr, ff = sq1
        tr, tf = sq2
        promo = 0
        if len(uci) >= 5:
            c = uci[4].lower()
            promo = {'q':5,'r':4,'b':3,'n':2}.get(c, 0)

        for m in self._pseudo_moves(self._turn):
            if m[0]!=fr or m[1]!=ff or m[2]!=tr or m[3]!=tf: continue
            if m[4]:
                want = promo if promo else 5
                if m[4] != want: continue
            st = self._save()
            if not self._apply_move(m):
                self._restore(st)
                continue
            self._hist.append(uci[:4])
            self._turn = 1 - self._turn
            lm = self._legal_moves(self._turn)
            if not lm:
                return 'CHECKMATE' if self._in_check(self._turn) else 'STALEMATE'
            if self._hm >= 100: return 'DRAW'
            return 'OK'
        return 'ILLEGAL'

    def print_board(self):
        out = ''
        for r in range(7, -1, -1):
            for f in range(8):
                p = self._b[r][f]
                out += '.' if p == 0 else (_WPC[p] if p > 0 else _BPC[-p])
            out += '\n'
        return out

    def moves(self, sq):
        parsed = _parse_sq(sq)
        if not parsed: return ''
        r, f = parsed
        legal = self._legal_moves(self._turn)
        dests = sorted({_sq(m[2], m[3]) for m in legal if m[0]==r and m[1]==f})
        return ' '.join(dests)

    def status(self):
        if self._in_check(self._turn):
            return 'CHECKMATE' if not self._legal_moves(self._turn) else 'CHECK'
        if not self._legal_moves(self._turn): return 'STALEMATE'
        if self._hm >= 100: return 'DRAW'
        return 'WHITE_TO_MOVE' if self._turn == 0 else 'BLACK_TO_MOVE'

    def history(self):
        return ''.join(m + '\n' for m in self._hist)
