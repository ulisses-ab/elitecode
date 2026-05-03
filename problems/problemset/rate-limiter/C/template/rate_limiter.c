#include <stdlib.h>
#include "RateLimiter.h"

struct RateLimiter {
    int       max_requests;
    long long window_ms;
    /* add your fields here */
};

RateLimiter *rl_create(int max_requests, long long window_ms) {
    RateLimiter *rl = malloc(sizeof(*rl));
    rl->max_requests = max_requests;
    rl->window_ms    = window_ms;
    return rl;
}

int rl_allow(RateLimiter *rl, long long timestamp) {
    /* TODO */
    (void)rl; (void)timestamp;
    return 0;
}

void rl_destroy(RateLimiter *rl) {
    free(rl);
}
