# Deployment Guide (Vercel + Postgres)

This guide outlines the steps to deploy the application to Vercel using a PostgreSQL database.

## Prerequisites

1.  **Vercel Account**: [Create one here](https://vercel.com/signup).
2.  **GitHub Repository**: Ensure your code is pushed to a remote repository.

## Step 1: Initialize Vercel Project

1.  Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository (`lotusghg`).
    *   *Note: If you don't see it, ensure Vercel has permissions to access your GitHub repositories.*

## Step 2: Configure Database (Vercel Storage)

1.  Once the project is created (or during creation), go to the **Storage** tab.
2.  Click **"Connect Store"** -> **"Create New"** -> **"Postgres"**.
3.  Give it a name (e.g., `lotus-db`) and select a region (e.g., `Washington, D.C. (iad1)` or `São Paulo (gru1)` if available/preferred).
4.  Click **"Create & Continue"**.
5.  **Important**: Vercel will automatically add Environment Variables to your project (`POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, etc.).
    *   *Copy these variables if you want to run `prisma migrate` from your local machine, or ensure they are present in the "Environment Variables" section of the project settings.*

## Step 3: Update Codebase for Postgres

*> The developer (AI) handles this step once you provide the keys.*

1.  Update `prisma/schema.prisma` provider to `postgresql`.
2.  Install `pg` driver: `npm install pg`.
3.  Update `package.json` scripts if necessary.

## Step 4: Run Migrations

To apply the schema to the new production database, you need to run the migration command.

### Option A: Run locally (Recommended for initial setup)
1.  Add the Vercel Postgres environment variables to your local `.env` file.
    *   `POSTGRES_PRISMA_URL="postgres://..."`
    *   `POSTGRES_URL_NON_POOLING="postgres://..."`
2.  Run migration:
    ```bash
    npx prisma migrate deploy
    ```
    *Or if creating a fresh migration:*
    ```bash
    npx prisma migrate dev --name init_postgres
    ```

### Option B: Run during Build (Advanced)
Add a "Build Command" override in Vercel settings, but Option A is safer for controlling data.

## Step 5: Deploy

1.  Push your changes (with the updated `schema.prisma`) to `main`.
2.  Vercel will automatically trigger a new deployment.
3.  Watch the "Deployments" tab for success.

## Troubleshooting

-   **Prisma Client Error**: If you see errors about "Prisma Client" during build, ensure `npx prisma generate` is running (it usually runs automatically in `npm install` or build steps).
-   **Database Connection**: Double check `POSTGRES_PRISMA_URL`. It should use the connection pooling URL if available, or the direct one for migrations.

