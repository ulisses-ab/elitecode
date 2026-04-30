mod rate_limiter;
use rate_limiter::RateLimiter;

use std::io::{self, Read};
use std::time::Instant;

// Extracts a JSON string field value without pulling in serde_json.
// Handles the only escapes that appear in our test inputs: \n \t \r \" \\
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
                'n' => out.push('\n'),
                't' => out.push('\t'),
                'r' => out.push('\r'),
                '"' => out.push('"'),
                '\\' => out.push('\\'),
                c => out.push(c),
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
     .replace('"', "\\\"")
     .replace('\n', "\\n")
     .replace('\r', "\\r")
     .replace('\t', "\\t")
}

fn main() {
    let mut raw = String::new();
    io::stdin().read_to_string(&mut raw).unwrap();

    let test_input = extract_json_string(&raw, "input");

    let mut rl: Option<RateLimiter> = None;
    let mut output_lines: Vec<&'static str> = Vec::new();

    let start = Instant::now();

    for line in test_input.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.is_empty() {
            continue;
        }
        match parts[0] {
            "INIT" => {
                let max_requests: u32 = parts[1].parse().unwrap();
                let window_ms: u64 = parts[2].parse().unwrap();
                rl = Some(RateLimiter::new(max_requests, window_ms));
            }
            "REQUEST" => {
                let timestamp: u64 = parts[1].parse().unwrap();
                let allowed = rl.as_mut().unwrap().allow(timestamp);
                output_lines.push(if allowed { "ALLOWED" } else { "DENIED" });
            }
            _ => {}
        }
    }

    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    let memory_kb = peak_memory_kb();

    let actual_output = if output_lines.is_empty() {
        String::new()
    } else {
        output_lines.join("\n") + "\n"
    };

    print!(
        "__BEGIN_RESULT__{{\"actual_output\":\"{}\",\"time_ms\":{:.3},\"memory_kb\":{}}}__END_RESULT__",
        escape_json_string(&actual_output),
        elapsed_ms,
        memory_kb,
    );
}
