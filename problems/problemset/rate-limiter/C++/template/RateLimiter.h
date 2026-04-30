#include <bits/stdc++.h>

class RateLimiter {
public:
    RateLimiter(int maxRequests, long long windowMs);
    bool allow(long long timestamp);
private:
    // Add private state here
};
