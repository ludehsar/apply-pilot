# Chrome Extension — `apps/extension`

Manifest V3 extension built with Vite and [CRXJS](https://crxjs.dev). It uses the same UI kit and store setup as the admin app.

- The manifest is defined in `vite.config.ts` with `defineManifest`; `version` comes from `package.json`.
- `action.default_popup` → `index.html` → `src/main.tsx` → `src/popup.tsx`. The popup is fixed at `w-[360px]`.
- It requests `cookies` and `storage`, with host permissions for the sync host and Clerk's Frontend API, all for auth (below). Add more only for a concrete feature: `activeTab` to read the current tab on click, and `http://localhost:8080/*` before calling the API. Host permissions also exempt extension pages from CORS.

## Auth

Clerk (`@clerk/chrome-extension`) with **Sync Host**: the user signs in on `apps/web`, and the extension reads that Clerk session through the `cookies` permission. The popup has no sign-in form of its own; when signed out it links to the web app's `/sign-in`.

- Clerk only accepts requests from `chrome-extension://<id>` origins listed in the instance's `allowed_origins`. The ID comes from the manifest `key` (`CRX_PUBLIC_KEY`), so keep the key fixed. To register a new ID: `clerk api /instance -X PATCH -d '{"allowed_origins":["chrome-extension://<id>"]}'`. This replaces the whole list, so include any existing origins.
- For production, use the Chrome Web Store item's public key (Developer Dashboard → Package → View public key), set `VITE_CLERK_SYNC_HOST` to the production Clerk Frontend API, and register the store ID.
- `vite.config.ts` derives the Clerk Frontend API host from the publishable key, so it isn't a separate env var.

## Develop

```bash
pnpm dev --filter extension
```
In Chrome, open `chrome://extensions`, enable Developer mode, click **Load unpacked**, and select `apps/extension/dist`. The popup hot-reloads while `dev` runs. You can also open it as a normal page at `http://localhost:5174/index.html` (no `chrome.*` APIs there).

## Build

`pnpm --filter extension build` writes `apps/extension/dist`; zip that folder for the Chrome Web Store.

## Rules

- Wrap `chrome.*` calls in small helpers that degrade gracefully when the APIs aren't available (`globalThis.chrome?.tabs`).
- The popup is destroyed each time it closes. Long-running work belongs in a `background.service_worker`, reached via `chrome.runtime.sendMessage`.
