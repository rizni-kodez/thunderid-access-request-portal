# ThunderID Access Request Portal

Access Request Portal is a TypeScript monorepo that contains:

- `ui-web`: React dashboard for creating and managing access requests.
- `api-access-mgmt`: Express API with PostgreSQL persistence.

This repository currently implements **Phase 1** only (no authentication).

## Project Overview

The app provides an internal-style dashboard to manage requests for access to company tools like GitHub, Jira, Confluence, and others.

Users can:

- View all requests
- Create new requests
- Edit request details and status
- Delete requests
- Search/filter requests
- See summary cards by status

## Phase 1 Scope

Implemented in this phase:

- Full frontend and backend structure in one monorepo
- REST API for access request CRUD
- PostgreSQL storage
- Validation and error handling on backend
- React Query for server-state management on frontend
- Docker Compose setup for PostgreSQL and backend API

Explicitly not implemented in Phase 1:

- Login/register/logout
- Custom username/password authentication
- JWT/role-based authorization

## Tech Stack

Frontend (`ui-web`):

- React + Vite
- TypeScript
- Tailwind CSS
- TanStack Query (React Query)
- React Router
- Axios

Backend (`api-access-mgmt`):

- Node.js + Express
- TypeScript
- PostgreSQL + `pg`
- Zod
- `cors`, `helmet`, `dotenv`
- `pino` + `pino-http` request logging

Infrastructure:

- Docker + Docker Compose
- PostgreSQL 16 (container)

## Folder Structure

```text
thunderid-access-request-portal/
├── api-access-mgmt/
│   ├── src/
│   │   ├── config/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── ui-web/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── configs/
│   │   ├── constants/
│   │   ├── pages/
│   │   ├── queries/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   └── Access_Request_Portal_Phase1_PRD.md
├── docker-compose.yml
├── package.json
└── README.md
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop
- DBeaver (optional, for DB inspection)

## Environment Variables

Do not commit real `.env` files. Use `.env.example` as templates.

Backend example (`api-access-mgmt/.env.example`):

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/access_portal
CORS_ORIGIN=http://localhost:5173
```

Frontend example (`ui-web/.env.example`):

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_THUNDERID_BASE_URL=https://localhost:8090
VITE_THUNDERID_CLIENT_ID=your-thunderid-client-id
```

Suggested local setup:

1. Copy each `.env.example` to `.env` in its own folder.
2. Keep secrets local only.

## ThunderID Setup

Run ThunderID locally:

1. Start your self-hosted ThunderID instance at `https://localhost:8090`.
2. Confirm the instance is reachable in your browser before starting the UI.

ThunderID application settings used by this UI:

- Application type: `React` (public client)
- Redirect URIs:
	- `http://localhost:5173`
	- `http://localhost:5173/`
	- `http://localhost:5173/dashboard`
- CORS origin: `http://localhost:5173`

Frontend environment variables (`ui-web/.env`):

- `VITE_THUNDERID_BASE_URL=https://localhost:8090`
- `VITE_THUNDERID_CLIENT_ID=<your-thunderid-client-id>`

## ThunderID API Protection

The `api-access-mgmt` service now validates ThunderID access tokens (`typ: at+jwt`, RS256) on protected endpoints.

Required backend env vars (`api-access-mgmt/.env`):

- `THUNDERID_ISSUER=https://localhost:8090`
- `THUNDERID_JWKS_URI=https://localhost:8090/oauth2/jwks`
- `THUNDERID_AUDIENCE=https://api.access-portal.local`

ThunderID Resource Server / audience configuration:

- Resource Server identifier: `https://api.access-portal.local`
- Set the ThunderID application's **Default Audience** to: `https://api.access-portal.local`

Development-only TLS note (self-signed cert):

- If your local ThunderID uses a self-signed certificate, you may temporarily set:
	- `NODE_TLS_REJECT_UNAUTHORIZED=0`
- Use this only for local development. Never enable this in production.

Protected endpoints:

- `GET /api/me`
- `GET /api/access-requests`
- `POST /api/access-requests`
- `PATCH /api/access-requests/:id`
- `DELETE /api/access-requests/:id`

Public endpoint:

- `GET /health`

### Test with curl

Health check (no token required):

```bash
curl http://localhost:4000/health
```

Set a valid access token:

```bash
export ACCESS_TOKEN="<thunderid_access_token>"
```

Call protected profile endpoint:

```bash
curl http://localhost:4000/api/me \
	-H "Authorization: Bearer $ACCESS_TOKEN"
```

List current user's access requests:

```bash
curl "http://localhost:4000/api/access-requests" \
	-H "Authorization: Bearer $ACCESS_TOKEN"
```

Log in with a test user:

1. Open `http://localhost:5173`.
2. Click **Sign in with ThunderID**.
3. Authenticate with a test user created in your ThunderID instance (from the ThunderID admin console or seed data).
4. After successful authentication, you are redirected to `/dashboard`.

## Docker and PostgreSQL Setup

Root `docker-compose.yml` runs:

1. `postgres`

PostgreSQL container config:

- Database: `access_portal`
- Username: `postgres`
- Password: `postgres`
- Port: `5433`

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Run API from source (separate terminal):

```bash
npm run dev:api
```

Stop services:

```bash
docker compose down
```

Database schema is auto-initialized on backend start using:

- `api-access-mgmt/src/database/init.sql`

This SQL creates the `access_requests` table and related constraints/trigger.

## DBeaver Connection Details

Use these values:

- Host: `localhost`
- Port: `5433`
- Database: `access_portal`
- Username: `postgres`
- Password: `postgres`

After running the app, confirm:

- `access_requests` table exists
- Insert/update/delete actions are persisted

## Backend Commands

From repository root (workspace scripts):

```bash
npm run dev:api
```

Directly in backend folder:

```bash
cd api-access-mgmt
npm install
npm run dev
npm run build
npm start
```

## Frontend Commands

From repository root (workspace scripts):

```bash
npm run dev:ui
```

Directly in frontend folder:

```bash
cd ui-web
npm install
npm run dev
npm run build
npm run preview
```

Frontend URL (default):

- `http://localhost:5173`

Backend URL (default):

- `http://localhost:4000`

## API Endpoints

Base URL:

- `http://localhost:4000`

Health:

- `GET /health`

Access Requests:

- `GET /api/access-requests`
- `POST /api/access-requests`
- `PATCH /api/access-requests/:id`
- `DELETE /api/access-requests/:id`

Supported query params for list endpoint:

- `status`
- `priority`
- `application`
- `search`

Example:

```http
GET /api/access-requests?status=pending&priority=high&search=github
```

## Demo Flow

1. Start PostgreSQL with Docker Compose, then run backend locally with `npm run dev:api`.
2. Start frontend in `ui-web`.
3. Open `http://localhost:5173`.
4. Create a new access request from the dashboard.
5. Verify request appears in table and summary cards update.
6. Use search/filter bar to narrow results.
7. Edit request status/priority/details.
8. Delete a request.
9. Verify DB records in DBeaver.

## Known Limitations

- No role-based authorization model yet (endpoints are user-scoped by ThunderID `sub`).
- No pagination/sorting controls yet.
- No automated test suite included yet.
- UI notifications are lightweight and not persisted.
