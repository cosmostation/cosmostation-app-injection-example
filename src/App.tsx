import React, { useCallback, useEffect, useState } from "react";

import { Coin } from "@cosmjs/stargate";
import chains from "./constants/chains";
import useCosmJS from "./hooks/useCosmJS";
import useCosmostation from "./hooks/useCosmostation";

interface Chain {
  network: string;
  denom: string;
  chainId: string;
}

interface Account extends Chain {
  address: string;
  balance: Coin | null;
}

const App: React.FC = () => {
  const { cosmos } = useCosmostation();
  const { getBalance } = useCosmJS();

  const [accounts, setAccounts] = useState<Account[]>([]);

  const fetchAccounts = useCallback(async () => {
    const _accounts = await Promise.all(
      chains.map(async (chain) => {
        const account = await cosmos.request<CosmosRequestAccount>({
          method: "cos_requestAccount",
          params: {
            chainName: chain.chainId,
          },
        });

        const balance = await getBalance(
          chain.chainId,
          account.address,
          chain.denom
        );

        return {
          network: chain.network,
          chainId: chain.chainId,
          address: account.address,
          denom: chain.denom,
          balance,
        } as Account;
      })
    );

    setAccounts(_accounts);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return (
    <div>
      {accounts.map((account) => {
        return (
          <div key={account.address}>
            {account.address} {account.balance?.amount}
          </div>
        );
      })}
    </div>
  );
};

export default App;
