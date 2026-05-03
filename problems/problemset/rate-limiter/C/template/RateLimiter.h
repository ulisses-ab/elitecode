#ifndef RATE_LIMITER_H
#define RATE_LIMITER_H

typedef struct RateLimiter RateLimiter;

RateLimiter *rl_create(int max_requests, long long window_ms);
int          rl_allow(RateLimiter *rl, long long timestamp); /* 1 = ALLOWED, 0 = DENIED */
void         rl_destroy(RateLimiter *rl);

#endif
