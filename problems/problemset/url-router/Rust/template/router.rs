pub struct RouteMatch {
    pub pattern: String,
    pub params: Vec<(String, String)>,
}

pub struct Router {
    // Add your fields here
}

impl Router {
    pub fn new() -> Self {
        todo!()
    }

    pub fn register(&mut self, method: &str, pattern: &str) {
        todo!()
    }

    pub fn match_route(&self, method: &str, url: &str) -> RouteMatch {
        todo!()
    }
}
