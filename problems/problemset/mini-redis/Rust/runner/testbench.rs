mod mini_redis;
use mini_redis::MiniRedis;

use std::io::{self, Read, Write, BufRead, BufReader};
use std::net::TcpStream;
use std::thread;
use std::time::{Duration, Instant};

const PORT: u16 = 16379;

fn extract_json_string(json: &str, key: &str) -> String {
    let needle = format!("\"{}\":", key);
    let start = json.find(&needle).expect("key not found") + needle.len();
    let rest = json[start..].trim_start();
    assert!(rest.starts_with('"'), "expected JSON string");
    let mut out = String::new();
    let mut chars = rest[1..].chars();
    loop {
        match chars.next().expect("unterminated string") {
            '"' => break,
            '\\' => match chars.next().expect("unterminated escape") {
                'n'  => out.push('\n'),
                't'  => out.push('\t'),
                'r'  => out.push('\r'),
                '"'  => out.push('"'),
                '\\' => out.push('\\'),
                c    => out.push(c),
            },
            c => out.push(c),
        }
    }
    out
}

fn peak_memory_kb() -> u64 {
    std::fs::read_to_string("/proc/self/status")
        .unwrap_or_default()
        .lines()
        .find(|l| l.starts_with("VmRSS:"))
        .and_then(|l| l.split_whitespace().nth(1))
        .and_then(|s| s.parse().ok())
        .unwrap_or(0)
}

fn escape_json_string(s: &str) -> String {
    s.replace('\\', "\\\\")
     .replace('"',  "\\\"")
     .replace('\n', "\\n")
     .replace('\r', "\\r")
     .replace('\t', "\\t")
}

fn send_cmd(stream: &mut TcpStream, args: &[&str]) {
    let mut msg = format!("*{}\r\n", args.len());
    for a in args {
        let bytes = a.as_bytes();
        msg.push_str(&format!("${}\r\n", bytes.len()));
        msg.push_str(a);
        msg.push_str("\r\n");
    }
    stream.write_all(msg.as_bytes()).unwrap();
}

fn read_resp(reader: &mut BufReader<TcpStream>) -> String {
    let mut line = String::new();
    if reader.read_line(&mut line).unwrap_or(0) == 0 {
        return String::new();
    }
    let trimmed = line.trim_end_matches(|c| c == '\r' || c == '\n');
    if trimmed.is_empty() {
        return String::new();
    }
    let t = trimmed.chars().next().unwrap();
    let rest = &trimmed[1..];
    match t {
        '+' | '-' => format!("{}{}\n", t, rest),
        ':' => format!(":{}\n", rest),
        '$' => {
            let n: i64 = rest.parse().unwrap_or(-1);
            if n < 0 {
                return "$-1\n".to_string();
            }
            let mut buf = vec![0u8; n as usize + 2];
            reader.read_exact(&mut buf).unwrap();
            let s = String::from_utf8_lossy(&buf[..n as usize]).to_string();
            format!("${}\n{}\n", rest, s)
        }
        '*' => {
            let count: i64 = rest.parse().unwrap_or(-1);
            if count < 0 {
                return "*-1\n".to_string();
            }
            let mut out = format!("*{}\n", rest);
            for _ in 0..count {
                out.push_str(&read_resp(reader));
            }
            out
        }
        _ => String::new(),
    }
}

fn main() {
    let mut raw = String::new();
    io::stdin().read_to_string(&mut raw).unwrap();

    let test_input = extract_json_string(&raw, "input");

    let commands: Vec<Vec<String>> = test_input
        .lines()
        .filter(|l| !l.trim().is_empty())
        .map(|l| l.split_whitespace().map(|s| s.to_string()).collect())
        .collect();

    thread::spawn(|| {
        let mut server = MiniRedis::new();
        server.start(PORT);
    });

    let mut stream = None;
    for _ in 0..100 {
        match TcpStream::connect(("127.0.0.1", PORT)) {
            Ok(s) => { stream = Some(s); break; }
            Err(_) => thread::sleep(Duration::from_millis(10)),
        }
    }

    let stream = match stream {
        Some(s) => s,
        None => {
            print!("__BEGIN_RESULT__{{\"actual_output\":\"ERROR: could not connect to server\",\"time_ms\":0,\"memory_kb\":0}}__END_RESULT__");
            return;
        }
    };

    let reader_stream = stream.try_clone().unwrap();
    let mut writer = stream;
    let mut reader = BufReader::new(reader_stream);

    let mut output = String::new();
    let start = Instant::now();

    for cmd in &commands {
        let args: Vec<&str> = cmd.iter().map(|s| s.as_str()).collect();
        send_cmd(&mut writer, &args);
        output.push_str(&read_resp(&mut reader));
    }

    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    let memory_kb = peak_memory_kb();

    print!(
        "__BEGIN_RESULT__{{\"actual_output\":\"{}\",\"time_ms\":{:.3},\"memory_kb\":{}}}__END_RESULT__",
        escape_json_string(&output),
        elapsed_ms,
        memory_kb,
    );
}
