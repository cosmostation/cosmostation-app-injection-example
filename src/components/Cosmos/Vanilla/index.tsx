import React, { useEffect, useMemo, useState } from "react";

import styles from "./index.module.scss";
import useCosmosWalletsWithVanilla from "../../../hooks/useCosmosWalletsWithVanilla";
import chains from "../../../constants/chains";
import useUserAgent from "../../../hooks/useUserAgent";
import WalletButton from "../../UI/WalletButton";
import { Coin } from "@cosmjs/proto-signing";

const VanillaCosmosConnect: React.FC = () => {
  const {
    selectedWallet,
    cosmosWallets,
    userAccount,
    connectWallet,
    disconnectWallet,
    signMessage,
    getBalance,
    sendTokens,
  } = useCosmosWalletsWithVanilla();
  const { isMobile } = useUserAgent();
  const chain = chains[0];

  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isProcessingSignMessage, setIsProcessingSignMessage] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [isProcessingSendToken, setIsProcessingSendToken] = useState(false);

  const isConnectedWallet = useMemo(() => !!selectedWallet, [selectedWallet]);

  const [signature, setsignature] = useState("");
  const [txHash, setTxHash] = useState("");
  const [balance, setBalance] = useState<Coin>();

  const handleWalletConnect = async (walletId: string, chainId: string) => {
    try {
      setIsConnectingWallet(true);

      await connectWallet(walletId, chainId);
    } catch (error) {
      console.error("🚀 ~ error:", error);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const resetWallet = () => {
    setsignature("");
  };

  useEffect(() => {
    (async () => {
      if (isMobile) {
        await handleWalletConnect(cosmosWallets[0].id, chain.chainId);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  return (
    <>
      <div className={styles.notice}>
        <p>
          This page is a sample dApp that allows users to transfer tokens to
          their wallet. It was designed for developers building dApps with the{" "}
          <b>Cosmostation App Wallet</b> or <b>Extension Wallet</b>.
        </p>
        <p>
          <a
            className={styles.link}
            href="https://github.com/cosmostation/cosmostation-app-injection-example"
            target="_blank"
          >
            Click here
          </a>
          &nbsp;to view the complete code.
        </p>
      </div>

      <div className={styles.container}>
        <div className={styles.contentsContainer}>
          <h3 className={styles.title}>Choose your Wallet</h3>

          <div className={styles.walletButtonContainer}>
            {cosmosWallets.length > 0 ? (
              cosmosWallets?.map((wallet) => (
                <WalletButton
                  walletImage={wallet.icon}
                  walletName={wallet.name}
                  key={wallet.id}
                  onClick={async () => {
                    resetWallet();

                    await handleWalletConnect(wallet.id, chain.chainId);
                  }}
                />
              ))
            ) : (
              <div>No Announced Wallet Providers</div>
            )}
          </div>
        </div>

        <div className={styles.contentsContainer}>
          <h3 className={styles.title}>Current Connected Wallet</h3>

          <div className={styles.connectedWalletContainer}>
            {isConnectingWallet ? (
              <div>Connecting...</div>
            ) : isConnectedWallet ? (
              <div className={styles.contents}>
                <div className={styles.connectedWallet}>
                  <img
                    className={styles.connectedWalletImage}
                    src={selectedWallet?.icon}
                  />
                  <div className={styles.walletName}>
                    {selectedWallet?.name}
                  </div>
                </div>
                <div className={styles.address}>
                  {userAccount?.bech32Address}
                </div>
                <div className={styles.address}>{userAccount?.name}</div>
              </div>
            ) : (
              <div className={styles.contents}>
                <h4>Not Connected</h4>
              </div>
            )}
          </div>

          <button
            className={styles.baseButton}
            disabled={!isConnectedWallet}
            onClick={() => {
              disconnectWallet();
            }}
          >
            <h4>Disconnect</h4>
          </button>
        </div>

        <div className={styles.contentsContainer}>
          <h3>Sign Message</h3>
          <div>
            <div className={styles.address}>
              {isProcessingSignMessage
                ? "Processing..."
                : signature || "No Signature"}
            </div>
          </div>
          <div>
            <button
              className={styles.baseButton}
              disabled={!isConnectedWallet || isProcessingSignMessage}
              onClick={async () => {
                try {
                  if (!userAccount) {
                    throw new Error("No Account");
                  }

                  setIsProcessingSignMessage(true);

                  const signature = await signMessage(
                    chain.chainId,
                    userAccount.bech32Address,
                    "Example `personal_sign` message"
                  );

                  if (!signature) {
                    throw new Error("No Signature");
                  }

                  setsignature(signature.signature);
                } catch (error) {
                  console.error("🚀 ~ error:", error);
                } finally {
                  setIsProcessingSignMessage(false);
                }
              }}
            >
              Sign Message
            </button>
          </div>
        </div>

        <div className={styles.contentsContainer}>
          <h3>Balance</h3>
          <div>
            {isFetchingBalance
              ? "Fetching Balance..."
              : balance
              ? `${balance.amount} ${chain.denom}`
              : "No Balance"}
          </div>
          <div>
            <button
              className={styles.baseButton}
              disabled={!isConnectedWallet || isFetchingBalance}
              onClick={async () => {
                try {
                  if (!userAccount) {
                    throw new Error("No Account");
                  }
                  setIsFetchingBalance(true);

                  const response = await getBalance(
                    chain.chainId,
                    userAccount.bech32Address,
                    chain.denom
                  );

                  if (!response) {
                    throw new Error("No Balance");
                  }

                  setBalance(response);
                } catch (error) {
                  console.error("🚀 ~ error:", error);
                } finally {
                  setIsFetchingBalance(false);
                }
              }}
            >
              Get Balance
            </button>
          </div>
        </div>

        <div className={styles.contentsContainer}>
          <h3>Call Send Sign</h3>
          <div>
            <div className={styles.address}>
              {isProcessingSendToken ? "Processing..." : txHash || "No TxHash"}
            </div>
          </div>
          <div>
            <button
              className={styles.baseButton}
              disabled={!isConnectedWallet || isProcessingSendToken}
              onClick={async () => {
                try {
                  if (!userAccount) {
                    throw new Error("No Account");
                  }

                  setIsProcessingSendToken(true);

                  const response = await sendTokens(
                    chain.chainId,
                    userAccount.bech32Address,
                    userAccount.bech32Address,
                    [{ denom: chain.denom, amount: "1" }],
                    "auto",
                    "Memo of sendTokens"
                  );

                  setTxHash(response.transactionHash);
                } catch (error) {
                  console.error("🚀 ~ error:", error);
                } finally {
                  setIsProcessingSendToken(false);
                }
              }}
            >
              Send Token
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VanillaCosmosConnect;
