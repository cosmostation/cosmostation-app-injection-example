import React, { useMemo, useState } from "react";

import styles from "./index.module.scss";
import useCosmosWalletsWithVanilla from "../../../hooks/useCosmosWalletsWithVanilla";
import { Key } from "@keplr-wallet/types";

const VanillaCosmosConnect: React.FC = () => {
  const {
    selectedWallet,
    cosmosWallets,
    connectWallet,
    disconnectWallet,
    getAccount,
    getMultipleAccounts,
    getOfflineSigner,
    signMessage,
  } = useCosmosWalletsWithVanilla();

  const [userAccount, setUserAccount] = useState<Key>();

  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isFetchingAccount, setIsFetchingAccount] = useState(false);

  const isConnectedWallet = useMemo(() => !!selectedWallet, [selectedWallet]);

  const [signature, setsignature] = useState("");

  const handleWalletConnect = async (walletId: string) => {
    try {
      setIsConnectingWallet(true);

      await connectWallet(walletId);
    } catch (error) {
      console.error("🚀 ~ error:", error);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleGetAccount = async () => {
    try {
      setIsFetchingAccount(true);

      const account = await getAccount("archway-1");

      if (!account) {
        throw new Error("No Address and PubKey");
      }

      setUserAccount(account);
    } catch (error) {
      console.log("🚀 ~ handleGetAccount ~ error:", error);
    } finally {
      setIsFetchingAccount(false);
    }
  };

  const resetWallet = () => {
    setUserAccount(undefined);
    setsignature("");
  };

  // TODO 모바일인 경우에는 useEffect로 바로 연결되도록 작업.

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Connect Cosmos Wallets with Vanilla codes
      </h2>
      <div className={styles.walletButtonContainer}>
        {cosmosWallets.length > 0 ? (
          cosmosWallets?.map((wallet) => (
            <button
              className={styles.walletLogoButton}
              key={wallet.id}
              onClick={async () => {
                resetWallet();

                await handleWalletConnect(wallet.id);
              }}
            >
              <img src={wallet.icon} />
              <div>{wallet.name}</div>
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
            <img src={selectedWallet!.icon} />
            <div>{selectedWallet!.name}</div>
          </div>
        </div>
      ) : (
        <div>Not Connected</div>
      )}
      <h3>Current Account</h3>
      {isFetchingAccount ? (
        <div>fethching...</div>
      ) : userAccount ? (
        <div>
          <div>
            <div>({userAccount.bech32Address})</div>
            <div>({userAccount.name})</div>
            <div>
              (
              {Array.from(userAccount.pubKey)
                .map((byte) => byte.toString(16).padStart(2, "0"))
                .join("")}
              )
            </div>
          </div>
        </div>
      ) : (
        <div>Not Fetched</div>
      )}
      <h3>Get Account</h3>
      <div>
        <button
          disabled={!isConnectedWallet}
          onClick={async () => {
            await handleGetAccount();
          }}
        >
          Get Account
        </button>
      </div>
      <h3>Sign Message with Connected Wallet</h3>
      <div>
        <button
          onClick={async () => {
            if (!userAccount) {
              throw new Error("No Account");
            }

            const signature = await signMessage(
              "archway-1",
              userAccount.bech32Address,
              "Example `personal_sign` message"
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
        onClick={() => {
          disconnectWallet();
        }}
      >
        disconnect
      </button>
      <button
        onClick={async () => {
          const response = await getMultipleAccounts([
            "archway-1",
            "cosmoshub-4",
          ]);
          console.log("🚀 ~ onClick={ ~ response:", response);
        }}
      >
        multiple accounts
      </button>
      <button
        onClick={async () => {
          const response = await getOfflineSigner("archway-1");

          console.log("🚀 ~ onClick={ ~ response:", response);

          const aaa = await response.getAccounts();

          console.log("🚀 ~ onClick={ ~ aaa:", aaa);
        }}
      >
        offline signer
      </button>
    </div>
  );
};

export default VanillaCosmosConnect;
