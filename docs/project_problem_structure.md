---
name: Problem Structure
description: How problems, setups, runners, and tests are organized on disk and in S3
type: project
originSessionId: 5ccf35ce-0f51-4d36-b864-05c7acc341a9
---
**Local disk layout** (`problems/problemset/{slug}/`):
```
two-sum/
├── statement.md          # Markdown problem description
├── info.json             # { title, difficulty, description }
├── tests.json            # { testcases: [{ input: {...}, output: ... }] }
├── C++/
│   ├── template/         # Starter code user sees (function signature)
│   └── runner/
│       ├── compile.sh    # g++ compile command
│       ├── run.sh        # Execute compiled binary
│       └── Testbench.cpp # JSON parsing harness + calls user function
└── Python/
    └── runner/
        ├── run.sh
        └── tester.py     # Python equivalent of Testbench
```

**Runner protocol:**
- `compile.sh` compiles everything in `runner/` + `code/` dirs
- `run.sh` receives test input via `/workspace/input/a.in` (JSON)
- Output must wrap result with `__BEGIN_RESULT__` and `__END_RESULT__` markers
- Executor compares parsed output to `expected` from tests.json

**Test case format:**
```json
{ "testcases": [{ "input": { "nums": [2,7], "target": 9 }, "output": [0,1] }] }
```

**To add a new problem via API:**
1. `POST /problems` → get problemId
2. `POST /problems/:id/setups` with `{ language, info }` → get setupId
3. Upload template, runner zip, tests JSON to respective endpoints

**How to apply:** When adding new language support or a new problem, follow the runner protocol exactly — the executor is language-agnostic and only cares about compile.sh, run.sh, and the output markers. The `problems/scripts/` directory has helper shell scripts for managing problems.
