import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

import { App } from "@/app"
import { store } from "@/store"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider scriptProps={{ type: "application/json" }}>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
