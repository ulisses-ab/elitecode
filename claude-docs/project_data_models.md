---
name: Data Models
description: Prisma schema entities and S3 storage key conventions
type: project
originSessionId: 5ccf35ce-0f51-4d36-b864-05c7acc341a9
---
**Prisma entities (PostgreSQL):**

- `User`: id (CUID), handle (unique), email, role (ADMIN|REGULAR|EXECUTION_ENGINE)
- `OAuthIdentity`: userId, provider (GITHUB|GOOGLE), providerUserId — allows multiple OAuth providers per user
- `Problem`: id, title, description, statement (markdown), difficulty (EASY|MEDIUM|HARD), creatorId, defaultTestsFileKey (S3)
- `ProblemSetup`: problemId, language (C++|C|CUDA), info, templateFileKey (S3), runnerFileKey (S3), testsFileKey (S3) — one setup per language per problem
- `Submission`: userId, problemId, setupId, codeFileKey (S3), resultsFileKey (S3), status (PENDING|ACCEPTED|REJECTED|FAILED), temporary (bool), submittedAt, finishedAt

**S3 key conventions:**
- Submitted code zip: `submissions/{submissionId}/code`
- Execution results JSON: `submissions/{submissionId}/results` (or similar — verify in infra)
- Runner zip: stored at setup's `runnerFileKey`
- Template: stored at setup's `templateFileKey`
- Tests JSON: stored at setup's `testsFileKey` or problem's `defaultTestsFileKey`

**How to apply:** When adding fields, always update `prisma/schema.prisma` and create a migration. Submission status transitions: PENDING → ACCEPTED/REJECTED/FAILED. `temporary=true` submissions are auto-deleted after 5 minutes.
