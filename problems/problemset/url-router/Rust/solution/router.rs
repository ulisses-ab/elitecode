pub struct RouteMatch {
    pub pattern: String,
    pub params: Vec<(String, String)>,
}

impl RouteMatch {
    fn empty() -> Self {
        Self { pattern: String::new(), params: vec![] }
    }
}

struct Route {
    method: String,
    pattern: String,
    segments: Vec<String>,
}

pub struct Router {
    routes: Vec<Route>,
}

impl Router {
    pub fn new() -> Self {
        Self { routes: vec![] }
    }

    pub fn register(&mut self, method: &str, pattern: &str) {
        self.routes.push(Route {
            method: method.to_string(),
            pattern: pattern.to_string(),
            segments: pattern.split('/').map(|s| s.to_string()).collect(),
        });
    }

    pub fn match_route(&self, method: &str, url: &str) -> RouteMatch {
        let url_segs: Vec<&str> = url.split('/').collect();
        let mut best_pattern: Option<&str> = None;
        let mut best_score: Option<Vec<u8>> = None;
        let mut best_params: Vec<(String, String)> = vec![];

        for route in &self.routes {
            if route.method != method || route.segments.len() != url_segs.len() {
                continue;
            }
            let mut score = vec![];
            let mut params = vec![];
            let mut ok = true;
            for (ps, us) in route.segments.iter().zip(url_segs.iter()) {
                if ps.starts_with(':') {
                    params.push((ps[1..].to_string(), us.to_string()));
                    score.push(1u8);
                } else if ps == us {
                    score.push(0u8);
                } else {
                    ok = false;
                    break;
                }
            }
            if ok && (best_score.is_none() || score < *best_score.as_ref().unwrap()) {
                best_pattern = Some(&route.pattern);
                best_score = Some(score);
                best_params = params;
            }
        }

        match best_pattern {
            Some(p) => RouteMatch { pattern: p.to_string(), params: best_params },
            None => RouteMatch::empty(),
        }
    }
}
