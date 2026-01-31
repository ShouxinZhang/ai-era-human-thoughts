# Production DB Verification (thoughts.wudizhe.com)

## Business outcome
Confirm the production site is actually reading/writing to the intended database (Supabase) so user submissions are persisted and visible.

## Timeline (UTC)
- 2026-01-31 01:09:50 UTC: `GET /api/entries` returned `{"data":[]}`.
- 2026-01-31 01:12:11 UTC: `POST /api/entries` succeeded and inserted a row (server smoke test).

## Findings
- Production app is configured with Supabase in `apps/web/.env.local` (URL + anon key present).
- `GET /api/entries` returning empty was because the `entries` table had 0 rows (not a connectivity failure).
- Insert path works (RLS/select/insert appear permitted for the anon key).

## Validation steps used (server)
- `curl http://127.0.0.1:3000/api/entries`
- `curl -X POST http://127.0.0.1:3000/api/entries ...`

## Notes
- If you want the production list to show initial content, you must seed `entries` (either by submitting via UI or running a seed/sync script).
