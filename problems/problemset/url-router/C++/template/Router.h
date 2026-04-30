#include <bits/stdc++.h>

struct RouteMatch {
    std::string pattern;
    std::vector<std::pair<std::string, std::string>> params;
};

class Router {
public:
    Router();
    void registerRoute(const std::string& method, const std::string& pattern);
    RouteMatch match(const std::string& method, const std::string& url) const;
private:
    // Add private state here
};
