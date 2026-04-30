#pragma once
#include "Store.h"
#include "Resp.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <signal.h>

static const char* TYPE_NAMES[] = {"none", "string", "list", "set", "zset"};
static const char* WRONGTYPE    = "WRONGTYPE Operation against a key holding the wrong kind of value";

class MiniRedis {
    Store store;

    // ── Command dispatch ──────────────────────────────────────────────────────

    void dispatch(int fd, std::vector<std::string>& a) {
        if (a.empty()) return;
        std::string cmd = a[0];
        for (auto& c : cmd) c = toupper(c);

        // ── Generic ──────────────────────────────────────────────────────────

        if (cmd == "PING") {
            a.size() > 1 ? resp::bulk(fd, a[1]) : resp::simple(fd, "PONG");

        } else if (cmd == "FLUSHALL") {
            store.flush(); resp::simple(fd, "OK");

        } else if (cmd == "DBSIZE") {
            resp::intr(fd, store.dbsize());

        } else if (cmd == "DEL") {
            int n = 0;
            for (size_t i = 1; i < a.size(); i++)
                if (store.alive(a[i])) { store.erase(a[i]); n++; }
            resp::intr(fd, n);

        } else if (cmd == "EXISTS") {
            int n = 0;
            for (size_t i = 1; i < a.size(); i++) if (store.alive(a[i])) n++;
            resp::intr(fd, n);

        } else if (cmd == "TYPE") {
            auto* e = store.get(a[1]);
            resp::simple(fd, e ? TYPE_NAMES[e->type] : "none");

        } else if (cmd == "EXPIRE") {
            auto* e = store.get(a[1]);
            if (!e) { resp::intr(fd, 0); return; }
            e->expireAt = store.time() + std::stoll(a[2]);
            resp::intr(fd, 1);

        } else if (cmd == "TTL") {
            auto* e = store.get(a[1]);
            if (!e) { resp::intr(fd, -2); return; }
            resp::intr(fd, e->expireAt < 0 ? -1 : e->expireAt - store.time());

        } else if (cmd == "DEBUG") {
            std::string sub = a.size() > 1 ? a[1] : "";
            for (auto& c : sub) c = toupper(c);
            if (sub == "TICK" && a.size() >= 3) { store.tick(std::stoll(a[2])); resp::simple(fd, "OK"); }
            else resp::err(fd, "ERR unknown DEBUG subcommand");

        // ── Strings ──────────────────────────────────────────────────────────

        } else if (cmd == "SET") {
            auto& e = store.reset(a[1]);
            e.type = Entry::STRING; e.str = a[2];
            for (size_t i = 3; i + 1 < a.size(); i++) {
                std::string opt = a[i]; for (auto& c : opt) c = toupper(c);
                if (opt == "EX") e.expireAt = store.time() + std::stoll(a[++i]);
            }
            resp::simple(fd, "OK");

        } else if (cmd == "GET") {
            auto* e = store.get(a[1]);
            if (!e) { resp::nil(fd); return; }
            if (e->type != Entry::STRING) { resp::err(fd, WRONGTYPE); return; }
            resp::bulk(fd, e->str);

        } else if (cmd == "MSET") {
            for (size_t i = 1; i + 1 < a.size(); i += 2) {
                auto& e = store.reset(a[i]);
                e.type = Entry::STRING; e.str = a[i + 1];
            }
            resp::simple(fd, "OK");

        } else if (cmd == "MGET") {
            resp::ws(fd, "*" + std::to_string(a.size() - 1) + "\r\n");
            for (size_t i = 1; i < a.size(); i++) {
                auto* e = store.get(a[i]);
                (e && e->type == Entry::STRING) ? resp::bulk(fd, e->str) : resp::nil(fd);
            }

        } else if (cmd == "INCR" || cmd == "INCRBY") {
            long long by = (cmd == "INCRBY") ? std::stoll(a[2]) : 1;
            auto& e = store.make(a[1], Entry::STRING);
            if (e.type != Entry::STRING) { resp::err(fd, WRONGTYPE); return; }
            if (e.str.empty()) e.str = "0";
            long long v;
            try { v = std::stoll(e.str) + by; }
            catch (...) { resp::err(fd, "ERR value is not an integer or out of range"); return; }
            e.str = std::to_string(v);
            resp::intr(fd, v);

        } else if (cmd == "APPEND") {
            auto& e = store.make(a[1], Entry::STRING);
            if (e.type != Entry::STRING) { resp::err(fd, WRONGTYPE); return; }
            e.str += a[2];
            resp::intr(fd, (long long)e.str.size());

        // ── Lists ─────────────────────────────────────────────────────────────

        } else if (cmd == "LPUSH" || cmd == "RPUSH") {
            auto& e = store.make(a[1], Entry::LIST);
            if (e.type != Entry::LIST) { resp::err(fd, WRONGTYPE); return; }
            bool left = cmd == "LPUSH";
            for (size_t i = 2; i < a.size(); i++)
                left ? e.list.push_front(a[i]) : e.list.push_back(a[i]);
            resp::intr(fd, (long long)e.list.size());

        } else if (cmd == "LPOP" || cmd == "RPOP") {
            auto* e = store.get(a[1]);
            if (!e || e->list.empty()) { resp::nil(fd); return; }
            if (e->type != Entry::LIST) { resp::err(fd, WRONGTYPE); return; }
            bool left = cmd == "LPOP";
            if (a.size() >= 3) {
                int cnt = std::stoi(a[2]);
                std::vector<std::string> res;
                while (cnt-- > 0 && !e->list.empty()) {
                    if (left) { res.push_back(e->list.front()); e->list.pop_front(); }
                    else      { res.push_back(e->list.back());  e->list.pop_back(); }
                }
                if (e->list.empty()) store.erase(a[1]);
                resp::arr(fd, res);
            } else {
                std::string v = left ? e->list.front() : e->list.back();
                left ? e->list.pop_front() : e->list.pop_back();
                if (e->list.empty()) store.erase(a[1]);
                resp::bulk(fd, v);
            }

        } else if (cmd == "LRANGE") {
            auto* e = store.get(a[1]);
            if (!e) { resp::earr(fd); return; }
            if (e->type != Entry::LIST) { resp::err(fd, WRONGTYPE); return; }
            int len = e->list.size(), s = std::stoi(a[2]), t = std::stoi(a[3]);
            if (s < 0) s = std::max(0, len + s);
            if (t < 0) t = len + t;
            t = std::min(t, len - 1);
            if (s > t) { resp::earr(fd); return; }
            std::vector<std::string> res;
            for (int i = s; i <= t; i++) res.push_back(e->list[i]);
            resp::arr(fd, res);

        } else if (cmd == "LLEN") {
            auto* e = store.get(a[1]);
            if (!e) { resp::intr(fd, 0); return; }
            if (e->type != Entry::LIST) { resp::err(fd, WRONGTYPE); return; }
            resp::intr(fd, (long long)e->list.size());

        // ── Sets ──────────────────────────────────────────────────────────────

        } else if (cmd == "SADD") {
            auto& e = store.make(a[1], Entry::HSET);
            if (e.type != Entry::HSET) { resp::err(fd, WRONGTYPE); return; }
            int n = 0;
            for (size_t i = 2; i < a.size(); i++) if (e.hset.insert(a[i]).second) n++;
            resp::intr(fd, n);

        } else if (cmd == "SREM") {
            auto* e = store.get(a[1]);
            if (!e) { resp::intr(fd, 0); return; }
            if (e->type != Entry::HSET) { resp::err(fd, WRONGTYPE); return; }
            int n = 0;
            for (size_t i = 2; i < a.size(); i++) if (e->hset.erase(a[i])) n++;
            if (e->hset.empty()) store.erase(a[1]);
            resp::intr(fd, n);

        } else if (cmd == "SMEMBERS") {
            auto* e = store.get(a[1]);
            if (!e) { resp::earr(fd); return; }
            if (e->type != Entry::HSET) { resp::err(fd, WRONGTYPE); return; }
            resp::arr(fd, {e->hset.begin(), e->hset.end()});

        } else if (cmd == "SISMEMBER") {
            auto* e = store.get(a[1]);
            if (!e) { resp::intr(fd, 0); return; }
            if (e->type != Entry::HSET) { resp::err(fd, WRONGTYPE); return; }
            resp::intr(fd, e->hset.count(a[2]) ? 1 : 0);

        } else if (cmd == "SCARD") {
            auto* e = store.get(a[1]);
            if (!e) { resp::intr(fd, 0); return; }
            if (e->type != Entry::HSET) { resp::err(fd, WRONGTYPE); return; }
            resp::intr(fd, (long long)e->hset.size());

        // ── Sorted sets ───────────────────────────────────────────────────────

        } else if (cmd == "ZADD") {
            auto& e = store.make(a[1], Entry::ZSET);
            if (e.type != Entry::ZSET) { resp::err(fd, WRONGTYPE); return; }
            int n = 0;
            for (size_t i = 2; i + 1 < a.size(); i += 2) {
                double sc = std::stod(a[i]);
                if (!e.zset.count(a[i + 1])) n++;
                e.zset[a[i + 1]] = sc;
            }
            resp::intr(fd, n);

        } else if (cmd == "ZREM") {
            auto* e = store.get(a[1]);
            if (!e) { resp::intr(fd, 0); return; }
            if (e->type != Entry::ZSET) { resp::err(fd, WRONGTYPE); return; }
            int n = 0;
            for (size_t i = 2; i < a.size(); i++) if (e->zset.erase(a[i])) n++;
            if (e->zset.empty()) store.erase(a[1]);
            resp::intr(fd, n);

        } else if (cmd == "ZSCORE") {
            auto* e = store.get(a[1]);
            if (!e || !e->zset.count(a[2])) { resp::nil(fd); return; }
            char buf[64]; snprintf(buf, sizeof(buf), "%g", e->zset[a[2]]);
            resp::bulk(fd, buf);

        } else if (cmd == "ZRANK") {
            auto* e = store.get(a[1]);
            if (!e) { resp::nil(fd); return; }
            if (e->type != Entry::ZSET) { resp::err(fd, WRONGTYPE); return; }
            std::vector<std::pair<double, std::string>> sorted;
            for (auto& [m, s] : e->zset) sorted.push_back({s, m});
            std::sort(sorted.begin(), sorted.end());
            for (int i = 0; i < (int)sorted.size(); i++)
                if (sorted[i].second == a[2]) { resp::intr(fd, i); return; }
            resp::nil(fd);

        } else if (cmd == "ZRANGE") {
            auto* e = store.get(a[1]);
            if (!e) { resp::earr(fd); return; }
            if (e->type != Entry::ZSET) { resp::err(fd, WRONGTYPE); return; }
            std::vector<std::pair<double, std::string>> sorted;
            for (auto& [m, s] : e->zset) sorted.push_back({s, m});
            std::sort(sorted.begin(), sorted.end());
            int len = sorted.size(), s = std::stoi(a[2]), t = std::stoi(a[3]);
            if (s < 0) s = std::max(0, len + s);
            if (t < 0) t = len + t;
            t = std::min(t, len - 1);
            bool withscores = a.size() >= 5 && [&]{
                std::string x = a[4]; for (auto& c : x) c = toupper(c); return x == "WITHSCORES";
            }();
            std::vector<std::string> res;
            for (int i = s; i <= t; i++) {
                res.push_back(sorted[i].second);
                if (withscores) {
                    char buf[64]; snprintf(buf, sizeof(buf), "%g", sorted[i].first);
                    res.push_back(buf);
                }
            }
            res.empty() ? resp::earr(fd) : resp::arr(fd, res);

        } else if (cmd == "ZCARD") {
            auto* e = store.get(a[1]);
            if (!e) { resp::intr(fd, 0); return; }
            if (e->type != Entry::ZSET) { resp::err(fd, WRONGTYPE); return; }
            resp::intr(fd, (long long)e->zset.size());

        } else {
            resp::err(fd, "ERR unknown command '" + a[0] + "'");
        }
    }

public:
    void start(int port) {
        signal(SIGPIPE, SIG_IGN);
        int sfd = socket(AF_INET, SOCK_STREAM, 0);
        int opt = 1; setsockopt(sfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
        sockaddr_in addr{}; addr.sin_family = AF_INET;
        addr.sin_addr.s_addr = INADDR_ANY; addr.sin_port = htons(port);
        bind(sfd, (sockaddr*)&addr, sizeof(addr));
        listen(sfd, 5);
        while (true) {
            int cfd = accept(sfd, nullptr, nullptr);
            if (cfd < 0) break;
            while (true) {
                auto args = resp::rcmd(cfd);
                if (args.empty()) break;
                dispatch(cfd, args);
            }
            close(cfd);
        }
        close(sfd);
    }
};
