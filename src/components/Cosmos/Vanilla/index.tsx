import React, { useEffect, useMemo, useState } from "react";

import styles from "./index.module.scss";
import useCosmosWalletsWithVanilla from "../../../hooks/useCosmosWalletsWithVanilla";
import chains from "../../../constants/chains";
import useUserAgent from "../../../hooks/useUserAgent";
import { convertPubKeyToHex } from "./utils/pubKeyConverter";

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

  const isConnectedWallet = useMemo(() => !!selectedWallet, [selectedWallet]);

  const [signature, setsignature] = useState("");

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

                await handleWalletConnect(wallet.id, chain.chainId);
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
      {userAccount ? (
        <div>
          <div>
            <div>({userAccount.bech32Address})</div>
            <div>({userAccount.name})</div>
            <div>({convertPubKeyToHex(userAccount.pubKey)})</div>
          </div>
        </div>
      ) : (
        <div>Not Fetched</div>
      )}
      <h3>Sign Message with Connected Wallet</h3>
      <div>
        <button
          disabled={!isConnectedWallet}
          onClick={async () => {
            if (!userAccount) {
              throw new Error("No Account");
            }

            const signature = await signMessage(
              chain.chainId,
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
        disabled={!isConnectedWallet}
        onClick={() => {
          disconnectWallet();
        }}
      >
        disconnect
      </button>

      <h3>Send</h3>

      <button
        onClick={async () => {
          if (!userAccount) {
            throw new Error("No Account");
          }

          const balance = await getBalance(
            chain.chainId,
            userAccount.bech32Address,
            chain.denom
          );

          console.log("🚀 ~ <buttononClick={ ~ balance:", balance);
        }}
      >
        Get Balance
      </button>
      <button
        disabled={!isConnectedWallet}
        onClick={async () => {
          if (!userAccount) {
            throw new Error("No Account");
          }

          const response = await sendTokens(
            chain.chainId,
            userAccount.bech32Address,
            userAccount.bech32Address,
            [{ denom: chain.denom, amount: "1" }],
            "auto",
            "Memo of sendTokens"
          );
          console.log(response.transactionHash);
        }}
      >
        Send Token
      </button>
    </div>
  );
};

export default VanillaCosmosConnect;
