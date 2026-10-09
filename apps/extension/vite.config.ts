import { fileURLToPath, URL } from "node:url"
import { crx, defineManifest } from "@crxjs/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

import pkg from "./package.json" with { type: "json" }

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "")
  const encodedHost = env.VITE_CLERK_PUBLISHABLE_KEY?.split("_")[2]
  if (!encodedHost || !env.CRX_PUBLIC_KEY || !env.VITE_CLERK_SYNC_HOST) {
    throw new Error(
      "Set VITE_CLERK_PUBLISHABLE_KEY, CRX_PUBLIC_KEY and VITE_CLERK_SYNC_HOST in apps/extension/.env.local"
    )
  }
  // The publishable key is base64 of "<frontend-api-host>$".
  const clerkFrontendApi = atob(encodedHost).slice(0, -1)

  const manifest = defineManifest({
    manifest_version: 3,
    name: "Apply Pilot",
    version: pkg.version,
    // A fixed key keeps the extension ID stable, which Clerk's allowed_origins depends on.
    key: env.CRX_PUBLIC_KEY,
    action: { default_popup: "index.html" },
    permissions: ["cookies", "storage"],
    host_permissions: [
      `${env.VITE_CLERK_SYNC_HOST}/*`,
      `https://${clerkFrontendApi}/*`,
    ],
  })

  return {
    plugins: [react(), tailwindcss(), crx({ manifest })],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: {
      port: 5174,
      strictPort: true,
      cors: { origin: [/chrome-extension:\/\//] },
    },
  }
})
