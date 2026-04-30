# Problems

This directory contains all EliteCode problems and the scripts to seed them into a running backend.

## Directory layout

```
problems/
├── problemset/          # one subdirectory per problem slug
│   └── <slug>/
│       ├── info.json        # title, difficulty, tags
│       ├── statement.md     # problem description shown to the user
│       ├── tests.json       # test cases
│       └── C++/
│           ├── template/    # starter file(s) given to the user
│           ├── runner/      # compile.sh, run.sh, Testbench.cpp
│           └── solution/    # reference solution (not uploaded)
├── scripts/             # seeding and upload helpers
└── data/                # scratch files used by scripts (gitignored except .gitkeep)
    └── token.txt        # admin JWT — required for all scripts
```

---

## Creating a new problem

### 1. Choose a slug

Use lowercase kebab-case (e.g. `lfu-cache`, `graph-engine`). Create the directory:

```bash
mkdir -p problems/problemset/<slug>/C++/{template,runner,solution}
```

### 2. `info.json`

```json
{
  "title": "Human-Readable Title",
  "description": "",
  "difficulty": "EASY",
  "tags": ["design", "queues"]
}
```

`difficulty` must be one of `EASY`, `MEDIUM`, `HARD`, `EXPERT`.  
`tags` is optional — omit or use `[]` if none.

### 3. `statement.md`

Markdown shown in the problem view. Describe the interface the user must implement, the commands (for stateful problems) or function signatures (for functional ones), constraints, and example input/output.

### 4. `tests.json`

```json
{
  "testcases": [
    { "input": "...", "output": "..." }
  ]
}
```

The `input` string is whatever `run.sh` reads from stdin. The `output` string is compared character-for-character against `actual_output` returned by the testbench. For command-based protocols, both are typically newline-separated strings.

### 5. `C++/template/`

Put the header file(s) the user will edit here (e.g. `MyClass.h`). These are zipped and served to the editor as the user's starting point.

### 6. `C++/runner/`

Three required files:

**`compile.sh`** — runs inside `/workspace` with `runner/` and `code/` subdirectories available. Must produce `build/program.out`.

```bash
#!/bin/bash
set -e
g++ -std=c++20 $(find runner/ code/ -name "*.cpp") -o build/program.out
```

**`run.sh`** — receives one test case as JSON on stdin and runs the compiled binary.

```bash
./build/program.out
```

**`Testbench.cpp`** — the test harness. It:
1. Reads the full test case JSON from stdin (`testcase["input"]` and optionally `testcase["output"]`).
2. Constructs and exercises the user's class/function.
3. Prints exactly: `__BEGIN_RESULT__<json>__END_RESULT__`

The result JSON must have three fields:

```json
{ "actual_output": "...", "time_ms": 1.23, "memory_kb": 4096 }
```

The executor compares `actual_output` against the `output` field from `tests.json`.

Minimal testbench skeleton:

```cpp
#include <bits/stdc++.h>
#include <nlohmann/json.hpp>
#include <chrono>
#include <sys/resource.h>
#include "../code/MyClass.h"

using json = nlohmann::json;

static long peakMemoryKB() {
    struct rusage u; getrusage(RUSAGE_SELF, &u); return u.ru_maxrss;
}

int main() {
    std::string raw((std::istreambuf_iterator<char>(std::cin)),
                     std::istreambuf_iterator<char>());
    json tc = json::parse(raw);
    auto input = tc["input"].get<std::string>();

    std::string output;
    auto t0 = std::chrono::high_resolution_clock::now();

    // --- drive your class here, build output string ---

    auto t1 = std::chrono::high_resolution_clock::now();
    double ms = std::chrono::duration<double, std::milli>(t1 - t0).count();

    json result;
    result["actual_output"] = output;
    result["time_ms"]       = ms;
    result["memory_kb"]     = peakMemoryKB();
    std::cout << "__BEGIN_RESULT__" << result.dump() << "__END_RESULT__";
}
```

See `rate-limiter/` or `ttl-cache/` for complete stateful (command-based) examples.

### 7. `C++/solution/` (optional)

Put your reference solution here. These files are **never uploaded** — they exist only for local testing and future reference.

---

## Seeding problems into the backend

All scripts require a valid admin JWT in `problems/data/token.txt`. The backend must be running on `localhost:3030`.

### Seed everything

```bash
bash problems/scripts/seed_all.sh
```

Iterates over every slug in `problemset/`, skips any problem whose title already exists in the database, and for each new problem:

1. `POST /api/problems` — creates the problem record (title, statement, difficulty, tags).
2. `POST /api/problems/:id/setups` — creates a language setup (one per language directory).
3. Zips and uploads `runner/` → `POST /api/problems/:id/setups/:sid/runner`.
4. Uploads `tests.json` → `POST /api/problems/:id/setups/:sid/tests`.
5. Zips and uploads `template/` → `POST /api/problems/:id/setups/:sid/template`.

### Seed specific problems

```bash
for slug in rate-limiter ttl-cache lfu-cache; do
  PROBLEM_DIR="problems/problemset/$slug"
  # run the same curl sequence as seed_all.sh scoped to $PROBLEM_DIR
done
```

Or just run `seed_all.sh` — it is idempotent and will skip already-existing titles.

---

## Re-uploading assets for an existing problem

If you need to update the runner, tests, or template for a problem that is already in the database, use the individual scripts in `problems/scripts/`. Each reads IDs from `problems/data/`:

| File | Contents |
|------|----------|
| `token.txt` | Admin JWT |
| `problem.txt` | Problem UUID |
| `setup.txt` | Setup UUID |

**Re-upload runner:**
```bash
cd problems/scripts
bash submitrunner.sh   # uploads runner.zip from problems/data/
```

**Re-upload tests:**
```bash
bash submittests.sh    # uploads tests.json from problems/data/
```

**Re-upload template:**
```bash
bash submittemplate.sh # uploads template.zip from problems/data/
```

To create a new setup on an existing problem (e.g. adding a Python setup):
```bash
bash addsetup.sh
```

For these scripts, prepare the zip files manually:
```bash
# runner
(cd problems/problemset/<slug>/C++/runner && zip -r ../../../data/runner.zip .)

# template
(cd problems/problemset/<slug>/C++/template && zip -r ../../../data/template.zip .)
```

Then copy `tests.json` and write the UUIDs into `problem.txt` / `setup.txt`.

---

## Protocol patterns

### Stateful / command-based (most problems)

The testbench parses `testcase["input"]` as a sequence of commands, one per line. Example from `rate-limiter`:

```
INIT 3 1000
REQUEST 0
REQUEST 100
```

Output is the concatenated responses, one per line:
```
ALLOWED
ALLOWED
```

See `mini-redis/`, `virtual-filesystem/`, and `url-router/` for more complex command sets.

### Functional (single return value)

The testbench deserializes `testcase["input"]` as JSON, calls the user's function, and serializes the result as the `actual_output` string.
