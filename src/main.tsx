import "./index.scss";

import App from "./App.tsx";
import { ClientProvider } from "./providers/ClientProvider.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClientProvider>
      <App />
    </ClientProvider>
  </StrictMode>
);
