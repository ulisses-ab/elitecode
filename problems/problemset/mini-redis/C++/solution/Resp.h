#pragma once
#include <bits/stdc++.h>
#include <unistd.h>

namespace resp {

inline std::string rline(int fd) {
    std::string s; char c;
    while (read(fd, &c, 1) > 0) { if (c == '\r') { read(fd, &c, 1); break; } s += c; }
    return s;
}

inline std::string rbulk(int fd, int n) {
    std::string s(n, 0); int got = 0;
    while (got < n) { int r = read(fd, s.data()+got, n-got); if (r <= 0) break; got += r; }
    char cr, lf; read(fd, &cr, 1); read(fd, &lf, 1);
    return s;
}

inline std::vector<std::string> rcmd(int fd) {
    std::string h = rline(fd);
    if (h.empty() || h[0] != '*') return {};
    int argc = std::stoi(h.substr(1));
    std::vector<std::string> a;
    for (int i = 0; i < argc; i++) {
        std::string l = rline(fd);
        a.push_back(rbulk(fd, std::stoi(l.substr(1))));
    }
    return a;
}

inline void ws(int fd, const std::string& s)     { write(fd, s.c_str(), s.size()); }
inline void simple(int fd, const std::string& s) { ws(fd, "+" + s + "\r\n"); }
inline void err(int fd, const std::string& s)    { ws(fd, "-" + s + "\r\n"); }
inline void intr(int fd, long long n)             { ws(fd, ":" + std::to_string(n) + "\r\n"); }
inline void bulk(int fd, const std::string& s)   { ws(fd, "$" + std::to_string(s.size()) + "\r\n" + s + "\r\n"); }
inline void nil(int fd)                          { ws(fd, "$-1\r\n"); }
inline void earr(int fd)                         { ws(fd, "*0\r\n"); }

inline void arr(int fd, const std::vector<std::string>& v) {
    ws(fd, "*" + std::to_string(v.size()) + "\r\n");
    for (auto& s : v) bulk(fd, s);
}

} // namespace resp
