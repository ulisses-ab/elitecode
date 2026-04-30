mod evaluator;
use evaluator::Evaluator;

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

fn escape_json(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"").replace('\n', "\\n").replace('\r', "\\r")
}

// Replicates C's %.6g: 6 significant digits, strip trailing zeros.
fn format_g(v: f64) -> String {
    if v == 0.0 { return "0".to_string(); }
    let abs_v = v.abs();
    let exp = abs_v.log10().floor() as i32;
    if exp >= 6 || exp < -4 {
        let prec = 5usize;
        let s = format!("{:.prec$e}", v, prec = prec);
        if let Some(e_pos) = s.find('e') {
            let mantissa = s[..e_pos].trim_end_matches('0').trim_end_matches('.');
            let exp_num: i32 = s[e_pos + 1..].parse().unwrap();
            let exp_str = if exp_num >= 0 { format!("e+{:02}", exp_num) } else { format!("e-{:02}", exp_num.abs()) };
            format!("{}{}", mantissa, exp_str)
        } else {
            s
        }
    } else {
        let decimal_places = ((5 - exp) as usize).max(0);
        let s = format!("{:.prec$}", v, prec = decimal_places);
        s.trim_end_matches('0').trim_end_matches('.').to_string()
    }
}

fn main() {
    let mut raw = String::new();
    io::stdin().read_to_string(&mut raw).unwrap();

    let test_input = extract_json_string(&raw, "input");
    let mut ev = Evaluator::new();
    let mut output_lines: Vec<String> = Vec::new();

    let start = Instant::now();

    for line in test_input.lines() {
        if line.is_empty() { continue; }
        if let Some(rest) = line.strip_prefix("SET ") {
            let mut parts = rest.splitn(2, ' ');
            let name = parts.next().unwrap();
            let val: f64 = parts.next().unwrap().trim().parse().unwrap();
            ev.set(name, val);
        } else if let Some(expr) = line.strip_prefix("EVAL ") {
            output_lines.push(format_g(ev.eval(expr)));
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
