#include <bits/stdc++.h>
#include <nlohmann/json.hpp>
#include <chrono>
#include <sys/resource.h>
#include "../code/Interpreter.h"

using json = nlohmann::json;

static long peakMemoryKB() {
    struct rusage usage;
    getrusage(RUSAGE_SELF, &usage);
    return usage.ru_maxrss;
}

int main() {
    std::string raw((std::istreambuf_iterator<char>(std::cin)),
                     std::istreambuf_iterator<char>());
    json testcase = json::parse(raw);
    std::string source = testcase["input"].get<std::string>();

    Interpreter interp;

    auto start = std::chrono::high_resolution_clock::now();
    std::string output = interp.run(source);
    auto end   = std::chrono::high_resolution_clock::now();

    double time_ms   = std::chrono::duration<double, std::milli>(end - start).count();
    long   memory_kb = peakMemoryKB();

    json result;
    result["actual_output"] = output;
    result["time_ms"]       = time_ms;
    result["memory_kb"]     = memory_kb;

    std::cout << "__BEGIN_RESULT__" << result.dump() << "__END_RESULT__";
}
