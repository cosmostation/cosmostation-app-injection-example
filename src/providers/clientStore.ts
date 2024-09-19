import chains, { Chain } from "../constants/chains";

import { StargateClient } from "@cosmjs/stargate";

const clients: { [chainId: string]: StargateClient } = {};

export const clientStore = {
  getClients: () => clients,
  subscribe: (onStoreChange: () => void) => {
    const createClient = async (chain: Chain) => {
      if (!clients[chain.chainId]) {
        clients[chain.chainId] = await StargateClient.connect(chain.rpc);
      }
    };

    chains.forEach(createClient);

    onStoreChange();
  },
};
