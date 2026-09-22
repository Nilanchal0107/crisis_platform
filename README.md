# Verified Response Ledger

A prototype crisis-coordination platform: it turns an unverified community incident report into a verified, resource-backed, explicitly-owned, and reconciled response — with an interactive map as a live view of that same governed state, not a separate source of truth.

Built for a "Crisis Response / Full-Stack GIS" problem statement. Every crisis dashboard can show pins on a map; this one enforces the handoffs behind the pins: **reported ≠ verified**, **available ≠ uncommitted**, **sent ≠ accepted**, **dispatched ≠ delivered**, **partial ≠ complete**.

Full product reasoning (problem analysis, solution selection, PRD, UI spec) lives in [`Docs/`](Docs/).

---

## What it does

Three roles work through one shared, persisted operational record:

- **Community Reporter** — submits a locatable incident (location, type, severity, description), gets a reference number, and can track its status or add a clarification.
- **Agency Coordinator** — verifies or rejects incoming reports, inspects the resource pool, atomically reserves stock, offers a task to a responder, and confirms full/partial/failed outcomes. Sees the operations map, list, ledger, and audit timeline.
- **Volunteer / Responder** — accepts or declines an offered task, marks dispatch, and reports the real outcome (including partial delivery with an exception reason).

Core guarantees proven end-to-end:

- A resource can't be reserved twice — concurrent reservations against insufficient stock, exactly one succeeds.
- A task stays unowned until the responder explicitly accepts it.
- Dispatch and delivery are separate, timestamped states — a partial delivery (e.g. 12 of 20) leaves the remaining 8 as an explicit, visible exception instead of disappearing.
- Every critical transition (verify, reserve, offer, accept, dispatch, outcome, reconcile) is on an append-only audit timeline with actor and timestamp.
- Map, queue, ledger, and audit all read from the same state — nothing is a separate, driftable copy.

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Node.js (`node:sqlite` built-in driver) + Express + TypeScript, Zod validation, bcrypt-hashed accounts |
| Frontend | React 19 + Vite + TypeScript, Leaflet for the map |
| Shared | `@vrl/shared` — types/enums used by both backend and frontend |
| Data | SQLite (WAL mode), auto-seeded with a synthetic Mumbai (Kurla West) demo scenario on first run |
| Workspace | npm workspaces monorepo (`shared`, `backend`, `frontend`) |

No AI/ML, live GPS, SMS, or government integrations are in the critical path — see [`Docs/01-PS_Analysis.md`](Docs/01-PS_Analysis.md) §12 for why, and [`Docs/04-Scope_Lock.md`](Docs/04-Scope_Lock.md) for the full in/out scope.

## Requirements

- Node.js **22.5+** (uses the built-in `node:sqlite` module)
- npm 10+

## Getting started

```bash
# from the repo root
npm install
npm run dev
```

This builds the shared package once, then runs the backend (`http://localhost:3000`) and frontend (`http://localhost:5173`) concurrently. Vite proxies `/api/*` to the backend in dev, so just open `http://localhost:5173`.

The database is created and auto-seeded on first backend start — no manual migration/seed step needed. To force a clean reset of the demo scenario at any time:

```bash
npm run reset:demo
```

### Demo login

The landing screen offers three roles. Every account (except two internal seed accounts) uses password **`<account-id>123`** — e.g. account `priya` logs in with password `priya123`. Selectable demo identities include:

| Role | Example account |
|---|---|
| Community Reporter | `neha` (or use "Quick Report" to submit with no account at all) |
| Agency Coordinator | `priya` — BMC Duty Coordinator |
| Volunteer / Responder | `meera` / `imran` — field volunteers |

### Suggested walkthrough

1. Log in as **Reporter**, submit an incident, note the reference.
2. Log in as **Coordinator**, verify the report, reserve resources, try reserving more than what's left (watch it get rejected), then offer a task.
3. Log in as **Responder**, accept the task, dispatch, then submit a partial outcome (e.g. deliver less than assigned with an exception reason).
4. Back as **Coordinator**, confirm the partial reconciliation and inspect the audit timeline and map.

## Project structure

```
crisis_platform/
├── backend/        Express API, SQLite persistence, business logic
│   ├── src/
│   │   ├── db/          connection, migrations, seed
│   │   ├── middleware/  auth (header/session-based actor context), role guards
│   │   ├── modules/     incident, ledger, task, audit, gis domain logic
│   │   └── routes/      auth, reports, resources, tasks, demo, health
│   └── tests/       incident, concurrency, task, reconciliation, e2e tests
├── frontend/        React app
│   └── src/screens/
│       ├── SCR-000-Landing/     landing + login
│       ├── SCR-001-Reporter/    intake, receipt, history
│       ├── SCR-002-Coordinator/ operations workspace (queue, map, ledger, audit)
│       └── SCR-003-Responder/   task workspace
├── shared/          Types/enums shared by backend and frontend
└── Docs/            Problem analysis, SWOT, solution design, scope lock, PRD, UI/UX spec, technical design
```

## Scripts

Run from the repo root unless noted.

| Command | Does |
|---|---|
| `npm run dev` | Build shared, run backend + frontend together |
| `npm run build` | Build shared, backend, and frontend for production |
| `npm run dev:backend` / `npm run dev:frontend` | Run just one side |
| `npm run reset:demo` | Reset the database to the seeded demo scenario |
| `npm run test` *(in `backend/`)* | Run all backend test suites |

## API overview

All routes are prefixed `/api`. Actor identity/role comes from an authenticated session (or `x-actor-id` / `x-actor-role` headers in dev).

| Area | Routes |
|---|---|
| Auth | `GET /auth/accounts`, `POST /auth/register`, `POST /auth/login` |
| Reports | `POST /reports`, `GET /reports/canonical`, `GET /reports/mine`, `GET /reports/:ref`, `POST /reports/:ref/clarify`, `GET /reports` (coordinator), `POST /reports/:id/verify`, `POST /reports/:id/reject` |
| Resources | `GET /resources`, `GET /resources/ledger`, `GET /resources/:id`, `GET /resources/commitments/incident/:id`, `POST /resources/:id/adjust` |
| Reservation | `POST /incidents/:id/reserve` |
| Tasks | `GET /tasks`, `POST /tasks`, `GET /tasks/:id`, `POST /tasks/:id/acknowledge`, `POST /tasks/:id/dispatch`, `POST /tasks/:id/outcome`, `POST /tasks/:id/updates` |
| Reconciliation | `POST /incidents/:id/confirm` |
| Map | `GET /map/features` |
| Audit | `GET /audit` |
| Demo / health | `POST /demo/reset`, `GET /health` |

## Documentation

| Doc | Covers |
|---|---|
| [`01-PS_Analysis.md`](Docs/01-PS_Analysis.md) | Problem deconstruction, domain research, root-cause analysis |
| [`02-SWOT.md`](Docs/02-SWOT.md) | Strategic positioning |
| [`03-Solution_Design.md`](Docs/03-Solution_Design.md) | Candidate approaches, selection rationale |
| [`04-Scope_Lock.md`](Docs/04-Scope_Lock.md) | What's in/out for the prototype |
| [`05-PRD.md`](Docs/05-PRD.md) | User stories, functional requirements, business rules |
| [`06-UIUX.md`](Docs/06-UIUX.md) | Screens, flows, component inventory |
| [`07-Technical_Design/`](Docs/07-Technical_Design/) | Architecture, data model, API spec, core logic, security |
| [`Presentation/08-Video_Script.md`](Docs/Presentation/08-Video_Script.md) | 8-minute demo video script |

## Status

Prototype scope — not production-hardened. Identities, stock levels, and the disaster scenario are synthetic and labelled as such in the UI. See [`Docs/01-PS_Analysis.md`](Docs/01-PS_Analysis.md) §15 for what a real deployment would still need (real inventory ownership, IAM, offline sync, legal/privacy review, etc.).
