# Task Management Application

A task management app: users sign up, log in, and manage their own tasks (create, view, update, delete). Built for PowerLabs Software Engineering Internship practical assessment.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL (hosted on [Neon](https://neon.tech)) |
| ORM | Prisma |
| Auth | Email + password, JWT stored in an httpOnly cookie |
| Validation | Zod |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |


## Data model

**User** — `id`, `username` (unique), `email` (unique), `passwordHash`, `createdAt`.

**Task** — `id`, `title`, `description` (optional), `status` (`TODO` | `IN_PROGRESS` | `DONE`, defaults to `TODO`), `dueDate` (optional), `createdAt`, `updatedAt`, and a `userId` linking it to its owner. Every task belongs to exactly one user; users can only see and modify their own tasks.

## Running the backend

### Prerequisites

- Node.js 20+
- A Postgres database — the project was built against [Neon](https://neon.tech)'s free tier, but any Postgres connection string works.

### Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Port the API listens on (default `4000`) |
| `JWT_SECRET` | Random string, 32+ characters — used to sign auth tokens. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `CORS_ORIGIN` | URL of the frontend (e.g. `http://localhost:3000`) — only this origin is allowed to call the API with credentials |

The app validates all of these at startup and exits immediately with a clear message if any are missing or malformed — it won't start in a half-configured state.

### Migrate and run

```bash
npx prisma migrate dev --name init
npm run dev
```

The API starts on `http://localhost:<PORT>`. Confirm it's up:

```bash
curl http://localhost:4000/health
# {"status":"ok"}
```

## API reference

All responses are JSON. Errors share one shape: `{ "error": { "code": "...", "message": "...", "details": ... } }`.

### Auth (`/api/auth`)

| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/signup` | `{ username, email, password }` | Creates a user, sets the auth cookie |
| POST | `/login` | `{ email, password }` | Sets the auth cookie |
| POST | `/logout` | — | Clears the auth cookie |
| GET | `/me` | — | Returns the logged-in user (requires the cookie) |

### Tasks (`/api/tasks`)

All routes require the auth cookie (set by signup/login) and only ever operate on the logged-in user's own tasks.

| Method | Route | Notes |
|---|---|---|
| GET | `/` | List tasks. Query params: `status` (`TODO`/`IN_PROGRESS`/`DONE`), `sort` (`createdAt`/`dueDate`), `order` (`asc`/`desc`) |
| GET | `/:id` | View one task |
| POST | `/` | Create a task. Body: `{ title, description?, status?, dueDate? }` |
| PATCH | `/:id` | Update a task. Body: any subset of the create fields |
| DELETE | `/:id` | Delete a task |

A request for a task ID that doesn't exist, or belongs to another user, returns `404` in both cases — the API never reveals whether a task exists if you don't own it.

## Assumptions and notable decisions

- **Auth was added even though the brief didn't require it**, because "persisted" tasks needed an owner for "created date" and per-user scoping to mean anything. Basic email/password auth was chosen over a third-party provider to keep the stack simple and self-contained.
- **JWT in an httpOnly cookie**, not `localStorage` — keeps the token inaccessible to JavaScript running on the page, which limits exposure if the frontend ever had an XSS bug. No refresh-token rotation; the token simply expires after 1 hour.
- **No email verification or password reset** — out of scope for the assessment's time window. Password rules are minimum-length only (8 characters), no complexity requirements.
- **Ownership checks return 404, not 403**, when a task exists but belongs to someone else — this avoids confirming a task's existence to a user who shouldn't be able to see it.
- **No separate repository layer** between services and Prisma — Prisma's client is already a thin, typed query layer, so an additional repository abstraction would mostly forward calls without adding value at this project's size.
- **PATCH over PUT** for updates, since every update in this app is a partial update.
