#include <bits/stdc++.h>
#include <nlohmann/json.hpp>
#include <chrono>
#include <sys/resource.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <thread>
#include "../code/MiniRedis.h"

using json = nlohmann::json;

static const int PORT = 16379;

static long peakMemoryKB() {
    struct rusage usage;
    getrusage(RUSAGE_SELF, &usage);
    return usage.ru_maxrss;
}

static std::string rline(int fd) {
    std::string s;
    char c;
    while (read(fd, &c, 1) > 0) {
        if (c == '\n') break;
        if (c != '\r') s += c;
    }
    return s;
}

static std::string rbulk_data(int fd, int n) {
    std::string s(n, '\0');
    int got = 0;
    while (got < n) {
        int r = read(fd, s.data() + got, n - got);
        if (r <= 0) break;
        got += r;
    }
    char cr, lf;
    read(fd, &cr, 1);
    read(fd, &lf, 1);
    return s;
}

static std::string read_resp(int fd) {
    std::string line = rline(fd);
    if (line.empty()) return "";
    char type = line[0];
    std::string rest = line.substr(1);

    if (type == '+' || type == '-') {
        return std::string(1, type) + rest + "\n";
    } else if (type == ':') {
        return ":" + rest + "\n";
    } else if (type == '$') {
        int len = std::stoi(rest);
        if (len < 0) return "$-1\n";
        std::string data = rbulk_data(fd, len);
        return "$" + rest + "\n" + data + "\n";
    } else if (type == '*') {
        int count = std::stoi(rest);
        if (count < 0) return "*-1\n";
        std::string out = "*" + rest + "\n";
        for (int i = 0; i < count; i++) out += read_resp(fd);
        return out;
    }
    return "";
}

static void send_command(int fd, const std::vector<std::string>& args) {
    std::string msg = "*" + std::to_string(args.size()) + "\r\n";
    for (auto& a : args) {
        msg += "$" + std::to_string(a.size()) + "\r\n" + a + "\r\n";
    }
    write(fd, msg.c_str(), msg.size());
}

static std::vector<std::string> parse_line(const std::string& line) {
    std::vector<std::string> tokens;
    std::istringstream ss(line);
    std::string tok;
    while (ss >> tok) tokens.push_back(tok);
    return tokens;
}

int main() {
    std::string testcase_str((std::istreambuf_iterator<char>(std::cin)),
                              std::istreambuf_iterator<char>());
    json testcase = json::parse(testcase_str);

    auto input = testcase["input"].get<std::string>();

    std::vector<std::vector<std::string>> commands;
    std::istringstream ss(input);
    std::string line;
    while (std::getline(ss, line)) {
        auto tokens = parse_line(line);
        if (!tokens.empty()) commands.push_back(tokens);
    }

    MiniRedis server;
    std::thread t([&] { server.start(PORT); });
    t.detach();

    int client_fd = -1;
    for (int i = 0; i < 100; i++) {
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
        client_fd = socket(AF_INET, SOCK_STREAM, 0);
        sockaddr_in addr{};
        addr.sin_family = AF_INET;
        addr.sin_port = htons(PORT);
        inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);
        if (connect(client_fd, (sockaddr*)&addr, sizeof(addr)) == 0) break;
        close(client_fd);
        client_fd = -1;
    }

    if (client_fd < 0) {
        json result;
        result["actual_output"] = "ERROR: could not connect to server";
        result["time_ms"] = 0;
        result["memory_kb"] = 0;
        std::cout << "__BEGIN_RESULT__" << result.dump() << "__END_RESULT__";
        return 0;
    }

    std::string actual_output;
    auto start = std::chrono::high_resolution_clock::now();

    for (auto& cmd : commands) {
        send_command(client_fd, cmd);
        actual_output += read_resp(client_fd);
    }

    auto end = std::chrono::high_resolution_clock::now();
    double time_ms = std::chrono::duration<double, std::milli>(end - start).count();
    long memory_kb = peakMemoryKB();

    close(client_fd);

    json result;
    result["actual_output"] = actual_output;
    result["time_ms"] = time_ms;
    result["memory_kb"] = memory_kb;

    std::cout << "__BEGIN_RESULT__" << result.dump() << "__END_RESULT__";
    return 0;
}
