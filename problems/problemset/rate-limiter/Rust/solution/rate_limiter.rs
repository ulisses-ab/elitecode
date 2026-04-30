use std::collections::VecDeque;

pub struct RateLimiter {
    max_requests: u32,
    window_ms: u64,
    window: VecDeque<u64>,
}

impl RateLimiter {
    pub fn new(max_requests: u32, window_ms: u64) -> Self {
        Self { max_requests, window_ms, window: VecDeque::new() }
    }

    pub fn allow(&mut self, timestamp: u64) -> bool {
        let cutoff = timestamp.saturating_sub(self.window_ms);
        while self.window.front().map_or(false, |&t| t < cutoff) {
            self.window.pop_front();
        }
        if self.window.len() < self.max_requests as usize {
            self.window.push_back(timestamp);
            true
        } else {
            false
        }
    }
}
