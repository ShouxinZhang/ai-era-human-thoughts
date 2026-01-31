# Repository Architecture

This document defines the high-level architecture and structure of the `ai-era-human-thoughts` repository.

## Design Philosophy
The project serves as a "Problem Set" for the AI era, collecting challenges faced by the public and developers. It is built to be:
1.  **Modular**: Clear separation between data definition (Core) and presentation (Apps).
2.  **Cost-Effective**: Designed for free/low-cost deployment (Next.js + Supabase).
3.  **Community-Driven**: Open for contribution.

## Directory Structure

### `/apps`
Contains the user-facing applications.
-   `web/`: The main Next.js web application.
    -   Framework: Next.js (React)
    -   Styling: Tailwind CSS
    -   Purpose: Public interface for browsing and submitting challenges.
    -   Local Dev Data: `.local/entries.db` (SQLite for offline debugging)
    -   Scripts: `scripts/`
        -   `local-init.mjs`: Create/migrate local SQLite and seed (first run only)
        -   `sync-to-supabase.mjs`: One-way upsert from local SQLite to Supabase
        -   `add-mock-data.mjs`: Append 3 mock rows without overwriting existing data
    -   Dev Script: `dev.sh` (robust port cleanup + local bootstrap)
    -   Deploy Script: `deploy-ssh.sh` (one-command SSH deploy to server via `restart.sh`)
    -   UI Components (selected)
        -   `src/components/SubmitEntry.tsx`: Entry submit modal
        -   `src/components/EntryList.tsx`: Entry list rendering
        -   `src/components/FeedbackButton.tsx`: Footer feedback entry (POST to server, stored in DB)
    -   API Routes (selected)
        -   `src/app/api/entries/route.ts`: Read/write entries (local SQLite or Supabase)
        -   `src/app/api/feedback/route.ts`: Collect feedback and store to local SQLite or Supabase

### `/core`
Contains shared business logic and data definitions.
-   `schema/`: Database schemas (SQL) and types.
    -   Target DB: Supabase (PostgreSQL)
    -   Purpose: Single source of truth for the data model.

### `/docs`
Project documentation.
-   `architecture/`: Architectural decisions and structure definitions.
-   `deploy/`: Step-by-step deployment logs and runbooks.
-   `work_logs/`: Operational / investigation notes grouped by date.
    -   Format: `docs/work_logs/YYYY-MM-DD/<topic>.md`

### `/dev_logs`
Development logs for each change set (operational snapshots).
-   New format (recommended): `dev_logs/YYYY-MM-DD/<topic>.md`

## Data Model (Conceptual)
The core entity is an **Entry** (simplified thought or problem).
-   **Type**: `problem` (Challenges/Needs) vs. `thought` (Reflections/Ideas).
-   **Attributes**: ID (serial), Content, Type, Created Date, Author (Signature), Age, Occupation, City.

The supporting entity is **Feedback** (user suggestions/issues for triage).
-   **Attributes**: ID (serial), Message, Contact, Page URL, User Agent, IP, Created Date.

## Deployment
-   **Frontend**: Primary deployment on Tencent Cloud Lighthouse (domestic access). Optional deployment on Vercel.
-   **Reverse Proxy**: Nginx (port 80) with app services on dedicated ports (e.g., 3000).
-   **Backend**: Supabase (Cloud PostgreSQL).
