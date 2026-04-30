---
name: API Endpoints
description: All REST API routes grouped by feature area
type: project
originSessionId: 5ccf35ce-0f51-4d36-b864-05c7acc341a9
---
Base URL: `VITE_BACKEND_URL` (dev: `http://localhost:3030/api`)

**Auth**
- `GET /auth/google` → redirect to Google consent
- `GET /auth/google/callback` → exchange code, set JWT, redirect to frontend `/oauth-return?token=...`
- `GET /auth/github` / `GET /auth/github/callback` — same flow for GitHub

**Users**
- `GET /users/me` — get current user (auth required)

**Problems**
- `GET /problems` — list problems (query: limit, offset, difficulty, language, searchText)
- `GET /problems/:problemId` — get problem details
- `POST /problems` — create problem (auth)
- `GET /problems/:problemId/setups/:setupId/template` — get template code
- `POST /problems/:problemId/setups/:setupId/template` — upload template (auth)
- `POST /problems/:problemId/setups` — add language setup (auth)
- `POST /problems/:problemId/setups/:setupId/runner` — upload runner zip (auth)
- `GET /problems/:problemId/setups/:setupId/tests` — get test cases for display
- `POST /problems/:problemId/setups/:setupId/tests` — upload tests JSON (auth)

**Submissions**
- `POST /problems/:problemId/setups/:setupId/submissions` — submit code (auth, multipart file)
- `GET /problems/:problemId/submissions` — list submissions for problem (auth)
- `GET /problems/:problemId/submissions/latest` — get latest submission (auth)
- `GET /submissions/:submissionId` — get submission (auth)
- `GET /submissions/:submissionId/execution-files` — executor fetches S3 keys (EXECUTION_ENGINE only)
- `POST /submissions/:submissionId/results` — executor submits results (EXECUTION_ENGINE only)
- `GET /submissions/:submissionId/results` — get results JSON (auth); frontend polls this every 2s while PENDING

**How to apply:** When adding new frontend API calls, check these routes first. Executor uses `BACKEND_TOKEN` env var (long-lived JWT with EXECUTION_ENGINE role) for the execution-files and results endpoints.
