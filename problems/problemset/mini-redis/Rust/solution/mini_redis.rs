use std::collections::{HashMap, VecDeque, BTreeSet};
use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};

const WRONGTYPE: &str = "WRONGTYPE Operation against a key holding the wrong kind of value";

#[derive(Clone, PartialEq)]
enum EType { Str, List, Set, ZSet }

struct Entry {
    etype:     EType,
    str_val:   String,
    list_val:  VecDeque<String>,
    set_val:   BTreeSet<String>,
    zset_val:  HashMap<String, f64>,
    expire_at: i64,
}

impl Entry {
    fn new(t: EType) -> Self {
        Entry { etype: t, str_val: String::new(), list_val: VecDeque::new(),
                set_val: BTreeSet::new(), zset_val: HashMap::new(), expire_at: -1 }
    }
}

struct Store {
    data: HashMap<String, Entry>,
    now:  i64,
}

impl Store {
    fn new() -> Self { Store { data: HashMap::new(), now: 0 } }

    fn dead(&self, k: &str) -> bool {
        match self.data.get(k) {
            None    => true,
            Some(e) => e.expire_at >= 0 && e.expire_at <= self.now,
        }
    }

    fn alive(&mut self, k: &str) -> bool {
        if self.dead(k) { self.data.remove(k); false } else { true }
    }

    fn get(&mut self, k: &str) -> Option<&Entry> {
        if self.dead(k) { self.data.remove(k); None } else { self.data.get(k) }
    }

    fn get_mut(&mut self, k: &str) -> Option<&mut Entry> {
        if self.dead(k) { self.data.remove(k); None } else { self.data.get_mut(k) }
    }

    fn make(&mut self, k: &str, t: EType) -> &mut Entry {
        if self.dead(k) { self.data.remove(k); self.data.insert(k.to_string(), Entry::new(t)); }
        else if !self.data.contains_key(k) { self.data.insert(k.to_string(), Entry::new(t)); }
        self.data.get_mut(k).unwrap()
    }

    fn reset(&mut self, k: &str) -> &mut Entry {
        self.data.insert(k.to_string(), Entry::new(EType::Str));
        self.data.get_mut(k).unwrap()
    }

    fn erase(&mut self, k: &str) { self.data.remove(k); }
    fn flush(&mut self) { self.data.clear(); }
    fn tick(&mut self, n: i64) { self.now += n; }
    fn time(&self) -> i64 { self.now }

    fn dbsize(&mut self) -> i64 {
        let keys: Vec<String> = self.data.keys().cloned().collect();
        keys.iter().filter(|k| self.alive(k)).count() as i64
    }
}

// ── RESP helpers ──────────────────────────────────────────────────────────────

fn read_cmd(r: &mut BufReader<TcpStream>) -> Option<Vec<String>> {
    let mut line = String::new();
    r.read_line(&mut line).ok()?;
    let line = line.trim_end_matches(|c| c == '\r' || c == '\n');
    if !line.starts_with('*') { return None; }
    let argc: usize = line[1..].parse().ok()?;
    let mut args = Vec::with_capacity(argc);
    for _ in 0..argc {
        let mut blen = String::new();
        r.read_line(&mut blen).ok()?;
        let blen = blen.trim_end_matches(|c| c == '\r' || c == '\n');
        if !blen.starts_with('$') { return None; }
        let n: usize = blen[1..].parse().ok()?;
        let mut buf = vec![0u8; n + 2];
        use std::io::Read;
        r.read_exact(&mut buf).ok()?;
        args.push(String::from_utf8_lossy(&buf[..n]).to_string());
    }
    Some(args)
}

fn w(c: &mut TcpStream, s: &str)          { c.write_all(s.as_bytes()).ok(); }
fn simple(c: &mut TcpStream, s: &str)     { w(c, &format!("+{}\r\n", s)); }
fn rerr(c: &mut TcpStream, s: &str)       { w(c, &format!("-{}\r\n", s)); }
fn rint(c: &mut TcpStream, n: i64)        { w(c, &format!(":{}\r\n", n)); }
fn rnil(c: &mut TcpStream)                { w(c, "$-1\r\n"); }
fn earr(c: &mut TcpStream)                { w(c, "*0\r\n"); }
fn bulk(c: &mut TcpStream, s: &str)       { w(c, &format!("${}\r\n{}\r\n", s.len(), s)); }
fn arr(c: &mut TcpStream, items: &[String]) {
    w(c, &format!("*{}\r\n", items.len()));
    for item in items { bulk(c, item); }
}

fn fmt_g(f: f64) -> String {
    if f.fract() == 0.0 && f.abs() < 1e15 { format!("{}", f as i64) }
    else { format!("{}", f) }
}

// ── Dispatch ─────────────────────────────────────────────────────────────────

fn dispatch(s: &mut Store, c: &mut TcpStream, args: &[String]) {
    if args.is_empty() { return; }
    let cmd = args[0].to_uppercase();
    let cmd = cmd.as_str();

    match cmd {
        "PING" => {
            if args.len() > 1 { bulk(c, &args[1]); } else { simple(c, "PONG"); }
        }
        "FLUSHALL" => { s.flush(); simple(c, "OK"); }
        "DBSIZE"   => { rint(c, s.dbsize()); }
        "DEL" => {
            let n: i64 = args[1..].iter().map(|k| { if s.alive(k) { s.erase(k); 1 } else { 0 } }).sum();
            rint(c, n);
        }
        "EXISTS" => { rint(c, args[1..].iter().filter(|k| s.alive(k)).count() as i64); }
        "TYPE" => {
            let t = s.get(&args[1]).map(|e| match e.etype {
                EType::Str => "string", EType::List => "list",
                EType::Set => "set",   EType::ZSet => "zset",
            }).unwrap_or("none");
            simple(c, t);
        }
        "EXPIRE" => {
            let now = s.now;
            match s.get_mut(&args[1]) {
                None => rint(c, 0),
                Some(e) => { e.expire_at = now + args[2].parse::<i64>().unwrap_or(0); rint(c, 1); }
            }
        }
        "TTL" => {
            match s.get(&args[1]) {
                None    => rint(c, -2),
                Some(e) => rint(c, if e.expire_at < 0 { -1 } else { e.expire_at - s.now }),
            }
        }
        "DEBUG" => {
            if args.get(1).map(|s| s.to_uppercase()) == Some("TICK".into()) {
                if let Some(n) = args.get(2).and_then(|s| s.parse::<i64>().ok()) {
                    s.tick(n); simple(c, "OK");
                } else { rerr(c, "ERR"); }
            } else { rerr(c, "ERR unknown DEBUG subcommand"); }
        }
        "SET" => {
            let now = s.now;
            let e = s.reset(&args[1]); e.etype = EType::Str; e.str_val = args[2].clone();
            let mut i = 3;
            while i + 1 < args.len() {
                if args[i].to_uppercase() == "EX" {
                    if let Ok(n) = args[i+1].parse::<i64>() { e.expire_at = now + n; }
                    i += 2;
                } else { i += 1; }
            }
            simple(c, "OK");
        }
        "GET" => {
            match s.get(&args[1]) {
                None => rnil(c),
                Some(e) if e.etype != EType::Str => rerr(c, WRONGTYPE),
                Some(e) => { let v = e.str_val.clone(); bulk(c, &v); }
            }
        }
        "MSET" => {
            let mut i = 1;
            while i + 1 < args.len() {
                let e = s.reset(&args[i]); e.etype = EType::Str; e.str_val = args[i+1].clone();
                i += 2;
            }
            simple(c, "OK");
        }
        "MGET" => {
            w(c, &format!("*{}\r\n", args.len() - 1));
            for k in &args[1..] {
                match s.get(k) {
                    Some(e) if e.etype == EType::Str => { let v = e.str_val.clone(); bulk(c, &v); }
                    _ => rnil(c),
                }
            }
        }
        "INCR" | "INCRBY" => {
            let by: i64 = if cmd == "INCRBY" { args[2].parse().unwrap_or(0) } else { 1 };
            let e = s.make(&args[1], EType::Str);
            if e.etype != EType::Str { rerr(c, WRONGTYPE); return; }
            if e.str_val.is_empty() { e.str_val = "0".to_string(); }
            match e.str_val.parse::<i64>() {
                Err(_) => { rerr(c, "ERR value is not an integer or out of range"); }
                Ok(v)  => { let nv = v + by; e.str_val = nv.to_string(); rint(c, nv); }
            }
        }
        "APPEND" => {
            let e = s.make(&args[1], EType::Str);
            if e.etype != EType::Str { rerr(c, WRONGTYPE); return; }
            e.str_val.push_str(&args[2]);
            rint(c, e.str_val.len() as i64);
        }
        "LPUSH" | "RPUSH" => {
            let e = s.make(&args[1], EType::List);
            if e.etype != EType::List { rerr(c, WRONGTYPE); return; }
            for v in &args[2..] {
                if cmd == "LPUSH" { e.list_val.push_front(v.clone()); }
                else              { e.list_val.push_back(v.clone()); }
            }
            rint(c, e.list_val.len() as i64);
        }
        "LPOP" | "RPOP" => {
            match s.get_mut(&args[1]) {
                None => rnil(c),
                Some(e) if e.list_val.is_empty() => rnil(c),
                Some(e) if e.etype != EType::List => rerr(c, WRONGTYPE),
                Some(e) => {
                    let left = cmd == "LPOP";
                    if args.len() >= 3 {
                        let mut cnt: usize = args[2].parse().unwrap_or(0);
                        let mut res = Vec::new();
                        while cnt > 0 && !e.list_val.is_empty() {
                            let v = if left { e.list_val.pop_front() } else { e.list_val.pop_back() };
                            res.push(v.unwrap()); cnt -= 1;
                        }
                        let empty = e.list_val.is_empty();
                        arr(c, &res);
                        if empty { s.erase(&args[1]); }
                    } else {
                        let v = if left { e.list_val.pop_front() } else { e.list_val.pop_back() };
                        let v = v.unwrap();
                        let empty = e.list_val.is_empty();
                        bulk(c, &v);
                        if empty { s.erase(&args[1]); }
                    }
                }
            }
        }
        "LRANGE" => {
            match s.get(&args[1]) {
                None => earr(c),
                Some(e) if e.etype != EType::List => rerr(c, WRONGTYPE),
                Some(e) => {
                    let lst: Vec<String> = e.list_val.iter().cloned().collect();
                    let ln = lst.len() as i64;
                    let mut a = args[2].parse::<i64>().unwrap_or(0);
                    let mut b = args[3].parse::<i64>().unwrap_or(-1);
                    if a < 0 { a = (ln + a).max(0); }
                    if b < 0 { b = ln + b; }
                    b = b.min(ln - 1);
                    if a > b { earr(c); return; }
                    let res: Vec<String> = lst[a as usize ..= b as usize].to_vec();
                    arr(c, &res);
                }
            }
        }
        "LLEN" => {
            match s.get(&args[1]) {
                None    => rint(c, 0),
                Some(e) if e.etype != EType::List => rerr(c, WRONGTYPE),
                Some(e) => rint(c, e.list_val.len() as i64),
            }
        }
        "SADD" => {
            let e = s.make(&args[1], EType::Set);
            if e.etype != EType::Set { rerr(c, WRONGTYPE); return; }
            let n: i64 = args[2..].iter().map(|v| if e.set_val.insert(v.clone()) { 1 } else { 0 }).sum();
            rint(c, n);
        }
        "SREM" => {
            match s.get_mut(&args[1]) {
                None    => rint(c, 0),
                Some(e) if e.etype != EType::Set => rerr(c, WRONGTYPE),
                Some(e) => {
                    let n: i64 = args[2..].iter().map(|v| if e.set_val.remove(v.as_str()) { 1 } else { 0 }).sum();
                    let empty = e.set_val.is_empty();
                    rint(c, n);
                    if empty { s.erase(&args[1]); }
                }
            }
        }
        "SMEMBERS" => {
            match s.get(&args[1]) {
                None    => earr(c),
                Some(e) if e.etype != EType::Set => rerr(c, WRONGTYPE),
                Some(e) => { let v: Vec<String> = e.set_val.iter().cloned().collect(); arr(c, &v); }
            }
        }
        "SISMEMBER" => {
            match s.get(&args[1]) {
                None    => rint(c, 0),
                Some(e) if e.etype != EType::Set => rerr(c, WRONGTYPE),
                Some(e) => rint(c, if e.set_val.contains(&args[2]) { 1 } else { 0 }),
            }
        }
        "SCARD" => {
            match s.get(&args[1]) {
                None    => rint(c, 0),
                Some(e) if e.etype != EType::Set => rerr(c, WRONGTYPE),
                Some(e) => rint(c, e.set_val.len() as i64),
            }
        }
        "ZADD" => {
            let e = s.make(&args[1], EType::ZSet);
            if e.etype != EType::ZSet { rerr(c, WRONGTYPE); return; }
            let mut n = 0i64;
            let mut i = 2;
            while i + 1 < args.len() {
                let score: f64 = args[i].parse().unwrap_or(0.0);
                let member = args[i+1].clone();
                if !e.zset_val.contains_key(&member) { n += 1; }
                e.zset_val.insert(member, score);
                i += 2;
            }
            rint(c, n);
        }
        "ZREM" => {
            match s.get_mut(&args[1]) {
                None    => rint(c, 0),
                Some(e) if e.etype != EType::ZSet => rerr(c, WRONGTYPE),
                Some(e) => {
                    let n: i64 = args[2..].iter().map(|v| if e.zset_val.remove(v.as_str()).is_some() { 1 } else { 0 }).sum();
                    let empty = e.zset_val.is_empty();
                    rint(c, n);
                    if empty { s.erase(&args[1]); }
                }
            }
        }
        "ZSCORE" => {
            match s.get(&args[1]) {
                None    => rnil(c),
                Some(e) => match e.zset_val.get(&args[2]) {
                    None    => rnil(c),
                    Some(&sc) => { let fs = fmt_g(sc); bulk(c, &fs); }
                }
            }
        }
        "ZRANK" => {
            match s.get(&args[1]) {
                None    => rnil(c),
                Some(e) if e.etype != EType::ZSet => rerr(c, WRONGTYPE),
                Some(e) => {
                    let mut srt: Vec<(f64, &String)> = e.zset_val.iter().map(|(m, &sc)| (sc, m)).collect();
                    srt.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap().then(a.1.cmp(b.1)));
                    match srt.iter().position(|(_, m)| *m == &args[2]) {
                        None    => rnil(c),
                        Some(i) => rint(c, i as i64),
                    }
                }
            }
        }
        "ZRANGE" => {
            match s.get(&args[1]) {
                None    => earr(c),
                Some(e) if e.etype != EType::ZSet => rerr(c, WRONGTYPE),
                Some(e) => {
                    let mut srt: Vec<(f64, &String)> = e.zset_val.iter().map(|(m, &sc)| (sc, m)).collect();
                    srt.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap().then(a.1.cmp(b.1)));
                    let ln = srt.len() as i64;
                    let mut a = args[2].parse::<i64>().unwrap_or(0);
                    let mut b = args[3].parse::<i64>().unwrap_or(-1);
                    if a < 0 { a = (ln + a).max(0); }
                    if b < 0 { b = ln + b; }
                    b = b.min(ln - 1);
                    let ws = args.get(4).map(|s| s.to_uppercase() == "WITHSCORES").unwrap_or(false);
                    let mut res = Vec::new();
                    for i in a..=b {
                        res.push(srt[i as usize].1.clone());
                        if ws { res.push(fmt_g(srt[i as usize].0)); }
                    }
                    if res.is_empty() { earr(c); } else { arr(c, &res); }
                }
            }
        }
        "ZCARD" => {
            match s.get(&args[1]) {
                None    => rint(c, 0),
                Some(e) if e.etype != EType::ZSet => rerr(c, WRONGTYPE),
                Some(e) => rint(c, e.zset_val.len() as i64),
            }
        }
        _ => { rerr(c, &format!("ERR unknown command '{}'", args[0])); }
    }
}

// ── Server ────────────────────────────────────────────────────────────────────

pub struct MiniRedis {
    store: Store,
}

impl MiniRedis {
    pub fn new() -> Self { MiniRedis { store: Store::new() } }

    pub fn start(&mut self, port: u16) {
        let listener = TcpListener::bind(("0.0.0.0", port)).unwrap();
        for stream in listener.incoming() {
            let Ok(stream) = stream else { continue };
            let reader_stream = stream.try_clone().unwrap();
            let mut writer = stream;
            let mut reader = BufReader::new(reader_stream);
            loop {
                match read_cmd(&mut reader) {
                    None    => break,
                    Some(args) => dispatch(&mut self.store, &mut writer, &args),
                }
            }
        }
    }
}
