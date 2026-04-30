mod chess;
use chess::Chess;

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
                'n'  => out.push('\n'), 't' => out.push('\t'),
                'r'  => out.push('\r'), '"' => out.push('"'),
                '\\' => out.push('\\'), c  => out.push(c),
            },
            c => out.push(c),
        }
    }
    out
}

fn peak_memory_kb() -> u64 {
    std::fs::read_to_string("/proc/self/status").unwrap_or_default()
        .lines().find(|l| l.starts_with("VmRSS:"))
        .and_then(|l| l.split_whitespace().nth(1))
        .and_then(|s| s.parse().ok()).unwrap_or(0)
}

fn escape_json(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"").replace('\n', "\\n").replace('\r', "\\r")
}

fn main() {
    let mut raw = String::new();
    io::stdin().read_to_string(&mut raw).unwrap();
    let test_input = extract_json_string(&raw, "input");

    let mut game = Chess::new();
    let mut output_lines: Vec<String> = Vec::new();

    let start = Instant::now();

    for line in test_input.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.is_empty() { continue; }
        match parts[0] {
            "NEW"     => game.new_game(),
            "MOVE"    => output_lines.push(game.make_move(parts.get(1).unwrap_or(&""))),
            "PRINT"   => { let s = game.print_board(); output_lines.push(s.trim_end_matches('\n').to_string()); }
            "MOVES"   => output_lines.push(game.moves(parts.get(1).unwrap_or(&""))),
            "STATUS"  => output_lines.push(game.status()),
            "HISTORY" => { let s = game.history(); output_lines.push(s.trim_end_matches('\n').to_string()); }
            _ => {}
        }
    }

    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    let memory_kb = peak_memory_kb();
    let actual_output = if output_lines.is_empty() { String::new() } else { output_lines.join("\n") + "\n" };

    print!(
        "__BEGIN_RESULT__{{\"actual_output\":\"{}\",\"time_ms\":{:.3},\"memory_kb\":{}}}__END_RESULT__",
        escape_json(&actual_output), elapsed_ms, memory_kb
    );
}
