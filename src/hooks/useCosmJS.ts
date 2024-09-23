import { Coin, StdFee } from "@cosmjs/stargate";
import { useCallback, useContext } from "react";

import { ClientContext } from "../providers/ClientProvider";

const useCosmJS = () => {
  const { getClient } = useContext(ClientContext);

  const getBalance = useCallback(
    async (
      chainId: string,
      address: string,
      denom: string
    ): Promise<Coin | null> => {
      const client = getClient(chainId);
      const balance = await client?.client.getBalance(address, denom);

      return balance || null;
    },
    [getClient]
  );

  const sendTokens = useCallback(
    async (
      chainId: string,
      from: string,
      to: string,
      amount: Coin[],
      fee: StdFee | "auto" | number,
      memo?: string
    ) => {
      const client = getClient(chainId);
      const response = await client?.client.sendTokens(
        from,
        to,
        amount,
        fee,
        memo
      );

      return response;
    },
    [getClient]
  );

  return {
    getBalance,
    sendTokens,
  };
};

export default useCosmJS;
