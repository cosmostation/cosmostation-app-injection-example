import chains, { IChain } from "../constants/chains";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { StargateClient } from "@cosmjs/stargate";

interface IClient {
  chain: IChain;
  client: StargateClient;
}

interface IClientProvider {
  clients: IClient[];
  getClient: (chainId: string) => IClient | undefined;
}

export const ClientContext = createContext<IClientProvider>({
  clients: [],
  getClient: () => undefined,
});

export const ClientProvider: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const [clients, setClients] = useState<IClient[]>([]);

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
