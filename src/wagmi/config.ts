declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

import { http, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// https://wagmi.sh/react/getting-started#create-config
export const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  multiInjectedProviderDiscovery: true,
  transports: {
    [mainnet.id]: http(),
  },
});
