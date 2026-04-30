mod vfs;
use vfs::VFS;

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
    let input = extract_json_string(&raw, "input");

    let mut vfs = VFS::new();
    let mut output = String::new();

    let start = Instant::now();

    for line in input.lines() {
        if line.is_empty() { continue; }
        let mut parts = line.splitn(2, ' ');
        let cmd = parts.next().unwrap_or("");
        let rest = parts.next().unwrap_or("");

        match cmd {
            "MKDIR" => output.push_str(&vfs.mkdir(rest)),
            "TOUCH" => output.push_str(&vfs.touch(rest)),
            "WRITE" => {
                let mut it = rest.splitn(2, ' ');
                let path = it.next().unwrap_or("");
                let content = it.next().unwrap_or("");
                output.push_str(&vfs.write(path, content));
            }
            "READ"  => output.push_str(&vfs.read(rest)),
            "LS"    => output.push_str(&vfs.ls(rest)),
            "RM"    => {
                if rest.starts_with("-r ") {
                    output.push_str(&vfs.rmr(&rest[3..]));
                } else {
                    output.push_str(&vfs.rm(rest));
                }
            }
            "MV"    => {
                let mut it = rest.splitn(2, ' ');
                let src = it.next().unwrap_or("");
                let dst = it.next().unwrap_or("");
                output.push_str(&vfs.mv(src, dst));
            }
            "CP"    => {
                let mut it = rest.splitn(2, ' ');
                let src = it.next().unwrap_or("");
                let dst = it.next().unwrap_or("");
                output.push_str(&vfs.cp(src, dst));
            }
            "FIND"  => {
                let mut it = rest.splitn(2, ' ');
                let path = it.next().unwrap_or("");
                let name = it.next().unwrap_or("");
                output.push_str(&vfs.find(path, name));
            }
            _ => {}
        }
    }

    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    let memory_kb = peak_memory_kb();

    print!(
        "__BEGIN_RESULT__{{\"actual_output\":\"{}\",\"time_ms\":{:.3},\"memory_kb\":{}}}__END_RESULT__",
        escape_json(&output), elapsed_ms, memory_kb
    );
}
