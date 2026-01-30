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
    -   Scripts: `scripts/` (local init + sync to Supabase)
    -   Dev Script: `dev.sh` (robust port cleanup + local bootstrap)

### `/core`
Contains shared business logic and data definitions.
-   `schema/`: Database schemas (SQL) and types.
    -   Target DB: Supabase (PostgreSQL)
    -   Purpose: Single source of truth for the data model.

### `/docs`
Project documentation.
-   `architecture/`: Architectural decisions and structure definitions.
-   `deploy/`: Step-by-step deployment logs and runbooks.

### `/dev_logs`
Development logs for each change set (operational snapshots).

## Data Model (Conceptual)
The core entity is an **Entry** (simplified thought or problem).
-   **Type**: `problem` (Challenges/Needs) vs. `thought` (Reflections/Ideas).
-   **Attributes**: ID (serial), Content, Type, Created Date, Author (Signature).

## Deployment
-   **Frontend**: Primary deployment on Tencent Cloud Lighthouse (domestic access). Optional deployment on Vercel.
-   **Reverse Proxy**: Nginx (port 80) with app services on dedicated ports (e.g., 3000).
-   **Backend**: Supabase (Cloud PostgreSQL).
