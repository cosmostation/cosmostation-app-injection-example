import React, { useEffect, useMemo, useState } from "react";

import styles from "./index.module.scss";
import { useEthereumWallets } from "../../../hooks/useEthereumWallets";
import WalletButton from "../../UI/WalletButton";
import useUserAgent from "../../../hooks/useUserAgent";

const VanillaEthereumConnect: React.FC = () => {
  const { isMobile } = useUserAgent();

  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
  const [userAccount, setUserAccount] = useState<string>("");
  const connectableWallets = useEthereumWallets();

  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isProcessingSignMessage, setIsProcessingSignMessage] = useState(false);

  const isConnectedWallet = useMemo(
    () => !!selectedWallet && !!userAccount,
    [selectedWallet, userAccount]
  );

  const [signature, setSignature] = useState("");

  const connectWallet = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      setIsConnectingWallet(true);

      const accounts: string[] | undefined = (await providerWithInfo.provider
        .request({ method: "eth_requestAccounts" })
        .catch(console.error)) as string[] | undefined;

      if (accounts?.[0]) {
        setSelectedWallet(providerWithInfo);
        setUserAccount(accounts?.[0]);
      }
    } catch (error) {
      console.log("🚀 ~ handleConnect ~ error:", error);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const signMessage = async (msg: string) => {
    if (!selectedWallet) {
      throw new Error("No selected wallet");
    }

    // TODO 앱에서 개발모드로 진입시 이게 무조건 필요함. 이거 없으면 앱에서는 작동안함.
    if (isMobile) {
      await selectedWallet.provider.request({
        method: "eth_chainId",
      });

      await selectedWallet.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      });
    }

    const signature = (await selectedWallet.provider
      .request({ method: "personal_sign", params: [msg, userAccount] })
      .catch(console.error)) as string;

    return signature;
  };

  useEffect(() => {
    if (isMobile) {
      connectWallet(connectableWallets[0]);
    }
  }, [connectableWallets, isMobile]);

  if (!connectableWallets) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Connect ETH Wallets with Vanilla codes</h2>
        <div>No Wallets To Connect Wallet</div>;
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.contentsContainer}>
          <h3 className={styles.title}>Choose your Wallet</h3>

          <div className={styles.walletButtonContainer}>
            {connectableWallets.length > 0 ? (
              connectableWallets?.map((provider: EIP6963ProviderDetail) => (
                <WalletButton
                  walletImage={provider.info.icon}
                  walletName={provider.info.name}
                  key={provider.info.uuid}
                  onClick={() => {
                    setSignature("");

                    connectWallet(provider);
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
                    src={selectedWallet!.info.icon}
                    alt={selectedWallet!.info.name}
                  />
                  <div className={styles.walletName}>
                    {selectedWallet!.info.name}
                  </div>
                </div>
                <div className={styles.workBreak}>{userAccount}</div>
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
              setSelectedWallet(undefined);
            }}
          >
            <h4>Disconnect</h4>
          </button>
        </div>

        <div className={styles.contentsContainer}>
          <h3>Sign Message</h3>
          <div>
            <div className={styles.workBreak}>
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
                  setIsProcessingSignMessage(true);

                  const signature = await signMessage(
                    "Example `personal_sign` message"
                  );

                  setSignature(signature);
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
      </div>
    </>
  );
};

export default VanillaEthereumConnect;
