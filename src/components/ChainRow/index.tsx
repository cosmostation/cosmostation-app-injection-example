import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { IChain } from "../../constants/chains";
import styles from "./index.module.scss";
import useCosmJS from "../../hooks/useCosmJS";
import useCosmostation from "../../hooks/useCosmostation";

interface IChainRowProps {
  chain: IChain;
}

interface IAccount extends IChain {
  address: string;
}

const ChainRow: React.FC<IChainRowProps> = ({ chain }) => {
  const { getAccount } = useCosmostation();
  const { getBalance, sendTokens } = useCosmJS();

  const [account, setAccount] = useState<IAccount | null>(null);
  const [balance, setBalance] = useState<Coin | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [txError, setTxError] = useState("");

  const updateBalance = useCallback(
    async (address: string) => {
      try {
        const balance = await getBalance(chain.chainId, address, chain.denom);

        setBalance(balance);
      } finally {
        setIsLoading(false);
      }
    },
    [chain, getBalance]
  );

  const fetchAccounts = useCallback(async () => {
    try {
      const account = await getAccount(chain.chainId);
      if (account) {
        await updateBalance(account.address);

        setAccount({
          ...chain,
          address: account.address,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [chain, getAccount, setIsLoading, updateBalance]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const _balance = useMemo(() => {
    if (isNaN(Number(balance?.amount))) {
      return 0;
    }

    return Number(balance?.amount) / 10 ** (account?.decimals || 0);
  }, [account, balance]);

  const sendToken = useCallback(async () => {
    if (!account) {
      alert("Fail to sendToken");
      return;
    }

    if (isProcessing) {
      return;
    }

    try {
      setIsProcessing(true);

      setTxHash("");
      setTxError("");

      const response = await sendTokens(
        chain.chainId,
        account.address,
        account.address,
        [{ denom: account.denom, amount: "1" }],
        "auto",
        "Memo of sendTokens"
      );

      if (response) {
        setTxHash(response.transactionHash);

        if (Number(response.code) !== 0) {
          setTxError(`Fail: ${response.code}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      updateBalance(account.address);
    }
  }, [chain, account, isProcessing, sendTokens, updateBalance]);

  return (
    <div className={styles.container}>
      {isLoading && "Loading..."}
      {!isLoading && (
        <>
          <div className={styles.hStack}>
            <div className={styles.label}>Transfer With</div>
            <div className={styles.label}>{chain.path}</div>
          </div>
          <div className={styles.row}>
            <div className={styles.transferWith}>
              {account?.symbol.toUpperCase()}
              <i>from</i>
              <span>{account?.network}</span>
            </div>
          </div>
          <div className={styles.label}>You Transfer</div>
          <div className={styles.row}>
            <div>0.000001</div>
            <div className={styles.symbol}>{account?.symbol.toUpperCase()}</div>
          </div>
          <div className={styles.label}>
            You have
            <span className={styles.amount}>
              {_balance} {account?.symbol.toUpperCase()}
            </span>
            in your balance
          </div>
          {!!txHash && (
            <div>
              <a
                href={`https://www.mintscan.io/${chain.network}/tx/${txHash}`}
                target="_blank"
                className={styles.txHash}
              >
                {txHash.slice(0, 12)}...{txHash.slice(-12)}
              </a>
            </div>
          )}
          {!!txError && <div className={styles.txError}>{txHash}</div>}
          <div
            className={
              isProcessing || _balance <= 0 ? styles.disabled : styles.submit
            }
            onClick={sendToken}
          >
            {isProcessing ? "Sending..." : "Transfer"}
          </div>
        </>
      )}
    </div>
  );
};

export default ChainRow;
