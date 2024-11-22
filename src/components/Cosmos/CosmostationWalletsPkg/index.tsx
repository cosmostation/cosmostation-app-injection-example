import React, { useEffect, useMemo, useState } from "react";

import styles from "./index.module.scss";
import { registerKeplrWallet } from "./utils/register";
import { useCosmosAccount, useCosmosWallets } from "@cosmostation/use-wallets";

const CosmostationWalletsPkg: React.FC = () => {
  const chainId = "cosmoshub-4";

  const { cosmosWallets, currentWallet, selectWallet, closeWallet } =
    useCosmosWallets();
  const { data: account } = useCosmosAccount(chainId);

  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const isConnectedWallet = useMemo(() => !!currentWallet, [currentWallet]);

  const [signature, setsignature] = useState("");

  useEffect(() => {
    registerKeplrWallet();
  }, []);

  // TODO 모바일인 경우에는 useEffect로 바로 연결되도록 작업.

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Connect Cosmos Wallets with @cosmostation/wallets
      </h2>
      <div className={styles.walletButtonContainer}>
        {cosmosWallets.length > 0 ? (
          cosmosWallets?.map((wallet) => (
            <button
              className={styles.walletLogoButton}
              key={wallet.id}
              onClick={async () => {
                try {
                  setIsConnectingWallet(true);

                  selectWallet(wallet.id);
                } catch (error) {
                  console.log("🚀 ~ onClick={ ~ error:", error);
                } finally {
                  setIsConnectingWallet(false);
                }
              }}
            >
              <img src={wallet.logo} alt={wallet.name} width={40} height={40} />{" "}
              {wallet.name}
            </button>
          ))
        ) : (
          <div>No Announced Wallet Providers</div>
        )}
      </div>
      <h3>Current Connected Wallet</h3>
      {isConnectingWallet ? (
        <div>Connecting...</div>
      ) : isConnectedWallet ? (
        <div>
          <div>
            <img src={currentWallet?.logo} />
            <div>{currentWallet?.name}</div>
          </div>
        </div>
      ) : (
        <div>Not Connected</div>
      )}
      <h3>Current Account</h3>
      {account ? (
        <div>
          <div>
            <div>({account.account.address})</div>
            <div>({account.account.name})</div>
          </div>
        </div>
      ) : (
        <div>Not Fetched</div>
      )}
      <h3>Sign Message with Connected Wallet</h3>
      <div>
        <button
          onClick={async () => {
            if (!currentWallet) {
              throw new Error("No Account");
            }

            if (!account) {
              throw new Error("No Account");
            }

            if (!currentWallet.methods.signMessage) {
              throw new Error("No signMessage method");
            }

            const message = "Example `signMessage` message";

            const signature = await currentWallet.methods.signMessage(
              chainId,
              message,
              account.account.address
            );
            if (!signature) {
              throw new Error("No Signature");
            }

            setsignature(signature.signature);
          }}
        >
          Sign Message with with Vanilla code
        </button>
      </div>
      <div>
        <h3>{signature || "No Signature"}</h3>
      </div>
      <button
        onClick={async () => {
          if (currentWallet) {
            closeWallet();
          }
        }}
      >
        disconnect
      </button>
    </div>
  );
};

export default CosmostationWalletsPkg;
