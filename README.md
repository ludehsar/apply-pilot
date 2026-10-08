# Apply Pilot

Track job applications from wishlist to offer. Turborepo monorepo:

| Workspace | Stack | Port |
| --- | --- | --- |
| `apps/api` | Rust, Axum 0.8, Diesel 2 (diesel-async), utoipa + Swagger UI, Postgres 18 | 8080 |
| `apps/web` | Next.js 16 App Router, shadcn/ui, Tailwind v4 | 3000 |
| `apps/admin` | React 19, Vite 8, Redux Toolkit + Redux Saga | 5173 |
| `apps/extension` | Chrome MV3 via CRXJS, React 19, Redux Toolkit + Redux Saga | 5174 |
| `packages/ui` | shared shadcn/ui components and theme | – |
| `packages/store` | `createAppStore` (RTK + saga middleware) | – |

## Prerequisites

Node ≥ 20.9, pnpm 11, Rust (stable), Docker, Diesel CLI (`cargo install diesel_cli --no-default-features --features postgres`).

## Quick start

```bash
pnpm install
cp apps/api/.env.example apps/api/.env

pnpm dev           # starts postgres (localhost:5433), api, web, admin, extension
```

API docs (Swagger UI): http://localhost:8080/docs. All routes live under `/api/v1`.

Load the extension: `chrome://extensions` → Developer mode → **Load unpacked** → `apps/extension/dist`.

Containerized backend instead of `cargo run`: `pnpm stack:up`.

## Scripts

| Command | Does |
| --- | --- |
| `pnpm dev` | Run Postgres (docker compose) alongside every app; Ctrl+C stops all (frontends hot-reload; restart for API changes) |
| `pnpm dev --filter api` | Postgres + API only |
| `pnpm build` / `lint` / `typecheck` / `format` | Run across all workspaces via Turborepo |
| `pnpm infra:up` / `infra:down` | Start/stop Postgres |
| `pnpm stack:up` / `stack:down` | Start/stop Postgres + API containers |

## Docs

Engineering conventions live in [`docs/`](./docs/README.md).
