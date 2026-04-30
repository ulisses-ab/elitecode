use std::net::TcpListener;

pub struct MiniRedis;

impl MiniRedis {
    pub fn new() -> Self {
        MiniRedis
    }

    pub fn start(&mut self, port: u16) {
        // Bind to the given port and accept connections one at a time.
        // For each connection, read RESP commands and write RESP responses.
        // This method should block indefinitely.
        let _listener = TcpListener::bind(("0.0.0.0", port)).unwrap();
        todo!()
    }
}
