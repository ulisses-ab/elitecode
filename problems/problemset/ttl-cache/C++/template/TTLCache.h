#include <bits/stdc++.h>

class TTLCache {
public:
    TTLCache();
    void set(const std::string& key, const std::string& value, long long ttl);
    std::string get(const std::string& key);
    void del(const std::string& key);
    int size();
    void tick(long long delta);
private:
    // Add private state here
};
