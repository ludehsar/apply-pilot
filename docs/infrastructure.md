# Infrastructure

## Services (`docker-compose.yml`)

| Service | Image | Host port | Started by |
| --- | --- | --- | --- |
| `postgres` | `postgres:18-alpine` | `5433` (`POSTGRES_PORT`) | `pnpm dev` or `pnpm infra:up` |
| `api` | `apps/api/Dockerfile` | `8080` (`API_PORT`) | `pnpm stack:up` (profile `full`) |

- `pnpm dev`: Turborepo runs the root `dev:infra` task (`docker compose up postgres`, attached) **alongside** `api#dev` (`cargo run`), via `"with": ["//#dev:infra"]` in `apps/api/turbo.json`. Ctrl+C stops everything, the container included.
- `pnpm dev --filter api` runs Postgres and the API only. `pnpm --filter api dev` skips Turborepo, so it does **not** start Postgres.
- The API waits for Postgres (bb8's default 30s connection timeout), then runs pending migrations. If Postgres never comes up, it exits with `cannot connect to Postgres … try pnpm infra:up`.
- Postgres without the apps: `pnpm infra:up` / `pnpm infra:down`. Fully containerized backend: `pnpm stack:up` / `pnpm stack:down`.
- Port 5433 avoids clashes with other local Postgres instances. Inside compose, the API connects to `postgres:5432`.
- Postgres 18 data lives at `/var/lib/postgresql` (volume `postgres-data`). Wipe it with `docker compose down -v`.
- `init: true` on the `api` service makes `docker stop` terminate the binary immediately.

## Environment (`apps/api/.env`, template in `.env.example`)

| Var | Example |
| --- | --- |
| `DATABASE_URL` | `postgres://apply_pilot:apply_pilot@localhost:5433/apply_pilot` (also read by the Diesel CLI) |
| `API_PORT` | `8080` |
| `CORS_ORIGINS` | `http://localhost:3000,http://localhost:5173` |
| `RUST_LOG` | `api=debug,tower_http=info` |

The frontends don't use env vars yet. When you add one, put it in that app's `.env.example` (Vite apps need the `VITE_` prefix) and list it in `turbo.json` `tasks.build.env` if it affects build output.

## Docker image

- Multi-stage build: `rust:1.98-slim-trixie` builder → `debian:trixie-slim` runtime, running as non-root user `app`. BuildKit cache mounts keep rebuilds incremental.
- No libpq needed (diesel-async talks to Postgres in pure Rust). Migrations and the Swagger UI assets are compiled into the binary.
- `HEALTHCHECK` calls `/api/v1/health`, which pings the database.

## Turborepo

- Tasks: `dev`, `build`, `lint`, `typecheck`, `format`. The Rust app takes part through the cargo scripts in `apps/api/package.json`.
- `apps/api/turbo.json` turns off caching for `build` (cargo has its own incremental cache).
