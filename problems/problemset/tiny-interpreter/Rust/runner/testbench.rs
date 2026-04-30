mod interpreter;
use interpreter::Interpreter;

use std::io::{self, Read};
use std::time::Instant;

fn extract_json_string(json: &str, key: &str) -> String {
    let needle = format!("\"{}\":", key);
    let start = json.find(&needle).expect("key not found") + needle.len();
    let rest = json[start..].trim_start();
    assert!(rest.starts_with('"'));
    let mut out = String::new();
    let mut chars = rest[1..].chars();
    loop {
        match chars.next().expect("unterminated string") {
            '"' => break,
            '\\' => match chars.next().expect("unterminated escape") {
                'n' => out.push('\n'),
                't' => out.push('\t'),
                'r' => out.push('\r'),
                '"' => out.push('"'),
                '\\' => out.push('\\'),
                c   => out.push(c),
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

fn escape_json(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"").replace('\n', "\\n").replace('\r', "\\r")
}

fn main() {
    let mut raw = String::new();
    io::stdin().read_to_string(&mut raw).unwrap();

    let source = extract_json_string(&raw, "input");
    let mut interp = Interpreter::new();

    let start = Instant::now();
    let output = interp.run(&source);
    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    let memory_kb = peak_memory_kb();

    print!(
        "__BEGIN_RESULT__{{\"actual_output\":\"{}\",\"time_ms\":{:.3},\"memory_kb\":{}}}__END_RESULT__",
        escape_json(&output), elapsed_ms, memory_kb
    );
}
