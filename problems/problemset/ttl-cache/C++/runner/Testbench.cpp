#include <bits/stdc++.h>
#include <nlohmann/json.hpp>
#include <chrono>
#include <sys/resource.h>
#include "../code/TTLCache.h"

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
    TTLCache cache;

    auto start = std::chrono::high_resolution_clock::now();

    while (ss >> cmd) {
        if (cmd == "SET") {
            std::string key, value;
            long long ttl;
            ss >> key >> value >> ttl;
            cache.set(key, value, ttl);
        } else if (cmd == "GET") {
            std::string key;
            ss >> key;
            std::string val = cache.get(key);
            output += (val.empty() ? "\"\"" : val) + "\n";
        } else if (cmd == "DEL") {
            std::string key;
            ss >> key;
            cache.del(key);
        } else if (cmd == "SIZE") {
            output += std::to_string(cache.size()) + "\n";
        } else if (cmd == "TICK") {
            long long delta;
            ss >> delta;
            cache.tick(delta);
        }
    }

    auto end = std::chrono::high_resolution_clock::now();
    double time_ms   = std::chrono::duration<double, std::milli>(end - start).count();
    long   memory_kb = peakMemoryKB();

    json result;
    result["actual_output"] = output;
    result["time_ms"]       = time_ms;
    result["memory_kb"]     = memory_kb;

    std::cout << "__BEGIN_RESULT__" << result.dump() << "__END_RESULT__";
}
