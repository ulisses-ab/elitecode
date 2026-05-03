#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <signal.h>
#include "MiniRedis.h"

/* Add your data structures and helper functions here. */

void mini_redis_start(int port) {
    /* TODO: bind a TCP socket on `port`, accept connections, parse RESP
       commands, dispatch to your command handlers, and write RESP responses. */

    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    struct sockaddr_in addr = {0};
    addr.sin_family      = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port        = htons(port);

    bind(server_fd, (struct sockaddr *)&addr, sizeof(addr));
    listen(server_fd, 8);

    signal(SIGPIPE, SIG_IGN);

    for (;;) {
        int client_fd = accept(server_fd, NULL, NULL);
        if (client_fd < 0) continue;

        /* TODO: read RESP commands from client_fd and write responses */

        close(client_fd);
    }
}
