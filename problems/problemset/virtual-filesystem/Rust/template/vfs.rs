pub struct VFS {
    // Add your filesystem representation here
}

impl VFS {
    pub fn new() -> Self {
        todo!()
    }

    /// Create a directory. Returns "" on success or "ERROR: <reason>\n" on failure.
    pub fn mkdir(&mut self, path: &str) -> String { todo!() }

    /// Create an empty file. Returns "" on success or "ERROR: <reason>\n" on failure.
    pub fn touch(&mut self, path: &str) -> String { todo!() }

    /// Write content to a file (creates if absent). Returns "" or "ERROR: <reason>\n".
    pub fn write(&mut self, path: &str, content: &str) -> String { todo!() }

    /// Return file content + "\n", or "ERROR: <reason>\n".
    pub fn read(&self, path: &str) -> String { todo!() }

    /// List directory entries sorted, dirs suffixed with '/'. Returns "ERROR: <reason>\n" on failure.
    pub fn ls(&self, path: &str) -> String { todo!() }

    /// Remove a file or empty directory. Returns "" or "ERROR: <reason>\n".
    pub fn rm(&mut self, path: &str) -> String { todo!() }

    /// Remove recursively. Returns "" or "ERROR: <reason>\n".
    pub fn rmr(&mut self, path: &str) -> String { todo!() }

    /// Move/rename. Returns "" or "ERROR: <reason>\n".
    pub fn mv(&mut self, src: &str, dst: &str) -> String { todo!() }

    /// Deep-copy src to dst. Returns "" or "ERROR: <reason>\n".
    pub fn cp(&mut self, src: &str, dst: &str) -> String { todo!() }

    /// Return sorted paths under path whose final component equals name, one per line.
    pub fn find(&self, path: &str, name: &str) -> String { todo!() }
}
