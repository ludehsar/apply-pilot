# Coding Standards

These rules apply to every human and AI contributor. When a rule here conflicts with a global or tool-level default (for example a global "no comments" rule), **this document wins inside this repo**.

## Non-negotiables

1. **Minimal by default.** Build only what's asked. No speculative abstractions, placeholder files, or unused dependencies.
2. **Strict types.** TypeScript `strict` + `noUncheckedIndexedAccess`; Rust `clippy -D warnings`. No `any`. No `unwrap()`/`expect()` outside startup code and tests.
3. **No raw SQL in application code.** All queries go through the Diesel query DSL (see [Database rules](#database-rules)).
4. **Every schema change is a migration.** Never alter a database by hand, from a script, or from application code.
5. **One way to do each thing.** Side effects in React apps go through sagas. UI primitives come from `packages/ui`. API errors go through `AppError`. Async work goes through Kafka events.
6. **Respect the structure.** Code lives in the folder its app's layout assigns it (see [Project structure](#project-structure)). Don't invent a parallel structure.
7. **Done means `pnpm lint typecheck build` passes**, plus `cargo fmt && cargo clippy --all-targets -- -D warnings` for Rust changes.

## Comments

Comments are **allowed** in this repo. They explain **why**, not **what**.

Write a comment when:
- the code makes a non-obvious decision ("PgBouncer runs in transaction mode, so no session-level `SET` here");
- there is an invariant the type system can't express ("`bullets` must belong to exactly one owner; enforced by a CHECK constraint");
- there is a workaround for an external system (ATS quirks, Kafka/librdkafka behaviour, browser API limits), with a link if one exists;
- an LLM prompt or guardrail exists for a reason that isn't obvious from the text itself.

Document public APIs:
- Rust: `///` doc comments on public traits, trait methods, and domain/service functions. Every `JobSource` and other adapter trait method documents its contract (what it must return, which errors it may raise, whether it may be retried).
- TypeScript: TSDoc (`/** … */`) on exports from `packages/*` and on adapter interfaces in `apps/extension`.

Don't:
- narrate the code (`// increment i`, `// call the API`);
- leave commented-out code; delete it, because git remembers;
- write `TODO` without an owner or issue reference (`// TODO(#42): paginate once Lever returns > 100 jobs`).

Longer explanations (design rationale, flows, trade-offs) belong in `docs/`, and the comment links to them.

## SOLID, applied with restraint

| Principle | What it means here | Example in this codebase |
| --- | --- | --- |
| Single responsibility | A module has one reason to change. HTTP handlers parse, authorize, delegate, and map the response. They don't hold business rules or queries. | `routes/jobs.rs` calls `domain::jobs::service`; queries live in `domain::jobs::repo`. |
| Open/closed | Add behaviour by adding a module, not by editing a `match` across the codebase. | New job board = new `JobSource` impl + one registry line. New ATS = new `AtsAdapter` in the extension. |
| Liskov substitution | Every implementation of a trait honours the documented contract. Callers never check which impl they hold. | Every `JobSource::fetch` returns `NormalizedJob`s with stable `external_id`s, or a typed error. |
| Interface segregation | Traits and props are small and take only what they use. | `Embedder` exposes `embed(texts)`, not the whole LLM client. |
| Dependency inversion | Domain code depends on traits for **external systems** (job boards, LLM/embedding providers, Kafka producer), and the concrete type is wired in `main`/`bin`. | Services receive `&dyn Embedder` / `impl EventPublisher`. |

Restraint: introduce a trait only when there is a second implementation **or** an external boundary (network, LLM, queue) that tests need to fake. Never write a trait with one implementation "for later".

## DRY, with judgement

- Duplicate once; extract when a second real consumer appears.
- Knowledge has exactly one home:
  - DB schema → migrations + generated `src/schema.rs`.
  - Kafka topic names and event payloads → `apps/api/src/events/` (one enum/struct per event, never string literals at call sites).
  - LLM prompts → `apps/api/src/ai/prompts/`, versioned (see [system-design.md](./system-design.md#ai-layer-rig)).
  - Design tokens → `packages/ui/src/styles/globals.css`.
  - API request/response shapes → Rust types with `ToSchema`; frontends consume the OpenAPI spec and don't redefine shapes by hand.
- Two things that look alike but change for different reasons are **not** duplication. Don't merge them.

## Project structure

Every app owns its folder structure. Create a folder the first time something belongs in it, not before.

### `apps/api` (Rust)

```
apps/api/
  migrations/                 Diesel migrations: the ONLY place SQL is written
  src/
    lib.rs                    module tree shared by all binaries
    main.rs                   HTTP server binary
    bin/
      worker.rs               Kafka consumers (embedding, XYZ analysis, tailoring, matching)
      relay.rs                outbox → Kafka relay + ingestion scheduler
    config.rs  db.rs  error.rs  schema.rs (generated)
    routes/                   HTTP only: extractors, #[utoipa::path], DTO ↔ domain mapping
    domain/<context>/         one folder per bounded context: jobs, profile, resume, applications, users
      model.rs                domain types (no Axum, no Kafka)
      repo.rs                 Diesel queries for this context
      service.rs              use cases; the only place business rules live
    adapters/
      job_sources/            JobSource trait + one file per source (greenhouse.rs, lever.rs, …)
    ai/                       Rig clients, agents, extractors, prompts/
    events/                   event envelope, topic enum, producer, consumer runner, outbox
```

Dependency direction: `routes` → `domain` ← `adapters`/`ai`/`events`. `domain` never imports `axum`, `rdkafka`, or a concrete Rig provider.

A pure-CRUD resource with no business rules may stay a single `routes/<name>.rs` (see [recipes.md](./recipes.md)). Once it gains a rule, an event, or a worker consumer, move it into `domain/<context>/`.

### `apps/web` (Next.js 16)

```
app/<route>/page.tsx          server components by default
app/<route>/_components/      components used only by that route
lib/api/                      typed API client (generated from OpenAPI or thin fetch wrappers)
```

### `apps/admin` (Vite + Redux)

```
src/features/<feature>/       components, slice.ts, saga.ts, selectors.ts
src/lib/                      api client, small helpers used by 2+ features
```

### `apps/extension` (Chrome MV3)

```
src/background/               service worker: auth token, API calls, tab orchestration
src/content/                  content scripts
  ats/<vendor>.ts             one AtsAdapter per ATS (greenhouse, lever, workday, ashby, …)
  fill.ts                     DOM filling primitives shared by adapters
src/popup/                    popup UI
src/features/<feature>/       Redux slices/sagas
src/lib/chrome.ts             guarded wrappers around chrome.* APIs
```

### `packages/*`

A package exists only when two apps consume it. Packages never import from apps.

## Database rules

- **Migrations only.** Create them with `diesel migration generate <verb>_<noun>` (e.g. `create_jobs`, `add_embedding_to_bullets`), write `up.sql` **and** a working `down.sql`, run `diesel migration run`, and check that `diesel migration redo` passes. Commit the regenerated `src/schema.rs`.
- Migration SQL is the **only** SQL in the repo. It covers DDL, extensions (`CREATE EXTENSION vector`), indexes (HNSW), constraints, and triggers.
- **Never edit a migration that has run in a shared environment.** Add a new one.
- Make destructive changes in two steps: (1) add the new column/table, ship code that writes both; (2) backfill, switch reads, and drop the old one in a later migration.
- **No raw SQL in Rust code.** Forbidden: `diesel::sql_query`, `diesel::dsl::sql::<T>(...)`, SQL built with `format!`, and any other string-built query. Use the Diesel DSL:
  - vector search → `pgvector` crate (`diesel` feature): `.order(bullets::embedding.cosine_distance(&query_vec))`;
  - Postgres functions → `define_sql_function!`;
  - locking → `.for_update().skip_locked()`;
  - upserts → `.on_conflict(...).do_update().set(...)`.
- If the DSL genuinely can't express a query, **stop and raise it**. Don't work around the rule.
- Enforce data integrity in the database (`NOT NULL`, `CHECK`, `UNIQUE`, foreign keys), not only in Rust.
- Multi-row writes that must succeed together run in one `conn.transaction(...)`. Any write that also emits an event writes its outbox row **in the same transaction**.

## Rust conventions

- Errors: `thiserror` enums per context, converted into `AppError` at the HTTP edge. Never stringly-typed errors across module boundaries.
- Async everywhere on I/O. No blocking calls on the Tokio runtime; wrap CPU-heavy work (PDF rendering) in `spawn_blocking`.
- Prefer newtypes for IDs that are easy to mix up (`JobId(Uuid)`, `UserId(Uuid)`).
- `tracing` spans on every handler, consumer, and adapter call. Never log PII (resume content, emails, phone numbers) or secrets.
- Config is read only in `config.rs`. Nothing else calls `std::env`.

## TypeScript conventions

- One component per file, named export, `<Name>Props` interface just above it.
- Validate data at trust boundaries: API responses in the extension, messages between content script and background, and anything read from a third-party page DOM.
- No direct `chrome.*` calls outside `src/lib/chrome.ts`.

## Naming

| Thing | Convention |
| --- | --- |
| TS files | kebab-case (`save-form.tsx`) |
| React components | PascalCase, named export |
| Redux actions | `<verb>Requested` / `<verb>Succeeded` / `<verb>Failed` |
| Selectors | `select<Thing>` |
| Rust modules | snake_case |
| Traits | capability nouns (`JobSource`, `Embedder`, `EventPublisher`) |
| API paths | plural nouns, relative to `/api/v1` (`/jobs/{id}`) |
| JSON fields | camelCase (`#[serde(rename_all = "camelCase")]`) |
| DB tables/columns | snake_case, plural tables |
| Migrations | `<verb>_<noun>` (`create_jobs`, `add_status_to_applications`) |
| Kafka topics | `<context>.<event>` past tense (`jobs.upserted`, `profile.bullet_changed`) |
| Prompts | `<purpose>_v<n>` (`xyz_analyze_v1`) |

## Exports

Use named exports, except where a framework requires a default export (Next.js pages/layouts, tool configs).

## Tests

- Add a test with the first piece of non-trivial logic (a branch, a rule, a parser), and add the `test` script to that workspace's `package.json` at the same time. Trivial pass-throughs don't need tests.
- Every `JobSource` adapter gets a test against a recorded fixture response, never against the live site.
- Every `AtsAdapter` gets a test against a saved HTML fixture of the form.
- LLM-dependent services are tested with a fake `Embedder`/completion client. Deterministic guardrails (e.g. "no new numbers in tailored bullets") get their own unit tests.

## Formatting

Prettier (root `.prettierrc`, Tailwind class sorting) for TS/JSON; `cargo fmt` for Rust. `pnpm format` runs both.
