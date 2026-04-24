# Memory Index

- [Project Overview](project_overview.md) — Full-stack LeetCode clone: purpose, tech stack, 3 services (backend/frontend/executor)
- [Architecture](project_architecture.md) — Clean architecture layers, DI pattern, repo pattern, BullMQ async execution flow
- [Data Models](project_data_models.md) — Prisma schema: User, Problem, ProblemSetup, Submission, OAuthIdentity; S3 key layout
- [API Endpoints](project_api_endpoints.md) — All REST routes: auth, problems, setups, submissions, users
- [Execution Flow](project_execution_flow.md) — End-to-end: code submission → queue → Docker → results polling
- [Problem Structure](project_problem_structure.md) — How problems/setups/runners/tests are organized on disk and in S3
