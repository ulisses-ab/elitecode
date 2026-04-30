use std::collections::HashMap;

pub struct TTLCache {
    now: i64,
    store: HashMap<String, (String, i64)>, // key -> (value, expiry)
}

impl TTLCache {
    pub fn new() -> Self {
        Self { now: 0, store: HashMap::new() }
    }

    pub fn set(&mut self, key: &str, value: &str, ttl: i64) {
        self.store.insert(key.to_string(), (value.to_string(), self.now + ttl));
    }

    pub fn get(&self, key: &str) -> String {
        match self.store.get(key) {
            Some((val, expiry)) if self.now < *expiry => val.clone(),
            _ => String::new(),
        }
    }

    pub fn del(&mut self, key: &str) {
        self.store.remove(key);
    }

    pub fn size(&self) -> usize {
        self.store.values().filter(|(_, expiry)| self.now < *expiry).count()
    }

    pub fn tick(&mut self, delta: i64) {
        self.now += delta;
    }
}
