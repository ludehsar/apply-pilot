import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { ThemeProvider } from "@workspace/ui/components/theme-provider"

import { Popup } from "@/popup"
import { store } from "@/store"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider scriptProps={{ type: "application/json" }}>
        <Popup />
      </ThemeProvider>
    </Provider>
  </StrictMode>
)
