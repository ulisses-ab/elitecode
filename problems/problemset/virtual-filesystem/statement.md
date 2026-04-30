Implement an in-memory filesystem that supports the following commands.

All paths are **absolute** (start with `/`). The root directory `/` always exists. Path components contain only lowercase letters, digits, `.`, `-`, and `_`.

## Commands

| Command | Description |
|---|---|
| `MKDIR path` | Create a directory. Parent must exist. |
| `TOUCH path` | Create an empty file. Parent must exist. |
| `WRITE path content` | Write content to a file (creates it if absent; content is everything after the path). |
| `READ path` | Print the file's content. |
| `LS path` | List entries in a directory, one per line, sorted. Directories are suffixed with `/`. |
| `RM path` | Remove a file or an empty directory. |
| `RM -r path` | Remove a file or directory recursively. |
| `MV src dst` | Move/rename a node. `dst` must not already exist; its parent must exist. |
| `CP src dst` | Deep-copy a node to `dst`. `dst` must not already exist; its parent must exist. |
| `FIND path name` | Print all paths under `path` whose final component equals `name`, sorted. |

## Output

Commands that succeed silently (`MKDIR`, `TOUCH`, `WRITE`, `RM`, `MV`, `CP`) produce no output.

On failure, print `ERROR: <reason>` where reason is one of:

| Reason | When |
|---|---|
| `not found` | Path or parent doesn't exist |
| `already exists` | Target path already exists |
| `not a directory` | Expected a directory, got a file |
| `is a directory` | Expected a file, got a directory |
| `not empty` | `RM` on a non-empty directory without `-r` |

## Example

```
MKDIR /home
MKDIR /home/user
WRITE /home/user/notes.txt hello world
READ /home/user/notes.txt     → hello world
LS /home                      → user/
LS /home/user                 → notes.txt
RM /home                      → ERROR: not empty
RM -r /home
LS /                          → (empty)
```

## Notes

This problem is open-ended by design. A clean solution will likely decompose into separate structures for nodes, path resolution, and the filesystem operations — feel free to use as many files as you need.
