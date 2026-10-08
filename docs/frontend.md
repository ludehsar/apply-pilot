# Frontend — shadcn/ui, Tailwind v4, Next.js, Vite

## `packages/ui`

- shadcn/ui source (style `radix-nova`, Radix primitives) in `packages/ui/src/components`. It currently holds `button` and `theme-provider`.
- Add components **only** through the CLI, so they land in the shared package with their dependencies:

  ```bash
  pnpm dlx shadcn@latest add <component> -c apps/web
  ```
  Import with `import { Button } from "@workspace/ui/components/button"`.
- All `components.json` files share the same `style`, `baseColor`, and `iconLibrary`.
- Design tokens live only in `packages/ui/src/styles/globals.css`. Use semantic classes (`bg-background`, `text-muted-foreground`), never raw colors.
- To extend a component, add `cva` variants inside its file rather than wrapping it.
- Fonts: Next.js uses `next/font` (Geist); the Vite apps import `@workspace/ui/fonts.css`.

## `apps/web` — Next.js 16

```
app/layout.tsx   fonts, globals.css, ThemeProvider
app/page.tsx     /
```
- Next 16 has breaking changes. Read `apps/web/node_modules/next/dist/docs/` before using an unfamiliar API.
- Server Components by default; add `"use client"` only on leaves that need it.
- Pages that need fresh data per request call `await connection()` (from `next/server`) before fetching. Data routes get `loading.tsx` and `error.tsx` (`error.tsx` uses `retry()`).

## `apps/admin` and `apps/extension` — Vite + React

```
src/
  main.tsx    Redux Provider → ThemeProvider → App/Popup
  store.ts    createAppStore + rootSaga + typed hooks
  app.tsx     (admin) / popup.tsx (extension)
  index.css   @import "@workspace/ui/globals.css"; @import "@workspace/ui/fonts.css";
```
- `@/` resolves to `src/` (set in both `vite.config.ts` and `tsconfig.json`).
- As an app grows, group code by feature: `src/features/<name>/` with its components, slice, and saga.
- Env vars must start with `VITE_`; declare their types in `src/vite-env.d.ts` when you add the first one.
- `ThemeProvider` gets `scriptProps={{ type: "application/json" }}` in the Vite apps, which turns off next-themes' SSR-only inline script.
- When the admin needs multiple pages, add React Router (data mode: `createBrowserRouter` from `react-router`, `RouterProvider` from `react-router/dom`).

## Rules

- One component per file, named export, `<Name>Props` interface just above it.
- Read state with `useAppSelector`, dispatch with `useAppDispatch` (both from `@/store`).
- Icon-only buttons get an `aria-label`; form controls get a `<Label htmlFor>`.
- Use platform features before adding libraries (`<form>` + `FormData`, `Intl`).
