#include <bits/stdc++.h>

class TTLCache {
    long long now = 0;
    std::unordered_map<std::string, std::pair<std::string, long long>> store; // key -> (value, expiry)
public:
    TTLCache() {}

    void set(const std::string& key, const std::string& value, long long ttl) {
        store[key] = {value, now + ttl};
    }

    std::string get(const std::string& key) {
        auto it = store.find(key);
        if (it == store.end() || now >= it->second.second) return "";
        return it->second.first;
    }

    void del(const std::string& key) {
        store.erase(key);
    }

    int size() {
        int count = 0;
        for (auto& [k, p] : store)
            if (now < p.second) count++;
        return count;
    }

    void tick(long long delta) {
        now += delta;
    }
};
