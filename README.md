# ClinicFlow

ClinicFlow is a clinic management web app (PERN stack) for managing patients, appointments, and staff users.

## Tech Stack

**Backend**
- Express `^5.2.1` — HTTP server / routing
- PostgreSQL 16 — database
- Prisma `^7.10.0` (`@prisma/client`, `@prisma/adapter-pg`) — ORM
- `jsonwebtoken` `^9.0.3` — JWT authentication
- `bcrypt` `^6.0.0` — password hashing
- `zod` `^4.6.5` — request validation
- `helmet` `^8.3.0`, `cors` `^2.8.6` — security / CORS middleware
- `nodemon` `^3.1.14` (dev) — auto-restart in development

**Frontend**
- React `^19.0.0` + Vite `^8.0.5` + TypeScript `^5.7.0`
- Tailwind CSS `^4.0.0` (via `@tailwindcss/vite`)
- `react-hook-form` `^7.88.0` + `@hookform/resolvers` `^5.9.1` — forms
- `zod` `^4.6.5` — form/schema validation (mirrors the backend's validators)
- `axios` `^1.20.0` — HTTP client
- `lucide-react` `^1.48.0` — icons

## Features

- **Authentication** with JWT and two roles (`admin` / `staff`)
- **Patient management** — create/edit, search + pagination, soft-delete (archive) and restore, with an admin-only archived-patients view
- **Appointment management** — create/list, confirm/cancel status changes, and a 30-minute conflict rule that blocks double-booking a confirmed slot for the same patient
- **Dashboard** — live stats (total patients, today's appointments, pending, confirmed) and a calendar view of appointments
- **User management** (admin-only) — create/edit staff accounts, deactivate/reactivate accounts (no hard delete)

## Prerequisites

- Node.js v20+ (no `engines` field is declared in either `package.json`; this repo is developed against v20.20.0)
- PostgreSQL 16
- npm

## Project Structure

```
ClinicFlow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Data model (User, Patient, Appointment)
│   │   ├── migrations/         # Prisma migration history
│   │   └── seed.js             # Seeds 3 users, 5 patients, 10 appointments
│   └── src/
│       ├── routes/             # Express route definitions per resource
│       ├── controllers/        # Request/response handling
│       ├── services/           # Business logic + Prisma queries
│       ├── validators/         # Zod schemas for request bodies
│       ├── middlewares/        # auth, role-check, validation, error handling
│       ├── config/prisma.js    # Prisma client instance
│       └── server.js / app.js  # Express app entry point
└── frontend/
    └── src/
        ├── screens/            # Top-level pages (Dashboard, Patients, Users, ...)
        ├── components/         # Shared UI (Shell, Sidebar, Calendar, ...) + components/ui/
        ├── api/                # axios calls per resource + API↔UI data mapping
        ├── validators/         # Zod schemas mirroring the backend's
        ├── context/            # AuthContext, ToastContext
        ├── hooks/              # useIsMobile
        └── router/             # ProtectedRoute (auth gate)
```

## Setup Instructions

Clone the repo, then set up the backend and frontend separately. **Both need to run simultaneously in separate terminals** for the app to work.

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/clinicflow` |
| `PORT` | Port the Express server listens on, e.g. `4000` |
| `FRONTEND_URL` | Frontend origin allowed by CORS, e.g. `http://localhost:5173` |
| `JWT_SECRET` | Secret used to sign/verify JWTs |
| `JWT_EXPIRES_IN` | JWT token lifetime (defaults to `1d`) |

Then create the database, run migrations, seed it, and start the server:

```bash
createdb clinicflow          # or create it via psql/another PostgreSQL client
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:4000/api` |

```bash
npm run dev
```

The frontend runs at `http://localhost:5173`, the backend at whatever `PORT` you set (`http://localhost:4000` in local dev).

## Running with Docker

Requires Docker and Docker Compose. From the repo root:

```bash
docker compose up --build
```

This starts three services: `postgres` (5432), `backend` (4000), and `frontend` (5173, served by nginx). Migrations run automatically on backend startup. The first time only, seed the database:

```bash
docker compose exec backend npx prisma db seed
```

Then open `http://localhost:5173` and log in with any of the [seeded test accounts](#seeded-test-accounts).

To stop everything:

```bash
docker compose down
```

Add `-v` to also delete the Postgres data volume (`docker compose down -v`).

> The `JWT_SECRET` and Postgres password in `docker-compose.yml` are dev-only placeholders — replace them for anything beyond local use.

## Seeded Test Accounts

`npx prisma db seed` creates these accounts (all with password `Password123!`):

| Name | Email | Role |
|---|---|---|
| Dr. Rachel Kim | `admin@clinicflow.com` | admin |
| Nurse James | `james@clinicflow.com` | staff |
| Nurse Sara | `sara@clinicflow.com` | staff |

## API Overview

All routes are prefixed with `/api`. "Authenticated" means any logged-in user (valid JWT); "Admin-only" additionally requires `role: admin`.

### Auth (`/auth`)
| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/login` | Log in, returns a JWT + user profile | Public |
| GET | `/me` | Get the current logged-in user's profile | Authenticated |

### Patients (`/patients`)
| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/` | Create a patient | Authenticated |
| GET | `/` | List patients (search + pagination) | Authenticated |
| GET | `/archived` | List archived (soft-deleted) patients | Admin-only |
| GET | `/archived/:id` | Get one archived patient (with appointment history) | Admin-only |
| PATCH | `/archived/:id/restore` | Restore an archived patient | Admin-only |
| GET | `/:id` | Get one patient | Authenticated |
| GET | `/:id/appointments` | List a patient's appointments | Authenticated |
| PUT | `/:id` | Update a patient | Authenticated |
| DELETE | `/:id` | Archive (soft-delete) a patient | Admin-only |

### Appointments (`/appointments`)
| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/` | Create an appointment | Authenticated |
| GET | `/` | List appointments (filter by date/status, pagination) | Authenticated |
| GET | `/:id` | Get one appointment | Authenticated |
| PATCH | `/:id/status` | Update status (confirm/cancel) | Authenticated |

### Users (`/users`)
| Method | Path | Description | Access |
|---|---|---|---|
| POST | `/` | Create a user | Admin-only |
| GET | `/` | List users (search + pagination) | Admin-only |
| GET | `/:id` | Get one user | Admin-only |
| PUT | `/:id` | Update a user | Admin-only |
| PATCH | `/:id/deactivate` | Deactivate a user | Admin-only |
| PATCH | `/:id/reactivate` | Reactivate a user | Admin-only |

### Dashboard (`/dashboard`)
| Method | Path | Description | Access |
|---|---|---|---|
| GET | `/stats` | Live counts: total patients, today's appointments, pending, confirmed | Authenticated |

## Database Design Notes

The schema has 3 tables: `users`, `patients`, and `appointments`.

- **`patients` → `appointments`**: one-to-many. Each appointment belongs to exactly one patient.
- **`users` → `appointments`**: one-to-many. Each appointment records the staff member (`createdBy`) who created it.

Key design decisions:

- **Soft delete for patients** (`deletedAt` timestamp) instead of a hard delete, so a patient's appointment history stays intact and traceable even after they're "removed" from active views.
- **`onDelete: Restrict` on both appointment foreign keys** (`patientId`, `createdById`), for the same reason — an appointment record should never be silently deleted or orphaned just because the patient or staff member behind it is removed.
- **Deactivation (`isActive`) instead of hard delete for users** — same reasoning: a deactivated staff member's past appointments should still correctly show who created them.
- **Archive/restore behavior for patients**: archiving cancels only that patient's *future* non-cancelled appointments — past appointments are left untouched, since archiving shouldn't rewrite history. Restoring then cancels whatever appointments fell *during* the archived period (they're invalid — the patient wasn't active) and resets appointments still in the future back to `pending` so staff can reconfirm them.
- **The 30-minute appointment conflict rule** is enforced in the service layer (`appointments.service.js`), inside the same transaction as the write that triggers it. It's scoped **per-patient**, not clinic-wide, and only blocks a new **confirmed** appointment from landing within 30 minutes of another **confirmed** appointment for that same patient — pending/cancelled appointments never trigger it.

## Known Limitations / Not Implemented

- No automated tests (unit, integration, or e2e)
- No API documentation tooling (e.g. Swagger/OpenAPI) — this README's API Overview is the only reference
- No audit log — an `AuditLog` table was scaffolded in the Prisma schema early on but never wired up to any service/controller, and was later removed rather than built out
