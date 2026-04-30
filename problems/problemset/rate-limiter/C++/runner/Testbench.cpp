#include <bits/stdc++.h>
#include <nlohmann/json.hpp>
#include <chrono>
#include <sys/resource.h>
#include "../code/RateLimiter.h"

using json = nlohmann::json;

static long peakMemoryKB() {
    struct rusage usage;
    getrusage(RUSAGE_SELF, &usage);
    return usage.ru_maxrss;
}

int main() {
    std::string testcase_str((std::istreambuf_iterator<char>(std::cin)),
                              std::istreambuf_iterator<char>());

    json testcase = json::parse(testcase_str);

    auto input = testcase["input"].get<std::string>();
    std::stringstream ss(input);
    std::string cmd;

    std::string output;
    RateLimiter* rl = nullptr;

    auto start = std::chrono::high_resolution_clock::now();

    while (ss >> cmd) {
        if (cmd == "INIT") {
            int maxRequests;
            long long windowMs;
            ss >> maxRequests >> windowMs;
            delete rl;
            rl = new RateLimiter(maxRequests, windowMs);
        } else if (cmd == "REQUEST") {
            long long timestamp;
            ss >> timestamp;
            output += (rl->allow(timestamp) ? "ALLOWED" : "DENIED");
            output += "\n";
        }
    }

    auto end = std::chrono::high_resolution_clock::now();
    double time_ms   = std::chrono::duration<double, std::milli>(end - start).count();
    long   memory_kb = peakMemoryKB();

    delete rl;

    json result;
    result["actual_output"] = output;
    result["time_ms"]       = time_ms;
    result["memory_kb"]     = memory_kb;

    std::cout << "__BEGIN_RESULT__" << result.dump() << "__END_RESULT__";
}
