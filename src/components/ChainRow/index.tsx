import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Coin } from "@cosmjs/stargate";
import { IChain } from "../../constants/chains";
import styles from "./index.module.scss";
import useCosmJS from "../../hooks/useCosmJS";
import useCosmostation from "../../hooks/useCosmostation";

interface IChainRowProps {
  chain: IChain;
}

interface IAccount extends IChain {
  address: string;
  balance: Coin | null;
}

const ChainRow: React.FC<IChainRowProps> = ({ chain }) => {
  const { getAccount } = useCosmostation();
  const { getBalance } = useCosmJS();

  const [account, setAccount] = useState<IAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    try {
      const account = await getAccount(chain.chainId);
      const balance = await getBalance(
        chain.chainId,
        account.address,
        chain.denom
      );

      setAccount({
        ...chain,
        address: account.address,
        balance,
      });
    } finally {
      setIsLoading(false);
    }
  }, [chain, getAccount, getBalance, setIsLoading]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const balance = useMemo(() => {
    return Number(account?.balance?.amount) / 10 ** (account?.decimals || 0);
  }, [account]);

  return (
    <div className={styles.container}>
      {isLoading && "Loading..."}
      {!isLoading && (
        <>
          <div className={styles.label}>Donate With</div>
          <div className={styles.row}>
            <div className={styles.donateWith}>
              {account?.symbol.toUpperCase()}
              <i>from</i>
              <span>{account?.network}</span>
            </div>
          </div>
          <div className={styles.label}>You Donate</div>
          <div className={styles.row}>
            <div>0.000001</div>
            <div className={styles.symbol}>{account?.symbol.toUpperCase()}</div>
          </div>
          <div className={styles.label}>
            You have
            <span className={styles.amount}>
              {balance} {account?.symbol.toUpperCase()}
            </span>
            in your balance
          </div>
        </>
      )}
    </div>
  );
};

export default ChainRow;
