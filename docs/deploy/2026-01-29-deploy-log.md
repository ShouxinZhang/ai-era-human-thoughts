# Deployment Log (2026-01-29)

This document records the end-to-end deployment process for `ai-era-human-thoughts` in a detailed, chronological, operational way.

> Security note
> - All secrets are **redacted**. Do not commit `.env.local`.
> - Any credentials shared in chat should be rotated after deployment.

## Goal (Business)
Ship a free-to-run “AI时代习题集” platform online with:
- A public web UI for browsing + submitting challenges.
- A database-backed persistence layer.
- Domestic (Mainland China) accessibility.

## Architecture Summary
- App: Next.js (apps/web)
- Database: Supabase (PostgreSQL)
- Process manager on server: PM2
- Port strategy:
  - Nginx keeps port 80 for existing services.
  - This app runs on port 3000.

## Timeline (What Happened)

### 1) Repository scaffolding
- Created repo structure:
  - `apps/` for application code.
  - `core/schema/` for database schema.
  - `docs/architecture/` for structure definition.
- Added architecture doc:
  - `docs/architecture/repository-structure.md`

### 2) Database schema prepared (Supabase)
- Created schema file:
  - `core/schema/001_initial_schema.sql`
- Main entity: `challenges`
  - Fields: `title`, `description`, `category`, `tags`, `created_at`, `status`, etc.
  - RLS enabled and policies for select/insert drafted.

### 3) Next.js app created
- Scaffolded Next.js app:
  - Location: `apps/web`
  - TypeScript + Tailwind + ESLint enabled

### 4) UI landing page implemented
- Replaced default Next.js starter homepage with a product landing page describing:
  - Public domain problems (就业/道德/安全)
  - Developer domain problems (算力/幻觉/工程化)

### 5) Supabase client wiring
- Added Supabase client helper:
  - `apps/web/src/lib/supabase.ts`
- Added env example:
  - `apps/web/.env.local.example`

### 6) Submit form (collection entry point)
- Implemented a modal form component:
  - `apps/web/src/components/SubmitChallenge.tsx`
- Inserts into `challenges` table.

### 7) Real-time list (browsing entry point)
- Implemented a list component to render the latest submissions:
  - `apps/web/src/components/ChallengeList.tsx`
- Uses Supabase `postgres_changes` to live-update on new inserts.

### 8) Local env issue and fix
- Observed runtime error:
  - `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.`
- Root cause:
  - Missing local env file `apps/web/.env.local`.
- Action:
  - Created `.env.local` locally (not committed) with:
    - `NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<redacted>`
- Added safe-guard in `supabase.ts` to avoid hard crash when env is missing.

### 9) Source control pushed to GitHub
- Committed and pushed the full app to `main`.

### 10) Vercel import attempt (blocked in CN)
- Observed constraint:
  - `*.vercel.app` is often unstable/unreachable from Mainland China.
- Decision:
  - Use Tencent Cloud Lighthouse for primary production.

### 11) Tencent Cloud Lighthouse deployment (server)

#### 11.1 Connectivity check
- Verified the server IP is reachable.

#### 11.2 Install runtime
- Installed Node.js 20 and PM2 on the server.

#### 11.3 Pull and build
- Cloned repository:
  - `git clone https://github.com/ShouxinZhang/ai-era-human-thoughts.git`
- Installed dependencies:
  - `npm install`
- Added server-side `.env.local` with Supabase credentials (redacted).
- Built production bundle:
  - `npm run build`

#### 11.4 Start service with PM2
- Started Next.js server process:
  - `pm2 start npm --name 'ai-thoughts' -- start -- -p <port>`

### 12) Port conflict discovered (important)
- Observed that the server already had Nginx listening on port 80.
- Evidence:
  - Port 80 listener: `nginx: master`

### 13) Final port strategy adopted (no interference)
- Moved the app to port 3000:
  - Deleted previous PM2 process.
  - Restarted:
    - `pm2 start npm --name 'ai-thoughts' -- start -- -p 3000`
- Verified on-server health:
  - `curl -I http://localhost:3000` returned `200 OK`.

### 14) Cloud firewall requirement
- Requirement:
  - Tencent Cloud firewall must allow inbound TCP 3000.
- Action needed in console:
  - Add rule: TCP / 3000 / allow.

## Current Production Runbook

### Check status
- `pm2 status`
- `pm2 logs ai-thoughts --lines 200`

### Fast Restart (Convenience Scripts)

- **Production**: `bash apps/web/restart.sh` (Pulls, builds, and restarts PM2)
- **Local Dev**: `bash apps/web/dev.sh` (Kills port 3000 conflicts and starts hot-reload server)

## Known Risks / Follow-ups
- Security:
  - Do not use weak passwords.
  - Prefer SSH keys + disable root password login.
  - Rotate any shared credentials.
- Ops:
  - Consider Nginx reverse proxy + domain-based routing later.
  - Add HTTPS (Let’s Encrypt) once a domain is bound.

