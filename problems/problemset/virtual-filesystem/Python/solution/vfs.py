class VFS:
    class _Node:
        __slots__ = ('is_dir', 'content', 'children')
        def __init__(self, is_dir):
            self.is_dir = is_dir
            self.content = ''
            self.children = {}

    def __init__(self):
        self._root = VFS._Node(True)

    @staticmethod
    def _split(path):
        return [p for p in path.split('/') if p]

    def _resolve(self, path):
        cur = self._root
        for p in self._split(path):
            if not cur.is_dir: return None
            cur = cur.children.get(p)
            if cur is None: return None
        return cur

    def _resolve_parent(self, path):
        parts = self._split(path)
        if not parts: return None, ''
        cur = self._root
        for p in parts[:-1]:
            if not cur.is_dir: return None, ''
            cur = cur.children.get(p)
            if cur is None: return None, ''
        return cur, parts[-1]

    @classmethod
    def _deep_copy(cls, node):
        n = cls._Node(node.is_dir)
        n.content = node.content
        for k, v in node.children.items():
            n.children[k] = cls._deep_copy(v)
        return n

    def _collect_find(self, node, base, name, out):
        for child_name, child in node.children.items():
            child_path = base + '/' + child_name
            if child_name == name:
                out.append(child_path)
            if child.is_dir:
                self._collect_find(child, child_path, name, out)

    def mkdir(self, path):
        parent, name = self._resolve_parent(path)
        if parent is None: return 'ERROR: not found\n'
        if not parent.is_dir: return 'ERROR: not a directory\n'
        if name in parent.children: return 'ERROR: already exists\n'
        parent.children[name] = VFS._Node(True)
        return ''

    def touch(self, path):
        parent, name = self._resolve_parent(path)
        if parent is None: return 'ERROR: not found\n'
        if not parent.is_dir: return 'ERROR: not a directory\n'
        if name in parent.children: return 'ERROR: already exists\n'
        parent.children[name] = VFS._Node(False)
        return ''

    def write(self, path, content):
        parent, name = self._resolve_parent(path)
        if parent is None: return 'ERROR: not found\n'
        if not parent.is_dir: return 'ERROR: not a directory\n'
        if name in parent.children:
            if parent.children[name].is_dir: return 'ERROR: is a directory\n'
            parent.children[name].content = content
        else:
            node = VFS._Node(False)
            node.content = content
            parent.children[name] = node
        return ''

    def read(self, path):
        node = self._resolve(path)
        if node is None: return 'ERROR: not found\n'
        if node.is_dir: return 'ERROR: is a directory\n'
        return node.content + '\n'

    def ls(self, path):
        node = self._resolve(path)
        if node is None: return 'ERROR: not found\n'
        if not node.is_dir: return 'ERROR: not a directory\n'
        return ''.join(k + ('/' if v.is_dir else '') + '\n'
                       for k, v in sorted(node.children.items()))

    def rm(self, path):
        parent, name = self._resolve_parent(path)
        if parent is None: return 'ERROR: not found\n'
        if name not in parent.children: return 'ERROR: not found\n'
        node = parent.children[name]
        if node.is_dir and node.children: return 'ERROR: not empty\n'
        del parent.children[name]
        return ''

    def rmr(self, path):
        parent, name = self._resolve_parent(path)
        if parent is None: return 'ERROR: not found\n'
        if name not in parent.children: return 'ERROR: not found\n'
        del parent.children[name]
        return ''

    def mv(self, src, dst):
        src_parent, src_name = self._resolve_parent(src)
        if src_parent is None: return 'ERROR: not found\n'
        if src_name not in src_parent.children: return 'ERROR: not found\n'
        dst_parent, dst_name = self._resolve_parent(dst)
        if dst_parent is None: return 'ERROR: not found\n'
        if not dst_parent.is_dir: return 'ERROR: not a directory\n'
        if dst_name in dst_parent.children: return 'ERROR: already exists\n'
        dst_parent.children[dst_name] = src_parent.children.pop(src_name)
        return ''

    def cp(self, src, dst):
        src_node = self._resolve(src)
        if src_node is None: return 'ERROR: not found\n'
        dst_parent, dst_name = self._resolve_parent(dst)
        if dst_parent is None: return 'ERROR: not found\n'
        if not dst_parent.is_dir: return 'ERROR: not a directory\n'
        if dst_name in dst_parent.children: return 'ERROR: already exists\n'
        dst_parent.children[dst_name] = self._deep_copy(src_node)
        return ''

    def find(self, path, name):
        node = self._resolve(path)
        if node is None: return 'ERROR: not found\n'
        if not node.is_dir: return 'ERROR: not a directory\n'
        base = '' if path == '/' else path
        results = []
        self._collect_find(node, base, name, results)
        results.sort()
        return ''.join(r + '\n' for r in results)
