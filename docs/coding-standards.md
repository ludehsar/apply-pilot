# Coding Standards

## Non-negotiables

1. **No comments in code.** Names and types carry the meaning; longer explanations go in `docs/`.
2. **Minimal by default.** Build only what's asked. No speculative abstractions, placeholder files, or unused dependencies.
3. **Strict types.** TypeScript `strict` + `noUncheckedIndexedAccess`; Rust `clippy -D warnings`. No `any`. No `unwrap()`/`expect()` outside startup and tests.
4. **One way to do each thing.** Side effects in React apps go through sagas. UI primitives come from `packages/ui`. API errors go through `AppError`.
5. **Done means `pnpm lint typecheck build` passes.**

## SOLID, applied with restraint

| Principle | Here |
| --- | --- |
| Single responsibility | One route module per resource (`routes/<name>.rs`); one component per file. |
| Open/closed | Add an endpoint by adding a module and one `routes!(...)` line. Existing modules stay untouched. |
| Liskov | Anything that implements a trait must behave the same as the other implementations. |
| Interface segregation | Props and function params take only what they use. |
| Dependency inversion | Introduce a trait **only** when a second implementation exists (e.g. a test double). Never for a single implementation. |

## DRY, with judgement

- Duplicate once; extract when a second real consumer appears.
- Knowledge with exactly one home: DB schema → migrations plus the generated `src/schema.rs`; design tokens → `packages/ui/src/styles/globals.css`.

## Naming

| Thing | Convention |
| --- | --- |
| TS files | kebab-case (`save-form.tsx`) |
| React components | PascalCase, named export |
| Redux actions | `<verb>Requested` / `<verb>Succeeded` / `<verb>Failed` |
| Selectors | `select<Thing>` |
| Rust modules | snake_case |
| API paths | plural nouns, relative to `/api/v1` (`/users/{id}`) |
| JSON fields | camelCase (`#[serde(rename_all = "camelCase")]`) |
| DB tables/columns | snake_case, plural tables |

## Exports

Use named exports, except where a framework requires a default export (Next.js pages/layouts, tool configs).

## Tests

Add a test with the first piece of non-trivial logic (a branch, a rule, a parser), and add the `test` script to that workspace's `package.json` at the same time. Trivial pass-throughs don't need tests.

## Formatting

Prettier (root `.prettierrc`, Tailwind class sorting) for TS/JSON; `cargo fmt` for Rust. `pnpm format` runs both.
