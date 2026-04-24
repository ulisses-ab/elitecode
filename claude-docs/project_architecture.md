---
name: Architecture
description: Clean architecture layers in backend, DI setup, key patterns used
type: project
originSessionId: 5ccf35ce-0f51-4d36-b864-05c7acc341a9
---
**Backend uses Clean Architecture with 4 layers:**

1. `domain/` — Pure entities (User, Problem, ProblemSetup, Submission, OAuthIdentity), enums (Difficulty, Language, SubmissionStatus, Role, OAuthProvider), repo interfaces (IProblemRepo, etc.)
2. `application/` — Use cases (each has `execute()` method), mappers (entity→DTO), DTOs, background services (SubmissionTimeoutService, TemporarySubmissionCleanupService)
3. `infra/` — Prisma repo implementations, S3ObjectStorageService, BullMQExecutionQueueService, JWTService, BcryptHashingService, OAuth clients (Google/GitHub)
4. `http/` — Express routes + controllers + authMiddleware; `errors/` for centralized error responses

**DI setup:** `di/infra.ts` → `di/application.ts` → `di/http.ts` (instantiation chain, everything composed at startup)

**Key patterns:**
- Repository pattern: domain interfaces, infra implementations — easy to swap for tests
- AppError class with typed ErrorCode enum → maps to HTTP status codes
- Background jobs run every 10s: timeout PENDING submissions >10s old, delete temporary submissions >5min old
- RBAC: EXECUTION_ENGINE role required to fetch execution files and submit results (executor service uses a long-lived JWT)

**How to apply:** New features go into use cases under `application/usecases/`. New data access goes into `infra/prisma/`. Never put business logic in controllers or routes.
