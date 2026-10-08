# Architecture

This page covers the monorepo layout. The product and runtime architecture (Kafka, PgBouncer, pgvector, Rig, the extension apply flow) is in [system-design.md](./system-design.md).

```
apps/web ─────────────┐
apps/admin ───────────┼──► packages/ui
apps/extension ───────┘
apps/admin, extension ───► packages/store
all frontends ──HTTP/JSON──► apps/api (/api/v1) ──Diesel──► Postgres
```

- The API owns business rules. Frontends render what the API accepts or the error it returns.
- `apps/web` is server-rendered and doesn't use Redux. `admin` and `extension` keep client state in Redux, with side effects in sagas.

## Where code belongs

| You are writing… | Put it in |
| --- | --- |
| A UI primitive (button, dialog, table) | `packages/ui` via `pnpm dlx shadcn@latest add <name> -c apps/web` |
| An app-specific component or page | the app (`apps/<app>/src/…`, `apps/web/app/…`) |
| Redux state or saga used by one app | that app |
| Redux state or saga used by two or more apps | a new folder in `packages/store/src/` |
| An HTTP endpoint, query, or business rule | `apps/api/src/routes/<name>.rs` |
| Tooling config | `packages/eslint-config`, `packages/typescript-config` |

Start local to the app. Move code into a `packages/*` workspace only when a **second** consumer needs it.

## Internal packages have no build step

`packages/*` export `.ts/.tsx` source directly, and each consumer compiles it: Next.js through `transpilePackages`, Vite natively. To add one, write a `package.json` with `exports`, a `tsconfig.json` extending `@workspace/typescript-config/internal-package.json`, and an `eslint.config.js`. Then add it to consumers with `pnpm add "@workspace/<name>@workspace:*"`.

Packages never import from apps.
