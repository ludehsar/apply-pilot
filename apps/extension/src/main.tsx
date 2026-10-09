import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { ClerkProvider } from "@clerk/chrome-extension"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"
import { clerkTheme } from "@workspace/ui/lib/clerk"

import { Popup } from "@/popup"
import { store } from "@/store"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      syncHost={import.meta.env.VITE_CLERK_SYNC_HOST}
      afterSignOutUrl="/index.html"
      appearance={{ theme: clerkTheme }}
    >
      <Provider store={store}>
        <ThemeProvider scriptProps={{ type: "application/json" }}>
          <Popup />
        </ThemeProvider>
      </Provider>
    </ClerkProvider>
  </StrictMode>
)
