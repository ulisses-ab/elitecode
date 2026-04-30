#pragma once
#include <bits/stdc++.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <signal.h>

class MiniRedis {
    // Add your data structures here.
    // Keys can hold one of four types: string, list, set, or sorted set.
    // Each key may optionally have an expiry time (set via EXPIRE or SET ... EX).

public:
    // Start the server on the given port.
    // Accept one TCP connection at a time.
    // For each connection, repeatedly read RESP commands and write RESP responses.
    // This method should block until the process exits.
    void start(int port) {
        // TODO: implement
    }
};
