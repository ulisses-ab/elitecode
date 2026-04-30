#include <bits/stdc++.h>

class RateLimiter {
    int maxReq;
    long long window;
    std::deque<long long> timestamps;
public:
    RateLimiter(int maxRequests, long long windowMs)
        : maxReq(maxRequests), window(windowMs) {}

    bool allow(long long timestamp) {
        while (!timestamps.empty() && timestamps.front() < timestamp - window)
            timestamps.pop_front();
        if ((int)timestamps.size() < maxReq) {
            timestamps.push_back(timestamp);
            return true;
        }
        return false;
    }
};
