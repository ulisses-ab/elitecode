use std::collections::BTreeMap;

struct Node {
    is_dir: bool,
    content: String,
    children: BTreeMap<String, Box<Node>>,
}

impl Node {
    fn dir() -> Box<Self> {
        Box::new(Node { is_dir: true, content: String::new(), children: BTreeMap::new() })
    }
    fn file() -> Box<Self> {
        Box::new(Node { is_dir: false, content: String::new(), children: BTreeMap::new() })
    }
    fn deep_copy(&self) -> Box<Self> {
        let mut n = Box::new(Node { is_dir: self.is_dir, content: self.content.clone(), children: BTreeMap::new() });
        for (k, v) in &self.children {
            n.children.insert(k.clone(), v.deep_copy());
        }
        n
    }
}

fn split_path(path: &str) -> Vec<&str> {
    path.split('/').filter(|s| !s.is_empty()).collect()
}

fn collect_find(node: &Node, base: &str, name: &str, out: &mut Vec<String>) {
    for (child_name, child) in &node.children {
        let child_path = format!("{}/{}", base, child_name);
        if child_name == name { out.push(child_path.clone()); }
        if child.is_dir { collect_find(child, &child_path, name, out); }
    }
}

pub struct VFS {
    root: Box<Node>,
}

impl VFS {
    pub fn new() -> Self {
        VFS { root: Node::dir() }
    }

    fn resolve(&self, path: &str) -> Option<&Node> {
        let mut cur: &Node = &self.root;
        for part in split_path(path) {
            if !cur.is_dir { return None; }
            cur = cur.children.get(part)?;
        }
        Some(cur)
    }

    fn navigate_to_parent<'a>(cur: &'a mut Node, parts: &[&str]) -> Option<&'a mut Node> {
        let mut node = cur;
        for &part in parts {
            if !node.is_dir { return None; }
            node = node.children.get_mut(part)?;
        }
        Some(node)
    }

    fn extract_node(&mut self, path: &str) -> Option<Box<Node>> {
        let parts = split_path(path);
        if parts.is_empty() { return None; }
        let n = parts.len();
        let parent = Self::navigate_to_parent(&mut self.root, &parts[..n-1])?;
        parent.children.remove(parts[n-1])
    }

    fn insert_node(&mut self, path: &str, node: Box<Node>) -> String {
        let parts = split_path(path);
        if parts.is_empty() { return "ERROR: not found\n".into(); }
        let n = parts.len();
        let parent = match Self::navigate_to_parent(&mut self.root, &parts[..n-1]) {
            None => return "ERROR: not found\n".into(),
            Some(p) => p,
        };
        let name = parts[n-1];
        if !parent.is_dir { return "ERROR: not a directory\n".into(); }
        if parent.children.contains_key(name) { return "ERROR: already exists\n".into(); }
        parent.children.insert(name.to_string(), node);
        String::new()
    }

    pub fn mkdir(&mut self, path: &str) -> String {
        let parts = split_path(path);
        if parts.is_empty() { return "ERROR: not found\n".into(); }
        let n = parts.len();
        let parent = match Self::navigate_to_parent(&mut self.root, &parts[..n-1]) {
            None => return "ERROR: not found\n".into(),
            Some(p) => p,
        };
        let name = parts[n-1];
        if !parent.is_dir { return "ERROR: not a directory\n".into(); }
        if parent.children.contains_key(name) { return "ERROR: already exists\n".into(); }
        parent.children.insert(name.to_string(), Node::dir());
        String::new()
    }

    pub fn touch(&mut self, path: &str) -> String {
        let parts = split_path(path);
        if parts.is_empty() { return "ERROR: not found\n".into(); }
        let n = parts.len();
        let parent = match Self::navigate_to_parent(&mut self.root, &parts[..n-1]) {
            None => return "ERROR: not found\n".into(),
            Some(p) => p,
        };
        let name = parts[n-1];
        if !parent.is_dir { return "ERROR: not a directory\n".into(); }
        if parent.children.contains_key(name) { return "ERROR: already exists\n".into(); }
        parent.children.insert(name.to_string(), Node::file());
        String::new()
    }

    pub fn write(&mut self, path: &str, content: &str) -> String {
        let parts = split_path(path);
        if parts.is_empty() { return "ERROR: not found\n".into(); }
        let n = parts.len();
        let parent = match Self::navigate_to_parent(&mut self.root, &parts[..n-1]) {
            None => return "ERROR: not found\n".into(),
            Some(p) => p,
        };
        let name = parts[n-1];
        if !parent.is_dir { return "ERROR: not a directory\n".into(); }
        match parent.children.get_mut(name) {
            Some(node) => {
                if node.is_dir { return "ERROR: is a directory\n".into(); }
                node.content = content.to_string();
            }
            None => {
                let mut node = Node::file();
                node.content = content.to_string();
                parent.children.insert(name.to_string(), node);
            }
        }
        String::new()
    }

    pub fn read(&self, path: &str) -> String {
        match self.resolve(path) {
            None => "ERROR: not found\n".into(),
            Some(n) if n.is_dir => "ERROR: is a directory\n".into(),
            Some(n) => n.content.clone() + "\n",
        }
    }

    pub fn ls(&self, path: &str) -> String {
        match self.resolve(path) {
            None => "ERROR: not found\n".into(),
            Some(n) if !n.is_dir => "ERROR: not a directory\n".into(),
            Some(n) => {
                let mut out = String::new();
                for (name, child) in &n.children {
                    out.push_str(name);
                    if child.is_dir { out.push('/'); }
                    out.push('\n');
                }
                out
            }
        }
    }

    pub fn rm(&mut self, path: &str) -> String {
        let parts = split_path(path);
        if parts.is_empty() { return "ERROR: not found\n".into(); }
        let n = parts.len();
        let parent = match Self::navigate_to_parent(&mut self.root, &parts[..n-1]) {
            None => return "ERROR: not found\n".into(),
            Some(p) => p,
        };
        let name = parts[n-1];
        match parent.children.get(name) {
            None => return "ERROR: not found\n".into(),
            Some(node) if node.is_dir && !node.children.is_empty() => return "ERROR: not empty\n".into(),
            _ => {}
        }
        parent.children.remove(name);
        String::new()
    }

    pub fn rmr(&mut self, path: &str) -> String {
        let parts = split_path(path);
        if parts.is_empty() { return "ERROR: not found\n".into(); }
        let n = parts.len();
        let parent = match Self::navigate_to_parent(&mut self.root, &parts[..n-1]) {
            None => return "ERROR: not found\n".into(),
            Some(p) => p,
        };
        let name = parts[n-1];
        if !parent.children.contains_key(name) { return "ERROR: not found\n".into(); }
        parent.children.remove(name);
        String::new()
    }

    pub fn mv(&mut self, src: &str, dst: &str) -> String {
        // Validate dst before touching src
        let dst_parts = split_path(dst);
        if dst_parts.is_empty() { return "ERROR: not found\n".into(); }
        let dst_name = dst_parts[dst_parts.len()-1].to_string();
        let dst_parent_path = format!("/{}", dst_parts[..dst_parts.len()-1].join("/"));
        {
            match self.resolve(&dst_parent_path) {
                None => return "ERROR: not found\n".into(),
                Some(p) if !p.is_dir => return "ERROR: not a directory\n".into(),
                Some(p) if p.children.contains_key(&dst_name) => return "ERROR: already exists\n".into(),
                _ => {}
            }
        }
        match self.extract_node(src) {
            None => "ERROR: not found\n".into(),
            Some(node) => self.insert_node(dst, node),
        }
    }

    pub fn cp(&mut self, src: &str, dst: &str) -> String {
        let copied = match self.resolve(src) {
            None => return "ERROR: not found\n".into(),
            Some(n) => n.deep_copy(),
        };
        self.insert_node(dst, copied)
    }

    pub fn find(&self, path: &str, name: &str) -> String {
        match self.resolve(path) {
            None => "ERROR: not found\n".into(),
            Some(n) if !n.is_dir => "ERROR: not a directory\n".into(),
            Some(n) => {
                let base = if path == "/" { "" } else { path };
                let mut results = Vec::new();
                collect_find(n, base, name, &mut results);
                results.sort();
                results.iter().map(|r| format!("{}\n", r)).collect()
            }
        }
    }
}
