@AGENTS.md
@docs/README.md

# Working in this repo

- Before changing code, read the doc for that area (`docs/backend.md`, `docs/frontend.md`, `docs/state-management.md`, …) and follow its checklist.
- Do only what is asked. Keep things minimal: no speculative abstractions, placeholder files, or unused dependencies.
- No comments in code.
- API routes are relative to `/api/v1` (applied once in `apps/api/src/main.rs`). Every handler has `#[utoipa::path]` and is registered in `apps/api/src/routes/mod.rs`, so it appears at `/docs`.
- Database access goes through Diesel; schema changes go through `diesel migration generate` + `diesel migration run`.
- Add UI primitives only via `pnpm dlx shadcn@latest add <name> -c apps/web`.
- Done means `pnpm lint typecheck build` passes.
