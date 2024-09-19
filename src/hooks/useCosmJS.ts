import { useCallback, useContext } from "react";

import { ClientContext } from "../providers/ClientProvider";
import { Coin } from "@cosmjs/stargate";

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

  return {
    getBalance,
  };
};

export default useCosmJS;
