#include <bits/stdc++.h>

// Each method returns the output to emit (possibly empty on silent success).
// On failure, return "ERROR: <reason>\n".
//
// You are free to add more files to your submission.

class VFS {
public:
    VFS();

    std::string mkdir(const std::string& path);
    std::string touch(const std::string& path);
    std::string write(const std::string& path, const std::string& content);
    std::string read(const std::string& path);
    std::string ls(const std::string& path);
    std::string rm(const std::string& path);   // non-recursive
    std::string rmr(const std::string& path);  // recursive (-r)
    std::string mv(const std::string& src, const std::string& dst);
    std::string cp(const std::string& src, const std::string& dst);
    std::string find(const std::string& path, const std::string& name);
};
