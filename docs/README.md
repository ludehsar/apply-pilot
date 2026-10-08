# Apply Pilot — Engineering Docs

Read the doc for the area you are changing **before** writing code.

| Doc | Read when you are… |
| --- | --- |
| [architecture.md](./architecture.md) | Unsure where code belongs, or adding an app/package |
| [coding-standards.md](./coding-standards.md) | Writing any code (SOLID, DRY, naming, no comments) |
| [backend.md](./backend.md) | Touching `apps/api` (Axum, Diesel, OpenAPI) |
| [frontend.md](./frontend.md) | Touching `apps/web`, `apps/admin`, `apps/extension`, `packages/ui` |
| [state-management.md](./state-management.md) | Adding Redux state or sagas |
| [chrome-extension.md](./chrome-extension.md) | Touching `apps/extension` |
| [infrastructure.md](./infrastructure.md) | Running locally, Docker, env vars, ports |
| [recipes.md](./recipes.md) | Adding an endpoint, a table, a slice, or a UI component |

## Repo at a glance

```
apps/
  api/         Rust · Axum 0.8 · Diesel 2 (diesel-async) · utoipa   :8080  docs at /docs
  web/         Next.js 16 App Router                                 :3000
  admin/       React · Vite · Redux Toolkit + Redux Saga             :5173
  extension/   Chrome MV3 · CRXJS · Redux Toolkit + Redux Saga       :5174
packages/
  ui/                 shadcn/ui components, Tailwind v4 theme, fonts
  store/              createAppStore (RTK + saga middleware)
  eslint-config/      shared ESLint flat configs
  typescript-config/  shared tsconfig presets
docker-compose.yml    postgres (+ api under the "full" profile)
```

## Commands

```bash
pnpm install
pnpm dev                      # postgres + every app
pnpm lint typecheck build     # all workspaces via turbo
```
