#pragma once
#include <bits/stdc++.h>

struct Entry {
    enum Type { NONE, STRING, LIST, HSET, ZSET } type = NONE;
    std::string str;
    std::deque<std::string> list;
    std::set<std::string> hset;
    std::map<std::string, double> zset;
    long long expireAt = -1;
};

class Store {
    std::unordered_map<std::string, Entry> data;
    long long now_ = 0;

public:
    bool alive(const std::string& k) {
        auto it = data.find(k);
        if (it == data.end()) return false;
        if (it->second.expireAt >= 0 && it->second.expireAt <= now_) {
            data.erase(it); return false;
        }
        return true;
    }

    // Returns the entry if it exists and isn't expired, else nullptr.
    Entry* get(const std::string& k) { return alive(k) ? &data[k] : nullptr; }

    // Returns the entry, creating it with type t if it doesn't exist yet.
    // Does NOT reset the type if the key already exists — use reset() for SET/MSET.
    Entry& make(const std::string& k, Entry::Type t) {
        auto& e = data[k];
        if (e.type == Entry::NONE) e.type = t;
        return e;
    }

    // Creates or fully overwrites the entry (used by SET / MSET).
    Entry& reset(const std::string& k) {
        data[k] = Entry{};
        return data[k];
    }

    void erase(const std::string& k) { data.erase(k); }

    void flush() { data.clear(); }

    void tick(long long n) { now_ += n; }

    long long time() const { return now_; }

    long long dbsize() {
        std::vector<std::string> keys;
        keys.reserve(data.size());
        for (auto& kv : data) keys.push_back(kv.first);
        long long n = 0;
        for (auto& k : keys) if (alive(k)) n++;
        return n;
    }
};
