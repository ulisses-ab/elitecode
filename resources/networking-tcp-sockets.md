# Networking Basics: TCP & Sockets

## The TCP/IP model

Network communication is organised into layers, each responsible for a different concern. The two layers most relevant for application developers are:

**IP (Internet Protocol)** handles addressing and routing. It delivers packets from one machine to another on a best-effort basis — packets may be lost, reordered, or duplicated.

**TCP (Transmission Control Protocol)** sits on top of IP and provides a reliable, ordered, connection-oriented byte stream. It retransmits lost packets, reorders out-of-order arrivals, and controls the rate of transmission to avoid overwhelming the receiver. From the application's perspective, writing to a TCP connection is like writing to a file — you send bytes in order and the receiver gets them in order.

## The three-way handshake

Before data can flow, TCP establishes a connection through a handshake:

1. The client sends a SYN (synchronise) segment to signal it wants to connect.
2. The server responds with SYN-ACK, acknowledging the client's sequence number and announcing its own.
3. The client sends ACK, completing the handshake.

Only after this exchange is the connection considered established. This ensures both sides agree on the starting sequence numbers and that the path is reachable in both directions.

## Sockets

A socket is the OS abstraction for one endpoint of a network connection. From the application's point of view it looks like a file descriptor — you read from it to receive data and write to it to send data. The OS handles all the TCP details underneath.

A server socket is bound to a port and listens for incoming connections. When a client connects, the server's `accept` call returns a new connected socket representing that specific client. The server can then read the client's request, process it, and write the response back — all through that socket.

## Handling multiple clients

A naïve server blocks on `accept`, handles one client to completion, then accepts the next. This works for demonstration purposes but fails in practice because one slow client blocks all others.

The standard approaches are:

**Thread per connection** spawns a new OS thread for each accepted connection. The threads run concurrently, so one client's slowness doesn't block others. The downside is memory and scheduling overhead — OS threads are expensive, so this approach doesn't scale to thousands of simultaneous connections.

**Event-driven / non-blocking I/O** uses a single thread with a selector (epoll on Linux, kqueue on macOS) that monitors many sockets at once and wakes only when a socket is ready to read or write. This is how Redis, Nginx, and Node.js handle enormous numbers of connections with minimal threads. The tradeoff is that your logic must be written as event handlers and you must never block the event loop.

**Thread pool** combines both: a fixed number of threads each pick up connections from a queue. This bounds memory use while still allowing concurrency.

## RESP — Redis Serialization Protocol

Redis communicates over plain TCP using a text protocol called RESP. Each value is prefixed with a byte indicating its type, followed by the data and a CRLF terminator. The types are: simple strings (`+`), errors (`-`), integers (`:`), bulk strings (`$` followed by the byte length), and arrays (`*` followed by the element count).

The protocol is line-oriented and trivial to parse without a parser library — you read until CRLF, check the first byte, and handle the rest accordingly. This simplicity is a deliberate design choice that makes it easy to interact with Redis using nothing but a raw TCP connection and `cat`.

## Why this matters for Mini Redis

Implementing a Redis-like server means accepting TCP connections, parsing RESP-encoded commands, dispatching to command handlers (GET, SET, DEL, EXPIRE, etc.), and writing RESP-encoded responses back. Each piece — socket binding, accept loop, RESP parsing, command dispatch — is a separable concern that you can design and test independently.
