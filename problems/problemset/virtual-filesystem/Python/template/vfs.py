class VFS:
    def __init__(self):
        pass

    def mkdir(self, path: str) -> str:
        """Create a directory. Returns '' on success or 'ERROR: <reason>\\n' on failure."""
        pass

    def touch(self, path: str) -> str:
        """Create an empty file. Returns '' on success or 'ERROR: <reason>\\n' on failure."""
        pass

    def write(self, path: str, content: str) -> str:
        """Write content to a file (creates if absent). Returns '' or 'ERROR: <reason>\\n'."""
        pass

    def read(self, path: str) -> str:
        """Return file content + '\\n', or 'ERROR: <reason>\\n'."""
        pass

    def ls(self, path: str) -> str:
        """List directory entries sorted, dirs suffixed '/'. Returns 'ERROR: <reason>\\n' on failure."""
        pass

    def rm(self, path: str) -> str:
        """Remove a file or empty directory. Returns '' or 'ERROR: <reason>\\n'."""
        pass

    def rmr(self, path: str) -> str:
        """Remove recursively. Returns '' or 'ERROR: <reason>\\n'."""
        pass

    def mv(self, src: str, dst: str) -> str:
        """Move/rename. Returns '' or 'ERROR: <reason>\\n'."""
        pass

    def cp(self, src: str, dst: str) -> str:
        """Deep-copy src to dst. Returns '' or 'ERROR: <reason>\\n'."""
        pass

    def find(self, path: str, name: str) -> str:
        """Return sorted paths under path whose final component equals name, one per line."""
        pass
