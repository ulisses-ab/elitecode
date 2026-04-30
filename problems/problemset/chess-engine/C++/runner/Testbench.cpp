#include <bits/stdc++.h>
#include <nlohmann/json.hpp>
#include <chrono>
#include <sys/resource.h>
#include "../code/Chess.h"

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
    Chess game;

    auto start = std::chrono::high_resolution_clock::now();

    while (std::getline(ss, line)) {
        if (line.empty()) continue;
        std::istringstream ls(line);
        std::string cmd;
        ls >> cmd;

        if (cmd == "NEW") {
            game.newGame();
        } else if (cmd == "MOVE") {
            std::string mv;
            ls >> mv;
            output += game.move(mv) + '\n';
        } else if (cmd == "PRINT") {
            output += game.print();
        } else if (cmd == "MOVES") {
            std::string sq;
            ls >> sq;
            output += game.moves(sq) + '\n';
        } else if (cmd == "STATUS") {
            output += game.status() + '\n';
        } else if (cmd == "HISTORY") {
            output += game.history();
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
