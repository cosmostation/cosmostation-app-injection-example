import React, { useEffect, useMemo, useState } from "react";

import styles from "./index.module.scss";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
  useSwitchChain,
} from "wagmi";
import BrowserWalletImg from "../../../assets/images/wallet.png";
import WalletButton from "../../UI/WalletButton";
import useUserAgent from "../../../hooks/useUserAgent";

const Wagmi: React.FC = () => {
  const {
    address,
    connector: selectedConnector,
    isConnected,
    isConnecting,
    isDisconnected,
  } = useAccount();
  const { isMobile } = useUserAgent();

  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();

  const [signature, setSignature] = useState("");
  const [isProcessingSignMessage, setIsProcessingSignMessage] = useState(false);

  const customedSelectedConnector = useMemo(() => {
    const isInjectedWallet = selectedConnector?.name === "Injected";

    const name = isInjectedWallet ? "Browser Wallet" : selectedConnector?.name;

    const icon = isInjectedWallet
      ? BrowserWalletImg
      : selectedConnector?.icon || "";

    return {
      ...selectedConnector,
      name,
      icon,
    };
  }, [selectedConnector]);

  // 지갑 관련 api훅들은 아래의 docs에서 확인 가능
  // https://wagmi.sh/react/api/hooks
  const { signMessageAsync } = useSignMessage();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isMobile) {
      connectAsync({
        connector: connectors[0],
      });
    }
  }, [connectAsync, connectors, isMobile]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.contentsContainer}>
          <h3 className={styles.title}>Choose your Wallet</h3>

          <div className={styles.walletButtonContainer}>
            {connectors.length > 0 ? (
              connectors?.map((connector) => {
                const isInjectedWallet = connector.name === "Injected";

                const name = isInjectedWallet
                  ? "Browser Wallet"
                  : connector.name;

                const image = isInjectedWallet
                  ? BrowserWalletImg
                  : connector.icon || "";

                return (
                  <WalletButton
                    walletImage={image}
                    walletName={name}
                    key={connector.uid}
                    onClick={async () => {
                      setSignature("");

                      await connectAsync(
                        { connector },
                        {
                          onError: (error) => {
                            console.error("🚀 ~ onClick={ ~ error:", error);
                          },
                        }
                      );
                    }}
                  />
                );
              })
            ) : (
              <div>No Announced Wallet Providers</div>
            )}
          </div>
        </div>

        <div className={styles.contentsContainer}>
          <h3 className={styles.title}>Current Connected Wallet</h3>

          <div className={styles.connectedWalletContainer}>
            {isConnecting ? (
              <div>Connecting...</div>
            ) : isConnected ? (
              <div className={styles.contents}>
                <div className={styles.connectedWallet}>
                  <img
                    className={styles.connectedWalletImage}
                    src={customedSelectedConnector?.icon}
                  />
                  <div className={styles.walletName}>
                    {customedSelectedConnector?.name}
                  </div>
                </div>
                <div className={styles.workBreak}>{address}</div>
              </div>
            ) : isDisconnected ? (
              <div className={styles.contents}>
                <h4>Not Connected</h4>
              </div>
            ) : null}
          </div>

          <button
            className={styles.baseButton}
            disabled={!isConnected}
            onClick={() => {
              disconnect();
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
              disabled={!isConnected || isProcessingSignMessage}
              onClick={async () => {
                try {
                  setIsProcessingSignMessage(true);

                  if (isMobile) {
                    await switchChain({ chainId: 1 });
                  }

                  const signature = await signMessageAsync({
                    message: "Example `personal_sign` message",
                  });

                  setSignature(signature);
                } catch (error) {
                  console.log("🚀 ~ error:", error);
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

export default Wagmi;
