# Vercel Deployment Guide

This project is optimized for deployment on Vercel using Supabase as the production database.

## Prerequisites

1.  A [Vercel](https://vercel.com) account.
2.  A [Supabase](https://supabase.com) project with the schema applied (see `core/schema/001_initial_schema.sql`).
3.  GitHub repository connected to Vercel.

## Deployment Steps

### 1. Configure Vercel Project

-   **Root Directory**: Set to `apps/web`.
-   **Framework Preset**: Select **Next.js**.
-   **Build Command**: `next build` (standard).
-   **Install Command**: `npm install`.

### 2. Environment Variables

Add the following environment variables in the Vercel project settings:

| Name | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_DATA_SOURCE` | `supabase` | Forces the app to use Supabase in production. |
| `NEXT_PUBLIC_SUPABASE_URL` | `your-supabase-url` | Your Supabase Project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-supabase-key` | Your Supabase Project Anon Key. |

### 3. Deploy

Push your changes to the `main` branch, and Vercel will automatically start the build and deployment process.

## Custom Domain Setup (Alibaba Cloud / Aliyun)

To point `thoughts.wudizhe.com` to your Vercel deployment:

### 1. Add Domain in Vercel
1.  Go to your project in the **Vercel Dashboard**.
2.  Navigate to **Settings** > **Domains**.
3.  Enter `thoughts.wudizhe.com` and click **Add**.
4.  Vercel will provide the required DNS records (usually a CNAME for subdomains).

### 2. Configure DNS in Alibaba Cloud
1.  Log in to the [Alibaba Cloud DNS Console](https://dns.console.aliyun.com/).
2.  Find your root domain `wudizhe.com` in the list.
3.  Add a new record:
    -   **Type**: `CNAME`
    -   **Host (RR)**: `thoughts`
    -   **Value**: `cname.vercel-dns.com.`
    -   **TTL**: Default (e.g., 600 or 10 minutes).

### 3. SSL/TLS
Vercel will automatically provision and renew an SSL certificate for your custom domain once the DNS record is verified.

## Data Synchronization

To keep your local and production environments in sync, you can use the following commands:

-   **Push to Production**: `npm run local:sync` (Local SQLite -> Supabase)
-   **Pull to local**: `npm run local:pull` (Supabase -> Local SQLite)

*Note: Ensure your `.env.local` contains valid Supabase credentials.*

## Why Supabase on Vercel?

Vercel Serverless Functions have a read-only filesystem (except for `/tmp`), which makes local SQLite (`better-sqlite3`) unsuitable for persistent storage in production. By switching to Supabase, we ensure:
-   **Persistence**: Data is stored in a managed PostgreSQL database.
-   **Scalability**: Handles concurrent users and multiple serverless function instances.
-   **Zero Maintenance**: No need to manage database backups or updates manually.

## Troubleshooting

If the build fails due to `better-sqlite3`, ensure that `NEXT_PUBLIC_DATA_SOURCE` is set to `supabase`. The code uses dynamic imports to avoid loading the SQLite library when using Supabase.
