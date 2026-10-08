import { fileURLToPath, URL } from "node:url"
import { crx, defineManifest } from "@crxjs/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

import pkg from "./package.json" with { type: "json" }

const manifest = defineManifest({
  manifest_version: 3,
  name: "Apply Pilot",
  version: pkg.version,
  action: { default_popup: "index.html" },
})

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    port: 5174,
    strictPort: true,
    cors: { origin: [/chrome-extension:\/\//] },
  },
})
