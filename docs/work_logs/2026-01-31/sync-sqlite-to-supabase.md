# Sync SQLite → Supabase (entries + feedback)

## Business outcome
Make production data non-empty and persist offline-collected data by syncing local SQLite (`apps/web/.local/entries.db`) into Supabase tables (`entries`, `feedback`). This ensures the website shows content immediately after deployment and keeps feedback centralized for triage.

## Timeline (UTC+8, CST)
- 2026-01-31 09:xx:xx CST: Updated sync script to support both `entries` and `feedback`.

## Design
- Script: `apps/web/scripts/sync-to-supabase.mjs`
- Data sources:
  - Local: SQLite `apps/web/.local/entries.db`
  - Cloud: Supabase tables `entries`, `feedback`
- Credentials:
  - Prefer `SUPABASE_SERVICE_ROLE_KEY` (admin, can upsert)
  - Fallback to `NEXT_PUBLIC_SUPABASE_ANON_KEY` (safe mode: insert-only via `ignoreDuplicates`)

## How to run
From repo root:
- `cd apps/web`
- Load env:
  - `set -a; source .env.local; set +a`
- Run:
  - `node scripts/sync-to-supabase.mjs`

## Notes
- Do not commit `SUPABASE_SERVICE_ROLE_KEY` or put it under `NEXT_PUBLIC_*`.
- With anon key the script uses conflict-ignore behavior (no updates).
