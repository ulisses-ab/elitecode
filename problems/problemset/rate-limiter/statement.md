Implement a **sliding window rate limiter** that controls how many requests are allowed within a given time window.

The rate limiter allows at most `maxRequests` requests within any window of `windowMs` milliseconds. A request at time `T` is counted in the window `[T - windowMs, T)`. If the number of allowed requests already in that window equals `maxRequests`, the new request is **denied** and not recorded.

Implement a `RateLimiter` class with:

- `RateLimiter(int maxRequests, long long windowMs)` — constructor with the limit and window size.
- `bool allow(long long timestamp)` — returns `true` if the request is allowed (and records it), `false` if it is denied.

Timestamps are non-decreasing integers representing milliseconds.

## Example

```
RateLimiter rl(3, 1000);  // 3 requests per 1000ms

rl.allow(0)    // true  — 1 request in window [-1000, 0)
rl.allow(100)  // true  — 2 requests in window [-900, 100)
rl.allow(200)  // true  — 3 requests in window [-800, 200)
rl.allow(300)  // false — window [-700, 300) already has 3 allowed requests
rl.allow(1001) // true  — window [1, 1001): only timestamps 100 and 200 qualify → 2 in window
```

## Constraints

- `1 <= maxRequests <= 10^4`
- `1 <= windowMs <= 10^9`
- `0 <= timestamp <= 10^12`
- Timestamps are non-decreasing
- At most `10^5` calls to `allow`
