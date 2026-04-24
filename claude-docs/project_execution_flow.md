---
name: Execution Flow
description: End-to-end code submission lifecycle from frontend to results display
type: project
originSessionId: 5ccf35ce-0f51-4d36-b864-05c7acc341a9
---
**Full lifecycle:**

1. **Frontend** zips user code → `POST /problems/:pid/setups/:sid/submissions` (multipart)
2. **Backend** `MakeSubmissionUseCase`: validates, uploads code zip to S3, creates Submission (PENDING), enqueues `{ name: "execute-submission", data: { submissionId } }` to BullMQ `execution-queue`
3. **Executor** BullMQ worker dequeues job → calls `load(submissionId)`:
   - `GET /submissions/:id/execution-files` (with EXECUTION_ENGINE JWT) → gets S3 keys
   - Downloads code zip, runner zip, tests JSON from S3
   - Extracts to `./tmp/{submissionId}/` (subdirs: code/, runner/, tests.json)
4. **Executor** calls `execute(baseDir)`:
   - Creates Docker container: image `leetcode-executor:latest`, 256MB RAM, 0.5 CPU, 128 PIDs, no network
   - Mounts: code (ro), runner (ro), build (rw), input (rw)
   - Runs `compile.sh` if present
   - For each test case: writes input JSON to `/workspace/input/a.in`, runs `run.sh`, parses output between `__BEGIN_RESULT__` and `__END_RESULT__` tags, compares to expected
   - Stops container, returns results object
5. **Executor** calls `submit(submissionId, results)`:
   - `POST /submissions/:id/results` (multipart with results JSON)
6. **Backend** `SubmitExecutionResultsUseCase`: uploads results to S3, updates Submission (ACCEPTED/REJECTED/FAILED + finishedAt)
7. **Frontend** polls `GET /submissions/:id/results` every 2s until not PENDING, displays per-test-case results

**Cleanup:**
- Submissions PENDING >10s → FAILED (timeout service, runs every 10s)
- `temporary=true` submissions >5min → deleted from DB + S3 (cleanup service, runs every 10s)

**How to apply:** When debugging stuck submissions, check: BullMQ queue health, executor Docker image, S3 permissions, EXECUTION_ENGINE JWT validity. Temporary submissions are used for "run" (not final submit) flows.
