# Chrome Extension — `apps/extension`

Manifest V3 extension built with Vite and [CRXJS](https://crxjs.dev). It uses the same UI kit and store setup as the admin app.

- The manifest is defined in `vite.config.ts` with `defineManifest`; `version` comes from `package.json`.
- `action.default_popup` → `index.html` → `src/main.tsx` → `src/popup.tsx`. The popup is fixed at `w-[360px]`.
- It requests no permissions yet. Add them only for a concrete feature: `activeTab` to read the current tab on click, and `host_permissions: ["http://localhost:8080/*"]` before calling the API. Host permissions also exempt extension pages from CORS.

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
