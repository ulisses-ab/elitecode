// Board: b[rank][file], rank 0 = rank 1 (chess), rank 7 = rank 8
// Pieces: 0=empty, 1=P, 2=N, 3=B, 4=R, 5=Q, 6=K
// Positive = white, negative = black

const KN: [(i32,i32);8] = [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)];
const DD: [(i32,i32);4] = [(1,1),(1,-1),(-1,1),(-1,-1)];
const RD: [(i32,i32);4] = [(1,0),(-1,0),(0,1),(0,-1)];
const BACK: [i32;8] = [4,2,3,5,6,3,2,4];
const WPC: &[u8] = b" PNBRQK";
const BPC: &[u8] = b" pnbrqk";

fn clr(p: i32) -> i32 { if p > 0 { 0 } else if p < 0 { 1 } else { -1 } }
fn sgn(c: i32) -> i32 { if c == 0 { 1 } else { -1 } }

fn sq_name(r: i32, f: i32) -> String {
    format!("{}{}", (b'a' + f as u8) as char, (b'1' + r as u8) as char)
}

fn parse_sq(s: &str) -> Option<(i32, i32)> {
    let b = s.as_bytes();
    if b.len() < 2 { return None; }
    let f = b[0] as i32 - b'a' as i32;
    let r = b[1] as i32 - b'1' as i32;
    if (0..8).contains(&f) && (0..8).contains(&r) { Some((r, f)) } else { None }
}

#[derive(Clone)]
struct SaveState {
    board: [[i32;8];8],
    cr: [bool;4],
    epf: i32,
    hm: i32,
}

pub struct Chess {
    b: [[i32;8];8],
    turn: i32,
    cr: [bool;4],
    epf: i32,
    hm: i32,
    hist: Vec<String>,
}

impl Chess {
    pub fn new() -> Self {
        let mut c = Chess { b: [[0;8];8], turn: 0, cr: [true;4], epf: -1, hm: 0, hist: vec![] };
        c.new_game();
        c
    }

    pub fn new_game(&mut self) {
        self.b = [[0;8];8];
        for f in 0..8usize {
            self.b[0][f] = BACK[f];
            self.b[1][f] = 1;
            self.b[6][f] = -1;
            self.b[7][f] = -BACK[f];
        }
        self.turn = 0; self.cr = [true;4]; self.epf = -1; self.hm = 0; self.hist.clear();
    }

    fn attacked(&self, r: i32, f: i32, by_c: i32) -> bool {
        let b = &self.b;
        let s = sgn(by_c);
        let pr = r + if by_c == 0 { -1 } else { 1 };
        if (0..8).contains(&pr) {
            if f > 0 && b[pr as usize][(f-1) as usize] == s   { return true; }
            if f < 7 && b[pr as usize][(f+1) as usize] == s   { return true; }
        }
        for (dr, df) in &KN {
            let (nr, nf) = (r+dr, f+df);
            if (0..8).contains(&nr) && (0..8).contains(&nf) && b[nr as usize][nf as usize] == s*2 { return true; }
        }
        for (dr, df) in &DD {
            for k in 1..8 {
                let (nr, nf) = (r+dr*k, f+df*k);
                if !(0..8).contains(&nr) || !(0..8).contains(&nf) { break; }
                let p = b[nr as usize][nf as usize];
                if p != 0 { if p == s*3 || p == s*5 { return true; } break; }
            }
        }
        for (dr, df) in &RD {
            for k in 1..8 {
                let (nr, nf) = (r+dr*k, f+df*k);
                if !(0..8).contains(&nr) || !(0..8).contains(&nf) { break; }
                let p = b[nr as usize][nf as usize];
                if p != 0 { if p == s*4 || p == s*5 { return true; } break; }
            }
        }
        for dr in -1..=1i32 { for df in -1..=1i32 {
            if dr == 0 && df == 0 { continue; }
            let (nr, nf) = (r+dr, f+df);
            if (0..8).contains(&nr) && (0..8).contains(&nf) && b[nr as usize][nf as usize] == s*6 { return true; }
        }}
        false
    }

    fn find_king(&self, c: i32) -> (i32, i32) {
        let k = sgn(c) * 6;
        for r in 0..8i32 { for f in 0..8i32 { if self.b[r as usize][f as usize] == k { return (r, f); } } }
        (-1, -1)
    }

    fn in_check(&self, c: i32) -> bool {
        let (r, f) = self.find_king(c);
        r >= 0 && self.attacked(r, f, 1-c)
    }

    fn save(&self) -> SaveState {
        SaveState { board: self.b, cr: self.cr, epf: self.epf, hm: self.hm }
    }

    fn restore(&mut self, st: &SaveState) {
        self.b = st.board; self.cr = st.cr; self.epf = st.epf; self.hm = st.hm;
    }

    fn pseudo_moves(&self, c: i32) -> Vec<(i32,i32,i32,i32,i32)> {
        let b = &self.b;
        let s = sgn(c);
        let dir = if c == 0 { 1i32 } else { -1 };
        let start_r = if c == 0 { 1i32 } else { 6 };
        let promo_r = if c == 0 { 7i32 } else { 0 };
        let mut mv: Vec<(i32,i32,i32,i32,i32)> = Vec::new();

        for r in 0..8i32 { for f in 0..8i32 {
            if clr(b[r as usize][f as usize]) != c { continue; }
            let p = b[r as usize][f as usize] * s;

            match p {
                1 => {
                    let nr = r + dir;
                    if !(0..8).contains(&nr) { continue; }
                    if b[nr as usize][f as usize] == 0 {
                        if nr == promo_r {
                            for pr in [5,4,3,2] { mv.push((r,f,nr,f,pr)); }
                        } else {
                            mv.push((r,f,nr,f,0));
                            if r == start_r && b[(r+2*dir) as usize][f as usize] == 0 {
                                mv.push((r,f,r+2*dir,f,0));
                            }
                        }
                    }
                    for df in [-1i32,1] {
                        let nf = f + df;
                        if !(0..8).contains(&nf) { continue; }
                        if b[nr as usize][nf as usize] != 0 && clr(b[nr as usize][nf as usize]) != c {
                            if nr == promo_r { for pr in [5,4,3,2] { mv.push((r,f,nr,nf,pr)); } }
                            else { mv.push((r,f,nr,nf,0)); }
                        }
                        if self.epf == nf && ((c==0 && r==4) || (c==1 && r==3)) {
                            mv.push((r,f,nr,nf,0));
                        }
                    }
                }
                2 => {
                    for (dr,df) in &KN {
                        let (nr,nf) = (r+dr,f+df);
                        if (0..8).contains(&nr) && (0..8).contains(&nf) && clr(b[nr as usize][nf as usize]) != c {
                            mv.push((r,f,nr,nf,0));
                        }
                    }
                }
                3 | 4 | 5 => {
                    let dirs: &[(i32,i32)] = match p { 3 => &DD, 4 => &RD, _ => &[] };
                    let both = p == 5;
                    let slide = |dirs: &[(i32,i32)], mv: &mut Vec<_>| {
                        for (dr,df) in dirs { for k in 1..8i32 {
                            let (nr,nf) = (r+dr*k,f+df*k);
                            if !(0..8).contains(&nr)||!(0..8).contains(&nf) { break; }
                            if clr(b[nr as usize][nf as usize]) == c { break; }
                            mv.push((r,f,nr,nf,0));
                            if b[nr as usize][nf as usize] != 0 { break; }
                        }}
                    };
                    if both { slide(&DD, &mut mv); slide(&RD, &mut mv); }
                    else { slide(dirs, &mut mv); }
                }
                6 => {
                    for dr in -1..=1i32 { for df in -1..=1i32 {
                        if dr==0 && df==0 { continue; }
                        let (nr,nf) = (r+dr,f+df);
                        if (0..8).contains(&nr) && (0..8).contains(&nf) && clr(b[nr as usize][nf as usize]) != c {
                            mv.push((r,f,nr,nf,0));
                        }
                    }}
                    let rank = if c == 0 { 0i32 } else { 7 };
                    if r == rank && f == 4 {
                        if self.cr[(c*2) as usize] && b[rank as usize][5]==0 && b[rank as usize][6]==0
                            && !self.attacked(rank,4,1-c) && !self.attacked(rank,5,1-c) && !self.attacked(rank,6,1-c) {
                            mv.push((r,f,rank,6,0));
                        }
                        if self.cr[(c*2+1) as usize] && b[rank as usize][3]==0 && b[rank as usize][2]==0 && b[rank as usize][1]==0
                            && !self.attacked(rank,4,1-c) && !self.attacked(rank,3,1-c) && !self.attacked(rank,2,1-c) {
                            mv.push((r,f,rank,2,0));
                        }
                    }
                }
                _ => {}
            }
        }}
        mv
    }

    fn apply_move(&mut self, m: (i32,i32,i32,i32,i32)) -> bool {
        let (fr,ff,tr,tf,promo) = m;
        let s = sgn(self.turn);
        let p = self.b[fr as usize][ff as usize] * s;
        let is_ep = p == 1 && tf == self.epf && ff != tf && self.b[tr as usize][tf as usize] == 0;
        let is_castle = p == 6 && (tf - ff).abs() == 2;

        self.epf = -1;
        if p == 1 && (tr - fr).abs() == 2 { self.epf = ff; }

        if p == 1 || self.b[tr as usize][tf as usize] != 0 || is_ep { self.hm = 0; } else { self.hm += 1; }

        if p == 6 { self.cr[(self.turn*2) as usize] = false; self.cr[(self.turn*2+1) as usize] = false; }
        if fr==0&&ff==0 { self.cr[1]=false; } if fr==0&&ff==7 { self.cr[0]=false; }
        if fr==7&&ff==0 { self.cr[3]=false; } if fr==7&&ff==7 { self.cr[2]=false; }
        if tr==0&&tf==0 { self.cr[1]=false; } if tr==0&&tf==7 { self.cr[0]=false; }
        if tr==7&&tf==0 { self.cr[3]=false; } if tr==7&&tf==7 { self.cr[2]=false; }

        self.b[tr as usize][tf as usize] = if promo != 0 { s*promo } else { self.b[fr as usize][ff as usize] };
        self.b[fr as usize][ff as usize] = 0;

        if is_ep { self.b[fr as usize][tf as usize] = 0; }
        if is_castle {
            let rk = fr as usize;
            if tf == 6 { self.b[rk][5] = self.b[rk][7]; self.b[rk][7] = 0; }
            else        { self.b[rk][3] = self.b[rk][0]; self.b[rk][0] = 0; }
        }

        !self.in_check(self.turn)
    }

    fn legal_moves(&mut self, c: i32) -> Vec<(i32,i32,i32,i32,i32)> {
        let saved_turn = self.turn;
        self.turn = c;
        let pseudo = self.pseudo_moves(c);
        let mut legal = vec![];
        for m in pseudo {
            let st = self.save();
            if self.apply_move(m) { legal.push(m); }
            self.restore(&st);
        }
        self.turn = saved_turn;
        legal
    }

    pub fn make_move(&mut self, uci: &str) -> String {
        if uci.len() < 4 { return "ILLEGAL".into(); }
        let (fr, ff) = match parse_sq(&uci[..2]) { Some(v) => v, None => return "ILLEGAL".into() };
        let (tr, tf) = match parse_sq(&uci[2..4]) { Some(v) => v, None => return "ILLEGAL".into() };
        let promo = if uci.len() >= 5 {
            match uci.as_bytes()[4].to_ascii_lowercase() {
                b'q' => 5, b'r' => 4, b'b' => 3, b'n' => 2, _ => 0
            }
        } else { 0 };

        let pseudo = self.pseudo_moves(self.turn);
        for m in pseudo {
            if m.0!=fr||m.1!=ff||m.2!=tr||m.3!=tf { continue; }
            if m.4 != 0 {
                let want = if promo != 0 { promo } else { 5 };
                if m.4 != want { continue; }
            }
            let st = self.save();
            if !self.apply_move(m) { self.restore(&st); continue; }

            self.hist.push(uci[..4].to_string());
            self.turn = 1 - self.turn;
            let lm = self.legal_moves(self.turn);
            if lm.is_empty() {
                return if self.in_check(self.turn) { "CHECKMATE".into() } else { "STALEMATE".into() };
            }
            if self.hm >= 100 { return "DRAW".into(); }
            return "OK".into();
        }
        "ILLEGAL".into()
    }

    pub fn print_board(&self) -> String {
        let mut out = String::new();
        for r in (0..8i32).rev() {
            for f in 0..8i32 {
                let p = self.b[r as usize][f as usize];
                out.push(if p == 0 { '.' } else if p > 0 { WPC[p as usize] as char } else { BPC[(-p) as usize] as char });
            }
            out.push('\n');
        }
        out
    }

    pub fn moves(&mut self, sq: &str) -> String {
        let (r, f) = match parse_sq(sq) { Some(v) => v, None => return String::new() };
        let legal = self.legal_moves(self.turn);
        let mut dests: Vec<String> = legal.iter()
            .filter(|m| m.0==r && m.1==f)
            .map(|m| sq_name(m.2, m.3))
            .collect::<std::collections::BTreeSet<_>>()
            .into_iter().collect();
        dests.sort();
        dests.join(" ")
    }

    pub fn status(&mut self) -> String {
        if self.in_check(self.turn) {
            return if self.legal_moves(self.turn).is_empty() { "CHECKMATE".into() } else { "CHECK".into() };
        }
        if self.legal_moves(self.turn).is_empty() { return "STALEMATE".into(); }
        if self.hm >= 100 { return "DRAW".into(); }
        if self.turn == 0 { "WHITE_TO_MOVE".into() } else { "BLACK_TO_MOVE".into() }
    }

    pub fn history(&self) -> String {
        self.hist.iter().map(|m| format!("{}\n", m)).collect()
    }
}
