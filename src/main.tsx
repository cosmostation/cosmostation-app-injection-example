import "./index.scss";

import App from "./App.tsx";
import { ClientProvider } from "./providers/ClientProvider.tsx";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { config } from "./wagmi/config.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// https://wagmi.sh/react/getting-started#wrap-app-in-context-provider
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ClientProvider>
          <App />
        </ClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
