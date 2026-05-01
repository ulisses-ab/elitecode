# EliteCode

A self-hosted coding practice platform. Users pick a problem, write code in the browser, and get real execution feedback — pass/fail per test case, runtime, and memory.

## Architecture

Three services, each in its own directory:

| Service | Directory | Purpose |
|---|---|---|
| Backend API | `backend/` | REST API, auth, problem/submission management (Node + Prisma) |
| Frontend | `frontend/` | React SPA — problem list, workspace, editor |
| Executor | `executor/` | Runs user code in Docker, reports results via BullMQ |

Problems and their runner harnesses live in `problems/`.

## Running locally

```bash
# 1. Start infrastructure (Postgres, Redis, MinIO)
docker compose up -d

# 2. Backend
cd backend && npm install && npm run dev

# 3. Executor
cd executor && npm install && npm run dev

# 4. Frontend
cd frontend && npm install && npm run dev
```

## Adding problems

Problems live under `problems/problemset/<slug>/`. Each problem needs:

```
<slug>/
├── info.json       # { title, difficulty, tags? }
├── statement.md    # Markdown shown to the user
├── tests.json      # { testcases: [{ input, output }] }
└── C++/
    ├── template/   # starter file(s) given to the user
    └── runner/
        ├── compile.sh    # must produce build/program.out
        ├── run.sh        # runs the binary
        └── Testbench.cpp # test harness
```

### `info.json` format

```json
{
  "title": "My Problem",
  "description": "",
  "difficulty": "EASY",
  "tags": ["design", "queues"]
}
```

`tags` is optional — omit the field or use `[]` for no tags.

### Runner protocol

- `compile.sh` has access to `runner/` (harness) and `code/` (user's files). Typical compile line: `g++ -std=c++20 $(find runner/ code/ -name "*.cpp") -o build/program.out`
- `run.sh` receives one test case as JSON on stdin and must print: `__BEGIN_RESULT__{"actual_output":"...","time_ms":0,"memory_kb":0}__END_RESULT__`
- The executor compares `actual_output` to the `output` field in `tests.json`.

### Seeding into the database

Requires the backend running and a valid admin JWT at `problems/data/token.txt`.

```bash
bash problems/scripts/seed_all.sh
```

The script creates a DB entry for every slug in `problemset/`, uploading the runner zip, template zip, and `tests.json` for each language directory it finds. Tags are read from `info.json` and sent to the API automatically.

To seed only specific problems, run the script's inner loop scoped to the desired slugs (see `CLAUDE.md` for an example).
