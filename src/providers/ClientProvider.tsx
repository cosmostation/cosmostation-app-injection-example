import chains, { Chain } from "../constants/chains";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { StargateClient } from "@cosmjs/stargate";

interface Client {
  chain: Chain;
  client: StargateClient;
}

interface IClientProvider {
  clients: Client[];
  getClient: (chainId: string) => Client | undefined;
}

export const ClientContext = createContext<IClientProvider>({
  clients: [],
  getClient: () => undefined,
});

export const ClientProvider: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    (async () => {
      const _clients = await Promise.all(
        chains.map(async (chain) => {
          return {
            chain,
            client: await StargateClient.connect(chain.rpc),
          };
        })
      );

      setClients(_clients);
    })();
  }, [setClients]);

  const getClient = useCallback(
    (chainId: string) => {
      return clients.find((client) => client.chain.chainId === chainId);
    },
    [clients]
  );

  const providerValue = useMemo(() => {
    return {
      clients,
      getClient,
    };
  }, [clients, getClient]);

  return (
    <ClientContext.Provider value={providerValue}>
      {children}
    </ClientContext.Provider>
  );
};
