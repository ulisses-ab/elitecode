#include <bits/stdc++.h>

struct RouteMatch {
    std::string pattern;
    std::vector<std::pair<std::string, std::string>> params;
};

class Router {
    struct Route {
        std::string method;
        std::string pattern;
        std::vector<std::string> segments;
    };

    std::vector<Route> routes;

    static std::vector<std::string> split(const std::string& s) {
        std::vector<std::string> parts;
        std::stringstream ss(s);
        std::string part;
        while (std::getline(ss, part, '/'))
            parts.push_back(part);
        return parts;
    }

public:
    Router() {}

    void registerRoute(const std::string& method, const std::string& pattern) {
        routes.push_back({method, pattern, split(pattern)});
    }

    RouteMatch match(const std::string& method, const std::string& url) const {
        auto urlSegs = split(url);

        const Route* best = nullptr;
        std::vector<int> bestScore;
        std::vector<std::pair<std::string, std::string>> bestParams;

        for (const auto& route : routes) {
            if (route.method != method) continue;
            if (route.segments.size() != urlSegs.size()) continue;

            bool ok = true;
            std::vector<int> score;
            std::vector<std::pair<std::string, std::string>> params;

            for (size_t i = 0; i < route.segments.size(); i++) {
                const auto& ps = route.segments[i];
                const auto& us = urlSegs[i];
                if (!ps.empty() && ps[0] == ':') {
                    params.push_back({ps.substr(1), us});
                    score.push_back(1);
                } else if (ps == us) {
                    score.push_back(0);
                } else {
                    ok = false;
                    break;
                }
            }

            if (ok && (best == nullptr || score < bestScore)) {
                best = &route;
                bestScore = score;
                bestParams = params;
            }
        }

        if (!best) return {};
        return {best->pattern, bestParams};
    }
};
