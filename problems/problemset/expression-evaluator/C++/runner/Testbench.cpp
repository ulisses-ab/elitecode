#include <bits/stdc++.h>
#include <nlohmann/json.hpp>
#include <chrono>
#include <sys/resource.h>
#include "../code/Evaluator.h"

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
    std::string line;
    std::string output;
    Evaluator evaluator;

    auto start = std::chrono::high_resolution_clock::now();

    while (std::getline(ss, line)) {
        if (line.empty()) continue;
        if (line.rfind("SET ", 0) == 0) {
            std::istringstream ls(line);
            std::string cmd, name, numstr;
            ls >> cmd >> name >> numstr;
            evaluator.set(name, std::stod(numstr));
        } else if (line.rfind("EVAL ", 0) == 0) {
            std::string expr = line.substr(5);
            double result = evaluator.eval(expr);
            char buf[64];
            snprintf(buf, sizeof(buf), "%.6g", result);
            output += std::string(buf) + "\n";
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
