// Full chess engine solution
#include <bits/stdc++.h>

// Board: b[rank][file], rank 0 = rank 1 (chess), rank 7 = rank 8
// Pieces: 0=empty, 1=P, 2=N, 3=B, 4=R, 5=Q, 6=K
// Positive = white, negative = black

class Chess {
    int b[8][8];
    int turn;     // 0=white, 1=black
    bool cr[4];   // castling rights: [0]=WK, [1]=WQ, [2]=BK, [3]=BQ
    int epf;      // en passant target file (-1 = none)
    int hm;       // half-move clock (fifty-move rule)
    std::vector<std::string> hist;

    int clr(int p)  const { return p > 0 ? 0 : (p < 0 ? 1 : -1); }
    int sgn(int c)  const { return c == 0 ? 1 : -1; }
    int absp(int p) const { return p < 0 ? -p : p; }

    // Is square (r,f) attacked by color byC?
    bool attacked(int r, int f, int byC) const {
        int s = sgn(byC);
        // Pawns
        int pr = r + (byC == 0 ? -1 : 1);
        if (pr >= 0 && pr < 8) {
            if (f > 0 && b[pr][f-1] == s)   return true; // s*1
            if (f < 7 && b[pr][f+1] == s)   return true;
        }
        // Knights
        static const int KN[8][2] = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};
        for (auto& d : KN) {
            int nr = r+d[0], nf = f+d[1];
            if (nr>=0&&nr<8&&nf>=0&&nf<8 && b[nr][nf] == s*2) return true;
        }
        // Diagonal sliders (bishop / queen)
        static const int DD[4][2] = {{1,1},{1,-1},{-1,1},{-1,-1}};
        for (auto& d : DD) {
            for (int i = 1; i < 8; i++) {
                int nr = r+d[0]*i, nf = f+d[1]*i;
                if (nr<0||nr>=8||nf<0||nf>=8) break;
                if (b[nr][nf]) { if (b[nr][nf]==s*3||b[nr][nf]==s*5) return true; break; }
            }
        }
        // Straight sliders (rook / queen)
        static const int RD[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
        for (auto& d : RD) {
            for (int i = 1; i < 8; i++) {
                int nr = r+d[0]*i, nf = f+d[1]*i;
                if (nr<0||nr>=8||nf<0||nf>=8) break;
                if (b[nr][nf]) { if (b[nr][nf]==s*4||b[nr][nf]==s*5) return true; break; }
            }
        }
        // King
        for (int dr = -1; dr <= 1; dr++) for (int df = -1; df <= 1; df++) {
            if (!dr && !df) continue;
            int nr = r+dr, nf = f+df;
            if (nr>=0&&nr<8&&nf>=0&&nf<8 && b[nr][nf] == s*6) return true;
        }
        return false;
    }

    std::pair<int,int> findKing(int c) const {
        int k = sgn(c) * 6;
        for (int r = 0; r < 8; r++) for (int f = 0; f < 8; f++)
            if (b[r][f] == k) return {r, f};
        return {-1, -1};
    }

    bool inCheck(int c) const {
        auto [r, f] = findKing(c);
        return r >= 0 && attacked(r, f, 1-c);
    }

    struct UndoInfo { int board[8][8]; bool cr[4]; int epf, hm; };
    UndoInfo save() const {
        UndoInfo u;
        memcpy(u.board, b, sizeof(b));
        memcpy(u.cr, cr, sizeof(cr));
        u.epf = epf; u.hm = hm;
        return u;
    }
    void restore(const UndoInfo& u) {
        memcpy(b, u.board, sizeof(b));
        memcpy(cr, u.cr, sizeof(cr));
        epf = u.epf; hm = u.hm;
    }

    struct Move { int fr, ff, tr, tf, promo; };

    std::vector<Move> pseudoMoves(int c) const {
        std::vector<Move> mv;
        int s = sgn(c);
        int dir = (c == 0) ? 1 : -1;
        int startR = (c == 0) ? 1 : 6;
        int promoR = (c == 0) ? 7 : 0;

        auto add = [&](int fr, int ff, int tr, int tf, int pr = 0) {
            mv.push_back({fr, ff, tr, tf, pr});
        };
        auto slide = [&](int r, int f, const int dirs[][2], int nd) {
            for (int i = 0; i < nd; i++)
                for (int k = 1; k < 8; k++) {
                    int nr = r+dirs[i][0]*k, nf = f+dirs[i][1]*k;
                    if (nr<0||nr>=8||nf<0||nf>=8) break;
                    if (clr(b[nr][nf]) == c) break;
                    add(r, f, nr, nf);
                    if (b[nr][nf]) break;
                }
        };

        static const int DD[4][2] = {{1,1},{1,-1},{-1,1},{-1,-1}};
        static const int RD[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
        static const int KN[8][2] = {{-2,-1},{-2,1},{-1,-2},{-1,2},{1,-2},{1,2},{2,-1},{2,1}};

        for (int r = 0; r < 8; r++) for (int f = 0; f < 8; f++) {
            if (clr(b[r][f]) != c) continue;
            int p = b[r][f] * s;

            if (p == 1) {
                int nr = r + dir;
                if (nr < 0 || nr >= 8) continue;
                if (!b[nr][f]) {
                    if (nr == promoR) { for (int pr : {5,4,3,2}) add(r,f,nr,f,pr); }
                    else {
                        add(r, f, nr, f);
                        if (r == startR && !b[r+2*dir][f]) add(r, f, r+2*dir, f);
                    }
                }
                for (int df : {-1, 1}) {
                    int nf = f + df;
                    if (nf < 0 || nf >= 8) continue;
                    if (b[nr][nf] && clr(b[nr][nf]) != c) {
                        if (nr == promoR) { for (int pr : {5,4,3,2}) add(r,f,nr,nf,pr); }
                        else add(r, f, nr, nf);
                    }
                    if (epf == nf && ((c==0 && r==4) || (c==1 && r==3)))
                        add(r, f, nr, nf);
                }
            } else if (p == 2) {
                for (auto& d : KN) {
                    int nr = r+d[0], nf = f+d[1];
                    if (nr>=0&&nr<8&&nf>=0&&nf<8 && clr(b[nr][nf]) != c) add(r,f,nr,nf);
                }
            } else if (p == 3) { slide(r, f, DD, 4); }
            else if (p == 4) { slide(r, f, RD, 4); }
            else if (p == 5) { slide(r, f, DD, 4); slide(r, f, RD, 4); }
            else if (p == 6) {
                for (int dr = -1; dr <= 1; dr++) for (int df = -1; df <= 1; df++) {
                    if (!dr && !df) continue;
                    int nr = r+dr, nf = f+df;
                    if (nr>=0&&nr<8&&nf>=0&&nf<8 && clr(b[nr][nf]) != c) add(r,f,nr,nf);
                }
                int rank = (c == 0) ? 0 : 7;
                if (r == rank && f == 4) {
                    // Kingside castle
                    if (cr[c*2] && !b[rank][5] && !b[rank][6] &&
                        !attacked(rank,4,1-c) && !attacked(rank,5,1-c) && !attacked(rank,6,1-c))
                        add(r, f, rank, 6);
                    // Queenside castle
                    if (cr[c*2+1] && !b[rank][3] && !b[rank][2] && !b[rank][1] &&
                        !attacked(rank,4,1-c) && !attacked(rank,3,1-c) && !attacked(rank,2,1-c))
                        add(r, f, rank, 2);
                }
            }
        }
        return mv;
    }

    // Apply move to board; returns false if it leaves own king in check (illegal)
    bool applyMove(Move m) {
        int s = sgn(turn);
        int p = b[m.fr][m.ff] * s;
        bool isEP = (p == 1 && m.tf == epf && m.ff != m.tf && !b[m.tr][m.tf]);
        bool isCastle = (p == 6 && std::abs(m.tf - m.ff) == 2);

        epf = -1;
        if (p == 1 && std::abs(m.tr - m.fr) == 2) epf = m.ff;

        if (p == 1 || b[m.tr][m.tf] || isEP) hm = 0; else hm++;

        // Update castling rights
        if (p == 6) { cr[turn*2] = cr[turn*2+1] = false; }
        if (m.fr==0&&m.ff==0) cr[1]=false;
        if (m.fr==0&&m.ff==7) cr[0]=false;
        if (m.fr==7&&m.ff==0) cr[3]=false;
        if (m.fr==7&&m.ff==7) cr[2]=false;
        if (m.tr==0&&m.tf==0) cr[1]=false;
        if (m.tr==0&&m.tf==7) cr[0]=false;
        if (m.tr==7&&m.tf==0) cr[3]=false;
        if (m.tr==7&&m.tf==7) cr[2]=false;

        b[m.tr][m.tf] = m.promo ? s * m.promo : b[m.fr][m.ff];
        b[m.fr][m.ff] = 0;

        if (isEP)     b[m.fr][m.tf] = 0; // remove captured pawn
        if (isCastle) {
            int rk = m.fr;
            if (m.tf == 6) { b[rk][5] = b[rk][7]; b[rk][7] = 0; }
            else            { b[rk][3] = b[rk][0]; b[rk][0] = 0; }
        }

        return !inCheck(turn);
    }

    std::vector<Move> legalMoves(int c) {
        auto pseudo = pseudoMoves(c);
        std::vector<Move> legal;
        int savedTurn = turn; turn = c;
        for (auto& m : pseudo) {
            auto st = save();
            if (applyMove(m)) legal.push_back(m);
            restore(st);
        }
        turn = savedTurn;
        return legal;
    }

    static std::string sqName(int r, int f) {
        std::string s; s += (char)('a'+f); s += (char)('1'+r); return s;
    }
    static bool parseSq(const std::string& s, int& r, int& f) {
        if (s.size() < 2) return false;
        f = s[0]-'a'; r = s[1]-'1';
        return f>=0&&f<8&&r>=0&&r<8;
    }

public:
    Chess() { newGame(); }

    void newGame() {
        memset(b, 0, sizeof(b));
        static const int BACK[] = {4,2,3,5,6,3,2,4};
        for (int f = 0; f < 8; f++) { b[0][f] = BACK[f]; b[1][f] = 1; b[6][f] = -1; b[7][f] = -BACK[f]; }
        turn = 0; cr[0]=cr[1]=cr[2]=cr[3]=true; epf=-1; hm=0; hist.clear();
    }

    // Returns "OK", "ILLEGAL", "CHECKMATE", "STALEMATE", "DRAW"
    std::string move(const std::string& mv) {
        if (mv.size() < 4) return "ILLEGAL";
        int fr, ff, tr, tf;
        if (!parseSq(mv.substr(0,2), fr, ff)) return "ILLEGAL";
        if (!parseSq(mv.substr(2,2), tr, tf)) return "ILLEGAL";
        int promo = 0;
        if (mv.size() >= 5) {
            char c = mv[4];
            if (c=='q'||c=='Q') promo=5; else if (c=='r'||c=='R') promo=4;
            else if (c=='b'||c=='B') promo=3; else if (c=='n'||c=='N') promo=2;
        }

        auto pseudo = pseudoMoves(turn);
        for (auto m : pseudo) {
            if (m.fr!=fr||m.ff!=ff||m.tr!=tr||m.tf!=tf) continue;
            if (m.promo) {
                int want = promo ? promo : 5; // default queen
                if (m.promo != want) continue;
            }
            auto st = save();
            if (!applyMove(m)) { restore(st); continue; }

            hist.push_back(mv.substr(0, 4));
            turn = 1 - turn;

            auto lm = legalMoves(turn);
            if (lm.empty()) {
                if (inCheck(turn)) return "CHECKMATE";
                return "STALEMATE";
            }
            if (hm >= 100) return "DRAW";
            return "OK";
        }
        return "ILLEGAL";
    }

    std::string print() const {
        static const char* WPC = " PNBRQK";
        static const char* BPC = " pnbrqk";
        std::string out;
        for (int r = 7; r >= 0; r--) {
            for (int f = 0; f < 8; f++) {
                int p = b[r][f];
                out += !p ? '.' : (p > 0 ? WPC[p] : BPC[-p]);
            }
            out += '\n';
        }
        return out;
    }

    std::string moves(const std::string& sq) {
        int r, f;
        if (!parseSq(sq, r, f)) return "";
        auto legal = legalMoves(turn);
        std::set<std::string> dests;
        for (auto& m : legal)
            if (m.fr==r && m.ff==f) dests.insert(sqName(m.tr, m.tf));
        std::string out;
        for (auto& s : dests) { if (!out.empty()) out+=' '; out+=s; }
        return out;
    }

    std::string status() {
        if (inCheck(turn)) {
            if (legalMoves(turn).empty()) return "CHECKMATE";
            return "CHECK";
        }
        if (legalMoves(turn).empty()) return "STALEMATE";
        if (hm >= 100) return "DRAW";
        return turn == 0 ? "WHITE_TO_MOVE" : "BLACK_TO_MOVE";
    }

    std::string history() {
        std::string out;
        for (auto& m : hist) out += m + '\n';
        return out;
    }
};
