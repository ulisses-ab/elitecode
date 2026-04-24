---
name: Project Overview
description: Purpose, tech stack, and high-level structure of the LeetCode clone project
type: project
originSessionId: 5ccf35ce-0f51-4d36-b864-05c7acc341a9
---
Full-stack competitive coding platform — users browse problems, write code in Monaco editor, submit, and get instant pass/fail feedback per test case.

**Why:** Personal LeetCode-style platform supporting C++/C/CUDA problems with Docker-sandboxed execution.

**Three services:**
- `backend/` — Express.js 5 + TypeScript + Prisma (PostgreSQL) + BullMQ + JWT/OAuth
- `frontend/` — React 19 + Vite + Tailwind CSS 4 + Zustand + Monaco Editor + React Query
- `executor/` — Node.js BullMQ worker + Docker container orchestration

**Languages supported:** C++, C, CUDA (enum `Language` in domain types)

**Auth:** Google + GitHub OAuth 2.0 → JWT; roles: REGULAR, ADMIN, EXECUTION_ENGINE

**Storage:** AWS S3 (via Cloudflare R2) for code zips, runner zips, test files, and result JSONs

**Queue:** Redis + BullMQ queue named `execution-queue`

**How to apply:** When suggesting tech choices or new features, align with the existing stack (Express, Prisma, BullMQ, React Query, Zustand). Don't introduce new state managers, ORMs, or HTTP clients.
