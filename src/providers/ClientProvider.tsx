import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import chains, { IChain } from "../constants/chains";
import { createContext, useCallback, useEffect, useState } from "react";

import { OfflineSigner } from "@cosmjs/proto-signing";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import useCosmostation from "../hooks/useCosmostation";
import { toHexString } from "@cosmostation/wallets";

interface IClient {
  chain: IChain;
  client: SigningStargateClient;
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
  const { getAccount, signDirect } = useCosmostation();

  const getOfflineSigner = useCallback(
    async (chainId: string) => {
      const signer: OfflineSigner = {
        getAccounts: async () => {
          const account = await getAccount(chainId);

          if (!account) {
            throw Error("getAccount Failed");
          }

          console.log({
            address: account.address,
            pubkey: account.publicKey,
            algo: "secp256k1",
          });

          console.log(toHexString(account.publicKey));

          return [
            {
              address: account.address,
              pubkey: account.publicKey,
              algo: "secp256k1",
            },
          ];
        },
        signDirect: async (_, signDoc: SignDoc) => {
          const response = await signDirect(signDoc);

          if (!response) {
            throw Error("signDirect Failed");
          }

          console.log({
            signed: {
              accountNumber: response.signed_doc.account_number as never,
              chainId: response.signed_doc.chain_id,
              authInfoBytes: response.signed_doc.auth_info_bytes,
              bodyBytes: response.signed_doc.body_bytes,
            },
            signature: {
              pub_key: response.pub_key,
              signature: response.signature,
            },
          });

          return {
            signed: {
              accountNumber: response.signed_doc.account_number as never,
              chainId: response.signed_doc.chain_id,
              authInfoBytes: response.signed_doc.auth_info_bytes,
              bodyBytes: response.signed_doc.body_bytes,
            },
            signature: {
              pub_key: response.pub_key,
              signature: response.signature,
            },
          };
        },
      };
      return signer;
    },
    [getAccount, signDirect]
  );

  // TODO useEffect제거
  useEffect(() => {
    (async () => {
      const _clients = await Promise.all(
        chains.map(async (chain) => {
          const offlineSigner = await getOfflineSigner(chain.chainId);

          const client = await SigningStargateClient.connectWithSigner(
            chain.rpc,
            offlineSigner,
            { gasPrice: GasPrice.fromString(`0.025${chain.denom}`) }
          );

          return {
            chain,
            client,
          };
        })
      );

      setClients(_clients);
    })();
  }, [getOfflineSigner, setClients]);

  const getClient = useCallback(
    (chainId: string) => {
      return clients.find((client) => client.chain.chainId === chainId);
    },
    [clients]
  );

  return (
    <ClientContext.Provider value={{ clients, getClient }}>
      {children}
    </ClientContext.Provider>
  );
};
