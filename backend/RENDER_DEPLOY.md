# Deploying this backend to Render

This document explains how to deploy the project to Render (https://render.com).

Prerequisites
- Push this repository to GitHub (or GitLab) and make sure the main branch is named `main` (or change `branch` in `render.yaml`).

Quick steps (recommended)
1. Commit and push your code to GitHub.
2. Go to https://dashboard.render.com and create a new Web Service.
   - Choose "Connect a repository" and pick this GitHub repo.
   - Render will detect `render.yaml` and create the service using the manifest.
3. Confirm the build and start commands (build: `npm install`, start: `npm start`).
4. (Optional) Set environment variables in Render's Dashboard for the service if needed.

Notes about SQLite and persistence
- This project uses a SQLite database file (`todoApplication.db`). On Render, the instance filesystem is ephemeral:
  - Data written to the container will not persist across deploys or when instances restart.
  - For durable storage use a managed database (Postgres, MySQL, etc.) and update the code to use it.
  - If you need local file storage and are on a paid Render plan, you can attach a Persistent Disk to the service. See Render docs.

If you want to use a managed Postgres instead:
- Create a Render Postgres instance and add the connection string as an environment variable (for example `DATABASE_URL`).
- Update the code to use the Postgres client (or an ORM) and migrate data.

Local test
- Before deploying, you can run locally with:

```powershell
# from repo root
npm install
npm start
```

Troubleshooting
- If Render fails to start, check the service logs in the Render dashboard.
- Ensure the app listens on the port from `process.env.PORT` (this project uses it already in `src/index.js`).

Contact / Next steps
- If you want, I can:
  - Add an example `DATABASE_URL` parsing switch to make it easier to move from SQLite to Postgres.
  - Add a small healthcheck endpoint (the project already contains `/health`).

