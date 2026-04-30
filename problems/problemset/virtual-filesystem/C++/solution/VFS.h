#include <bits/stdc++.h>

class VFS {
    struct Node {
        bool isDir;
        std::string content;
        std::map<std::string, std::shared_ptr<Node>> children;
        explicit Node(bool d) : isDir(d) {}
    };
    using NodePtr = std::shared_ptr<Node>;

    NodePtr root;

    static std::vector<std::string> splitPath(const std::string& path) {
        std::vector<std::string> parts;
        std::stringstream ss(path);
        std::string part;
        while (std::getline(ss, part, '/'))
            if (!part.empty()) parts.push_back(part);
        return parts;
    }

    NodePtr resolve(const std::string& path) const {
        NodePtr cur = root;
        for (const auto& p : splitPath(path)) {
            if (!cur->isDir) return nullptr;
            auto it = cur->children.find(p);
            if (it == cur->children.end()) return nullptr;
            cur = it->second;
        }
        return cur;
    }

    // Returns {parent dir, leaf name}. Returns {nullptr,""} if parent missing or path is root.
    std::pair<NodePtr, std::string> resolveParent(const std::string& path) const {
        auto parts = splitPath(path);
        if (parts.empty()) return {nullptr, ""};
        std::string name = parts.back();
        parts.pop_back();
        NodePtr cur = root;
        for (const auto& p : parts) {
            if (!cur->isDir) return {nullptr, ""};
            auto it = cur->children.find(p);
            if (it == cur->children.end()) return {nullptr, ""};
            cur = it->second;
        }
        return {cur, name};
    }

    static NodePtr deepCopy(const NodePtr& src) {
        auto node = std::make_shared<Node>(src->isDir);
        node->content = src->content;
        for (const auto& [k, v] : src->children)
            node->children[k] = deepCopy(v);
        return node;
    }

    void collectFind(const NodePtr& node, const std::string& base,
                     const std::string& name, std::vector<std::string>& out) const {
        if (!node->isDir) return;
        for (const auto& [childName, child] : node->children) {
            std::string childPath = base + "/" + childName;
            if (childName == name) out.push_back(childPath);
            collectFind(child, childPath, name, out);
        }
    }

public:
    VFS() : root(std::make_shared<Node>(true)) {}

    std::string mkdir(const std::string& path) {
        auto [parent, name] = resolveParent(path);
        if (!parent)               return "ERROR: not found\n";
        if (!parent->isDir)        return "ERROR: not a directory\n";
        if (parent->children.count(name)) return "ERROR: already exists\n";
        parent->children[name] = std::make_shared<Node>(true);
        return "";
    }

    std::string touch(const std::string& path) {
        auto [parent, name] = resolveParent(path);
        if (!parent)               return "ERROR: not found\n";
        if (!parent->isDir)        return "ERROR: not a directory\n";
        if (parent->children.count(name)) return "ERROR: already exists\n";
        parent->children[name] = std::make_shared<Node>(false);
        return "";
    }

    std::string write(const std::string& path, const std::string& content) {
        auto [parent, name] = resolveParent(path);
        if (!parent)        return "ERROR: not found\n";
        if (!parent->isDir) return "ERROR: not a directory\n";
        auto it = parent->children.find(name);
        if (it != parent->children.end()) {
            if (it->second->isDir) return "ERROR: is a directory\n";
            it->second->content = content;
        } else {
            auto node = std::make_shared<Node>(false);
            node->content = content;
            parent->children[name] = node;
        }
        return "";
    }

    std::string read(const std::string& path) {
        auto node = resolve(path);
        if (!node)        return "ERROR: not found\n";
        if (node->isDir)  return "ERROR: is a directory\n";
        return node->content + "\n";
    }

    std::string ls(const std::string& path) {
        auto node = resolve(path);
        if (!node)       return "ERROR: not found\n";
        if (!node->isDir) return "ERROR: not a directory\n";
        std::string out;
        for (const auto& [name, child] : node->children)
            out += name + (child->isDir ? "/" : "") + "\n";
        return out;
    }

    std::string rm(const std::string& path) {
        auto [parent, name] = resolveParent(path);
        if (!parent) return "ERROR: not found\n";
        auto it = parent->children.find(name);
        if (it == parent->children.end()) return "ERROR: not found\n";
        if (it->second->isDir && !it->second->children.empty()) return "ERROR: not empty\n";
        parent->children.erase(it);
        return "";
    }

    std::string rmr(const std::string& path) {
        auto [parent, name] = resolveParent(path);
        if (!parent) return "ERROR: not found\n";
        auto it = parent->children.find(name);
        if (it == parent->children.end()) return "ERROR: not found\n";
        parent->children.erase(it);
        return "";
    }

    std::string mv(const std::string& src, const std::string& dst) {
        auto [srcParent, srcName] = resolveParent(src);
        if (!srcParent) return "ERROR: not found\n";
        auto srcIt = srcParent->children.find(srcName);
        if (srcIt == srcParent->children.end()) return "ERROR: not found\n";

        auto [dstParent, dstName] = resolveParent(dst);
        if (!dstParent)        return "ERROR: not found\n";
        if (!dstParent->isDir) return "ERROR: not a directory\n";
        if (dstParent->children.count(dstName)) return "ERROR: already exists\n";

        dstParent->children[dstName] = srcIt->second;
        srcParent->children.erase(srcIt);
        return "";
    }

    std::string cp(const std::string& src, const std::string& dst) {
        auto srcNode = resolve(src);
        if (!srcNode) return "ERROR: not found\n";

        auto [dstParent, dstName] = resolveParent(dst);
        if (!dstParent)        return "ERROR: not found\n";
        if (!dstParent->isDir) return "ERROR: not a directory\n";
        if (dstParent->children.count(dstName)) return "ERROR: already exists\n";

        dstParent->children[dstName] = deepCopy(srcNode);
        return "";
    }

    std::string find(const std::string& path, const std::string& name) {
        auto node = resolve(path);
        if (!node)        return "ERROR: not found\n";
        if (!node->isDir) return "ERROR: not a directory\n";

        std::string base = (path == "/") ? "" : path;
        std::vector<std::string> results;
        collectFind(node, base, name, results);
        std::sort(results.begin(), results.end());

        std::string out;
        for (const auto& r : results) out += r + "\n";
        return out;
    }
};
