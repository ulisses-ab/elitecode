#include <stdlib.h>
#include "RateLimiter.h"

struct RateLimiter {
    int        max_requests;
    long long  window_ms;
    long long *q;      /* circular queue of accepted timestamps */
    int        head, count;
};

RateLimiter *rl_create(int max_requests, long long window_ms) {
    RateLimiter *rl = malloc(sizeof(*rl));
    rl->max_requests = max_requests;
    rl->window_ms    = window_ms;
    rl->q            = malloc(max_requests * sizeof(long long));
    rl->head = rl->count = 0;
    return rl;
}

int rl_allow(RateLimiter *rl, long long ts) {
    /* evict timestamps outside window [ts - window_ms, ts); left edge inclusive */
    while (rl->count > 0 && ts - rl->q[rl->head] > rl->window_ms) {
        rl->head = (rl->head + 1) % rl->max_requests;
        rl->count--;
    }
    if (rl->count >= rl->max_requests) return 0;
    int tail = (rl->head + rl->count) % rl->max_requests;
    rl->q[tail] = ts;
    rl->count++;
    return 1;
}

void rl_destroy(RateLimiter *rl) { free(rl->q); free(rl); }
