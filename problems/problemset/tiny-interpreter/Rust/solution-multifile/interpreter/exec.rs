use std::collections::HashMap;
use super::ast::{Expr, Stmt};

pub struct ReturnSignal(pub i64);

pub fn exec_block(
    block: &[Stmt],
    env: &mut HashMap<String, i64>,
    funcs: &HashMap<String, (Vec<String>, Vec<Stmt>)>,
    out: &mut String,
) -> Option<ReturnSignal> {
    for s in block {
        if let Some(r) = exec_stmt(s, env, funcs, out) { return Some(r); }
    }
    None
}

fn exec_stmt(
    s: &Stmt,
    env: &mut HashMap<String, i64>,
    funcs: &HashMap<String, (Vec<String>, Vec<Stmt>)>,
    out: &mut String,
) -> Option<ReturnSignal> {
    match s {
        Stmt::Assign(name, expr) => { let v = eval(expr, env, funcs, out); env.insert(name.clone(), v); }
        Stmt::Print(expr) => { let v = eval(expr, env, funcs, out); out.push_str(&v.to_string()); out.push('\n'); }
        Stmt::Return(expr) => return Some(ReturnSignal(eval(expr, env, funcs, out))),
        Stmt::If(branches, else_block) => {
            for (cond, body) in branches {
                if eval(cond, env, funcs, out) != 0 {
                    let mut local = env.clone();
                    if let Some(r) = exec_block(body, &mut local, funcs, out) {
                        env.extend(local); return Some(r);
                    }
                    env.extend(local); return None;
                }
            }
            let mut local = env.clone();
            if let Some(r) = exec_block(else_block, &mut local, funcs, out) {
                env.extend(local); return Some(r);
            }
            env.extend(local);
        }
        Stmt::While(cond, body) => {
            while eval(cond, env, funcs, out) != 0 {
                let mut local = env.clone();
                if let Some(r) = exec_block(body, &mut local, funcs, out) {
                    env.extend(local); return Some(r);
                }
                env.extend(local);
            }
        }
        Stmt::Def(_, _, _) => {} // already registered at top level
        Stmt::Expr(expr) => { eval(expr, env, funcs, out); }
    }
    None
}

fn eval(
    e: &Expr,
    env: &HashMap<String, i64>,
    funcs: &HashMap<String, (Vec<String>, Vec<Stmt>)>,
    out: &mut String,
) -> i64 {
    match e {
        Expr::Num(n) => *n,
        Expr::Var(name) => *env.get(name).unwrap_or(&0),
        Expr::Unary(op, e) => {
            let v = eval(e, env, funcs, out);
            match op.as_str() { "-" => -v, "not" => if v == 0 { 1 } else { 0 }, _ => v }
        }
        Expr::Bin(op, l, r) => {
            match op.as_str() {
                "and" => { let lv = eval(l, env, funcs, out); if lv == 0 { 0 } else { eval(r, env, funcs, out) } }
                "or"  => { let lv = eval(l, env, funcs, out); if lv != 0 { lv } else { eval(r, env, funcs, out) } }
                _ => {
                    let lv = eval(l, env, funcs, out);
                    let rv = eval(r, env, funcs, out);
                    match op.as_str() {
                        "+"  => lv + rv,
                        "-"  => lv - rv,
                        "*"  => lv * rv,
                        "/"  => lv / rv,
                        "%"  => lv % rv,
                        "==" => (lv == rv) as i64,
                        "!=" => (lv != rv) as i64,
                        "<"  => (lv <  rv) as i64,
                        "<=" => (lv <= rv) as i64,
                        ">"  => (lv >  rv) as i64,
                        ">=" => (lv >= rv) as i64,
                        _    => 0,
                    }
                }
            }
        }
        Expr::Call(name, args) => {
            if let Some((params, body)) = funcs.get(name) {
                let params = params.clone();
                let body = body.clone();
                let mut local: HashMap<String, i64> = params.iter()
                    .zip(args.iter())
                    .map(|(p, a)| (p.clone(), eval(a, env, funcs, out)))
                    .collect();
                if let Some(ReturnSignal(v)) = exec_block(&body, &mut local, funcs, out) {
                    return v;
                }
            }
            0
        }
    }
}
