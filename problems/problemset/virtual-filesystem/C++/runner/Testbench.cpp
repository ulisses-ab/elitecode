#include <bits/stdc++.h>
#include <nlohmann/json.hpp>
#include <chrono>
#include <sys/resource.h>
#include "../code/VFS.h"

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
    auto input = testcase["input"].get<std::string>();

    std::stringstream ss(input);
    std::string line;
    std::string output;
    VFS vfs;

    auto start = std::chrono::high_resolution_clock::now();

    while (std::getline(ss, line)) {
        if (line.empty()) continue;
        std::istringstream tok(line);
        std::string cmd;
        tok >> cmd;

        if (cmd == "MKDIR") {
            std::string path; tok >> path;
            output += vfs.mkdir(path);
        } else if (cmd == "TOUCH") {
            std::string path; tok >> path;
            output += vfs.touch(path);
        } else if (cmd == "WRITE") {
            std::string path; tok >> path;
            std::string content;
            std::getline(tok, content);
            if (!content.empty() && content[0] == ' ') content = content.substr(1);
            output += vfs.write(path, content);
        } else if (cmd == "READ") {
            std::string path; tok >> path;
            output += vfs.read(path);
        } else if (cmd == "LS") {
            std::string path; tok >> path;
            output += vfs.ls(path);
        } else if (cmd == "RM") {
            std::string next; tok >> next;
            if (next == "-r") {
                std::string path; tok >> path;
                output += vfs.rmr(path);
            } else {
                output += vfs.rm(next);
            }
        } else if (cmd == "MV") {
            std::string src, dst; tok >> src >> dst;
            output += vfs.mv(src, dst);
        } else if (cmd == "CP") {
            std::string src, dst; tok >> src >> dst;
            output += vfs.cp(src, dst);
        } else if (cmd == "FIND") {
            std::string path, name; tok >> path >> name;
            output += vfs.find(path, name);
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
