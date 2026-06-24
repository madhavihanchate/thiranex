# Thiranex — Task Management Application

A production-ready, full-stack task management web application with JWT authentication, CRUD operations, optional WebSocket real-time updates, and a premium responsive UI.

![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)

## Architecture

```
┌──────────────────────────────────────────────┐
│              Client (React + Vite)            │
│  ┌─────────┐ ┌─────────┐ ┌───────────────┐  │
│  │  Pages   │ │  Store  │ │  Components   │  │
│  │ Login    │ │ Zustand │ │ TaskCard      │  │
│  │ Register │ │ Auth    │ │ TaskModal     │  │
│  │ Dashboard│ │ Tasks   │ │ TaskFilters   │  │
│  └─────────┘ └─────────┘ └───────────────┘  │
│            ↕ fetch /api/*                     │
├──────────────────────────────────────────────┤
│              Server (Express.js)              │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │Middleware │ │ Services │ │   Routes    │  │
│  │ Auth     │ │ Auth     │ │ /api/auth/* │  │
│  │ Validate │ │ Task     │ │ /api/tasks/*│  │
│  │ RateLimit│ └──────────┘ └─────────────┘  │
│  └──────────┘       ↕                        │
│  ┌──────────────────────────────────────┐    │
│  │         Models (sql.js / SQLite)      │    │
│  │   users │ tasks │ refresh_tokens      │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Backend | Express.js 4.x, TypeScript, Node.js |
| Frontend | React 18, Vite, TypeScript |
| Database | SQLite via sql.js (pure JS, zero native deps) |
| Auth | JWT access + refresh tokens, bcrypt |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Validation | Zod |
| Testing | Vitest + Supertest |
| Real-time | WebSocket via ws (feature-flagged) |

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd thiranex
npm install

# 2. Configure environment (defaults work out of box)
cp .env.example .env

# 3. Run migrations & seed demo data
npm run db:migrate
npm run db:seed

# 4. Start development servers
npm run dev
```

The app will be available at **http://localhost:5173** (Vite dev server).
The API runs at **http://localhost:3001**.

### Demo Accounts

| Email | Password | Role |
|:------|:---------|:-----|
| admin@demo.com | password123 | Admin |
| user@demo.com | password123 | User |

## Environment Variables

| Variable | Default | Description |
|:---------|:--------|:------------|
| `PORT` | 3001 | API server port |
| `NODE_ENV` | development | Environment mode |
| `DATABASE_PATH` | ./data/taskmanager.db | SQLite database file path |
| `ACCESS_TOKEN_SECRET` | — | JWT access token signing secret (min 32 chars) |
| `REFRESH_TOKEN_SECRET` | — | JWT refresh token signing secret (min 32 chars) |
| `ACCESS_TOKEN_EXPIRY` | 15m | Access token lifetime |
| `REFRESH_TOKEN_EXPIRY` | 7d | Refresh token lifetime |
| `RATE_LIMIT_AUTH_MAX` | 10 | Max auth requests per IP per window |
| `RATE_LIMIT_AUTH_WINDOW_MS` | 60000 | Rate limit window (ms) |
| `ENABLE_WEBSOCKETS` | false | Enable real-time WebSocket features |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |

## API Reference

### Authentication

```
POST   /api/auth/register   — Register new user
POST   /api/auth/login      — Login (returns accessToken + sets refreshToken cookie)
POST   /api/auth/refresh    — Refresh access token (uses httpOnly cookie)
DELETE /api/auth/logout     — Logout (revokes refresh token)
```

#### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
# Response: { accessToken: "...", user: { id, email, role } }
# Sets httpOnly refreshToken cookie
```

### Tasks (all require `Authorization: Bearer <token>`)

```
GET    /api/tasks           — List tasks (paginated, filterable)
POST   /api/tasks           — Create task
GET    /api/tasks/:id       — Get single task
PATCH  /api/tasks/:id       — Update task
DELETE /api/tasks/:id       — Soft delete task
POST   /api/tasks/:id/restore — Restore deleted task
```

#### Query Parameters (GET /api/tasks)

| Param | Type | Default | Options |
|:------|:-----|:--------|:--------|
| `status` | string | — | todo, in_progress, done |
| `priority` | string | — | low, medium, high |
| `page` | number | 1 | any positive integer |
| `limit` | number | 20 | 1-100 |
| `sortBy` | string | created_at | created_at, due_date |
| `sortOrder` | string | desc | asc, desc |

#### Create Task
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Details","priority":"high","due_date":"2026-12-31"}'
```

### WebSocket (optional)

```
WS /ws/tasks?token=<accessToken>
```

Events: `connected`, `task_updated`, `task_created`, `task_deleted`, `typing`

## Project Structure

```
├── client/                  # React frontend
│   ├── index.html           # HTML entry
│   └── src/
│       ├── main.tsx         # React entry
│       ├── App.tsx          # Router setup
│       ├── index.css        # Tailwind v4 + design system
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route pages
│       ├── store/           # Zustand state stores
│       └── hooks/           # Custom hooks
├── src/                     # Express backend
│   ├── server.ts            # Entry point
│   ├── app.ts               # Express app (no listen)
│   ├── config/              # Env config + database
│   ├── api/                 # Route handlers
│   ├── services/            # Business logic
│   ├── models/              # Database queries
│   ├── middleware/           # Auth, validation, errors
│   ├── ws/                  # WebSocket handler
│   └── utils/               # Migration & seed scripts
├── migrations/              # SQL migration files
├── tests/                   # Integration tests
├── .env.example             # Environment template
├── package.json             # Dependencies & scripts
├── vite.config.ts           # Vite + Tailwind config
├── vitest.config.ts         # Test config
└── tsconfig.json            # TypeScript config
```

## Scripts

| Script | Description |
|:-------|:------------|
| `npm run dev` | Start API + Vite dev server concurrently |
| `npm run dev:server` | Start API server only (with hot reload) |
| `npm run dev:client` | Start Vite dev server only |
| `npm run build` | Build frontend for production |
| `npm start` | Start production server |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed demo data |
| `npm test` | Run integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Design Decisions & Tradeoffs

### Why sql.js instead of better-sqlite3?
`better-sqlite3` requires native C++ compilation via node-gyp, which needs Visual Studio Build Tools on Windows. `sql.js` compiles SQLite to WebAssembly via Emscripten — zero native dependencies, works everywhere. The tradeoff is slightly lower performance, but negligible for this scale.

### Why Zustand over Redux?
Zustand provides hooks-based state management with minimal boilerplate. For an app of this scope, Redux would be overkill. Zustand stores are ~50 lines vs. Redux's actions/reducers/selectors at ~200+ lines.

### Why access tokens in memory?
Access tokens are stored in Zustand (in-memory, cleared on page reload) rather than localStorage. This prevents XSS attacks from accessing tokens. Refresh tokens are stored in httpOnly cookies that JavaScript cannot read.

### Why soft delete with 30s undo?
Permanent deletion is irreversible and error-prone. Soft delete (setting `deleted_at` timestamp) allows a 30-second undo window. The client removes the task from the UI immediately for responsiveness, then sends the DELETE request after 30 seconds if not undone.

### Why Tailwind CSS v4?
Zero-config setup with the Vite plugin. All customization done in CSS via `@theme` — no `tailwind.config.js` needed. Built on the Rust-based Oxide engine for fast builds.

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

Tests cover:
- **Auth**: register, login (valid/invalid), refresh, logout
- **Tasks**: CRUD, pagination, filtering, ownership isolation, soft delete + restore

## License

MIT
