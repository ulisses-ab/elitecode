pub struct TTLCache {
    // Add your fields here
}

impl TTLCache {
    pub fn new() -> Self {
        todo!()
    }

    pub fn set(&mut self, key: &str, value: &str, ttl: i64) {
        todo!()
    }

    pub fn get(&self, key: &str) -> String {
        todo!()
    }

    pub fn del(&mut self, key: &str) {
        todo!()
    }

    pub fn size(&self) -> usize {
        todo!()
    }

    pub fn tick(&mut self, delta: i64) {
        todo!()
    }
}
