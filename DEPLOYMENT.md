# EliteCode — Deployment Reference

## Architecture

```
Browser
  └── Frontend (Vercel)  ──────────────────────────────────────────────► your-domain.com
        │
        │ API calls
        ▼
      Backend (Railway)  ─────────────────────────────────────────────► your-backend-host
        │         │         │
        │         │         └── Object Storage (Cloudflare R2) ─ code files, runner zips, results
        │         │
        │         └────────────── Database (Neon PostgreSQL) ─ users, problems, submissions
        │
        └── Job Queue (Upstash Redis / BullMQ)
                  │
                  ▼
            Executor (Docker host — Railway or local)
                  │
                  └── runs user code in sandboxed Docker containers (executor.Dockerfile)
```

## Platforms & Dashboards

| Platform          | What it hosts          | Dashboard                                   |
|-------------------|------------------------|---------------------------------------------|
| Vercel            | Frontend               | https://vercel.com/dashboard                |
| Railway           | Backend + Executor     | https://railway.com                         |
| Neon              | PostgreSQL database    | https://console.neon.tech                   |
| Upstash           | Redis (BullMQ queue)   | https://console.upstash.com                 |
| Cloudflare R2     | Object storage (S3)    | https://dash.cloudflare.com                 |
| Google Cloud      | OAuth (Google login)   | https://console.cloud.google.com            |
| GitHub            | OAuth (GitHub login)   | https://github.com/settings/developers      |

---

## Redeploying

### Frontend (Vercel)

```bash
cd frontend
npx vercel --prod
```

The build command is `npm run build` → `npx vite build`. Vercel auto-detects it via `vercel.json`.

### Backend (Railway)

```bash
cd backend
railway link --project <your-railway-project-id>
railway service link elitecode
railway up --detach
```

Railway builds using `backend/Dockerfile`. On start it runs `npx prisma db push && node dist/server.js`.

### Executor (Railway — builds fine, limited at runtime)

```bash
cd executor
railway link --project <your-railway-project-id>
railway service link executor
railway up --detach
```

> **Important:** The executor needs a Docker daemon to run user code. Railway containers do not expose `/var/run/docker.sock`. The executor process starts and connects to Redis correctly, but will fail on any submission job. See **Executor Docker Limitation** below.

---

## Environment Variables

### Backend (`backend/.env`)

See `backend/.env.example` for the full list. Key variables:

| Variable                       | Description                                                           |
|-------------------------------|-----------------------------------------------------------------------|
| `PORT`                        | `3030`                                                                |
| `DATABASE_URL`                | Neon console → Connection string (pooled, with `sslmode=require`)     |
| `REDIS_URL`                   | Upstash console → Redis URL (`rediss://...`)                          |
| `JWT_SECRET`                  | Any long random string — change in prod                               |
| `SUBMISSION_RATE_LIMIT_MAX`   | Max submissions per window (default 4)                                |
| `SUBMISSION_RATE_LIMIT_WINDOW_SECONDS` | Window duration in seconds (default 120)                    |
| `S3_BUCKET_NAME`              | Your R2 bucket name                                                   |
| `S3_REGION`                   | `auto` (Cloudflare R2)                                                |
| `S3_ENDPOINT`                 | Cloudflare R2 endpoint URL                                            |
| `S3_ACCESS_KEY_ID`            | R2 API token → Access Key ID                                          |
| `S3_SECRET_ACCESS_KEY`        | R2 API token → Secret Access Key                                      |
| `GOOGLE_CLIENT_ID`            | Google Cloud Console → OAuth 2.0 Client ID                            |
| `GOOGLE_CLIENT_SECRET`        | Google Cloud Console → OAuth 2.0 Client Secret                        |
| `GOOGLE_CALLBACK_URL`         | `https://<your-backend-host>/api/auth/google/callback`                |
| `GITHUB_CLIENT_ID`            | GitHub → Developer Settings → OAuth Apps                              |
| `GITHUB_CLIENT_SECRET`        | GitHub → Developer Settings → OAuth Apps                              |
| `GITHUB_CALLBACK_URL`         | `https://<your-backend-host>/api/auth/github/callback`                |
| `FRONTEND_OAUTH_REDIRECT_URL` | `https://<your-frontend-host>/oauth-return`                           |
| `CORS_ORIGIN`                 | `https://<your-frontend-host>`                                        |

To update a variable on Railway:
```bash
cd backend
railway variables set KEY=value
railway service redeploy --yes
```

### Executor (`executor/.env`)

See `executor/.env.example` for the full list.

| Variable               | Description                                                      |
|-----------------------|------------------------------------------------------------------|
| `BACKEND_URL`         | `https://<your-backend-host>/api`                                |
| `BACKEND_TOKEN`       | JWT for the execution engine user (see Prisma `User.role = EXECUTION_ENGINE`) |
| `REDIS_URL`           | Same Upstash URL as backend                                      |
| `S3_*`                | Same R2 credentials as backend                                   |
| `EXECUTOR_DOCKER_IMAGE` | `leetcode-executor:latest` — must exist on the host            |

### Frontend (Vercel env vars)

See `frontend/.env.example` for the full list.

| Variable           | Description                                              |
|-------------------|----------------------------------------------------------|
| `VITE_BACKEND_URL` | `https://<your-backend-host>/api`                       |
| `VITE_ENVIRONMENT` | `production`                                             |

To update:
```bash
cd frontend
echo "new-value" | npx vercel env add VITE_BACKEND_URL production --force
npx vercel --prod
```

---

## Database (Neon)

- **Provider:** Neon (serverless Postgres), provisioned via Vercel Marketplace
- **Schema:** managed by Prisma (`backend/prisma/schema.prisma`)
- **Migrations:** this project uses `prisma db push` (schema-push, no migration files)

To apply schema changes after editing `schema.prisma`:
```bash
cd backend
DATABASE_URL="<neon-url>" npx prisma db push
```

Or on Railway — the backend CMD runs `prisma db push` on every start, so a redeploy applies the schema automatically.

To open Prisma Studio against the production database:
```bash
cd backend
DATABASE_URL="<neon-url>" npx prisma studio
```

---

## Object Storage (Cloudflare R2)

### S3 key layout

```
submissions/<submissionId>/code.<ext>       ← user's submitted code
submissions/<submissionId>/results.json     ← execution results
problems/<problemId>/tests.json             ← test cases
setups/<setupId>/runner.zip                 ← compile.sh + run.sh + Testbench.cpp
setups/<setupId>/template.zip              ← starter files shown to user
```

The backend writes to R2 on submission; the executor reads from R2 when executing.

---

## Executor — Docker Limitation

The executor spawns Docker containers to run user code in isolation:
```
docker run --memory=1g --cpus=1.0 --network=none ... leetcode-executor:latest
```

This requires Docker daemon access (`/var/run/docker.sock`). **Railway does not expose the Docker socket**, so the executor on Railway will start and connect to Redis but fail on every job.

### Current workaround — run executor locally

```bash
cd executor
cp .env.example .env
# Fill in production REDIS_URL, BACKEND_URL, BACKEND_TOKEN, and S3 credentials

# Build the sandbox image (only needed once, or after changing executor.Dockerfile)
cd ..
docker build -t leetcode-executor:latest -f executor/executor.Dockerfile .

# Start the worker
cd executor
npx tsx src/server.ts
```

The worker connects to Redis and picks up jobs submitted through the backend — it works transparently from any machine with Docker.

### Proper production fix — VPS with Docker

1. Provision a Linux VPS (Hetzner CX21 ~€4/mo, or DigitalOcean Basic $6/mo)
2. Install Docker: `curl -fsSL https://get.docker.com | sh`
3. Clone the repo and fill in `.env` files from the `.env.example` templates
4. Run:
   ```bash
   docker compose up -d
   ```
   `docker-compose.yml` at the repo root mounts `/var/run/docker.sock` and runs both backend and executor. (You'd remove the backend from Compose if Railway is handling it.)

---

## OAuth Setup

After changing the backend URL, update the authorized redirect URIs in both providers:

**Google Cloud Console**
- Go to: APIs & Services → Credentials → OAuth 2.0 Client IDs
- Add to "Authorized redirect URIs":  
  `https://<your-backend-host>/api/auth/google/callback`

**GitHub**
- Go to: Settings → Developer settings → OAuth Apps → your app
- Set "Authorization callback URL":  
  `https://<your-backend-host>/api/auth/github/callback`

---

## Local Development

```bash
# Install all deps
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd executor && npm install && cd ..

# Copy and fill in env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp executor/.env.example executor/.env

# Start everything (Redis must be running locally)
npm run dev
# runs: backend on :3030, frontend on :5173, executor watching queue
```

---

## Seeding Problems

A valid admin JWT must be in `problems/data/token.txt` (gitignored).

### Seed new problems locally

Requires the backend running at `localhost:3030`.

```bash
# Seed all problems (skips slugs whose title already exists in the DB)
bash problems/scripts/seed_all.sh

# Seed specific slugs
for slug in rate-limiter ttl-cache url-router; do
  bash problems/scripts/seed_one.sh "$slug"
done
```

### Seed new problems to production

`seed_all.sh` is hardcoded to `localhost:3030`. To target production, override `API_BASE` inline:

```bash
API_BASE="https://<your-backend-host>/api" bash problems/scripts/seed_all.sh
```

The script skips any problem whose title already exists, so it's safe to run against production at any time.

### Add a new language setup to an existing problem

`seed_all.sh` only creates problems — it skips slugs that already exist, so it won't add new language directories to them. Do it manually:

```bash
TOKEN=$(< problems/data/token.txt)
API="https://<your-backend-host>/api"
SLUG="rate-limiter"
LANG="Python"

# 1. Find the problem ID
PROBLEM_ID=$(curl -sf "$API/problems" -H "Authorization: Bearer $TOKEN" \
  | jq -r --arg t "$(jq -r .title problems/problemset/$SLUG/info.json)" \
      '.problems[] | select(.title == $t) | .id')
echo "Problem ID: $PROBLEM_ID"

# 2. Create the setup
SETUP_ID=$(curl -sf -X POST "$API/problems/$PROBLEM_ID/setups" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"language\": \"$LANG\", \"info\": \"\"}" \
  | jq -r '.setup.id')
echo "Setup ID: $SETUP_ID"

# 3. Zip and upload runner
(cd "problems/problemset/$SLUG/$LANG/runner" && zip -qr /tmp/runner.zip .)
curl -sf -X POST "$API/problems/$PROBLEM_ID/setups/$SETUP_ID/runner" \
  -H "Authorization: Bearer $TOKEN" -F "file=@/tmp/runner.zip"

# 4. Upload tests
curl -sf -X POST "$API/problems/$PROBLEM_ID/setups/$SETUP_ID/tests" \
  -H "Authorization: Bearer $TOKEN" -F "file=@problems/problemset/$SLUG/tests.json"

# 5. Zip and upload template
(cd "problems/problemset/$SLUG/$LANG/template" && zip -qr /tmp/template.zip .)
curl -sf -X POST "$API/problems/$PROBLEM_ID/setups/$SETUP_ID/template" \
  -H "Authorization: Bearer $TOKEN" -F "file=@/tmp/template.zip"
```

Problems live under `problems/problemset/<slug>/` — see `CLAUDE.md` for the full problem authoring spec.
