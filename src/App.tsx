import React, { useCallback, useState } from "react";

import styles from "./App.module.scss";
import useCosmostation from "./hooks/useCosmostation";
import useUserAgent from "./hooks/useUserAgent";
import VanillaEthereumConnect from "./components/Ethereum/Vanilla";
import Wagmi from "./components/Ethereum/Wagmi";
import VanillaCosmosConnect from "./components/Cosmos/Vanilla";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./wagmi/config";
import { WagmiProvider } from "wagmi";
import CosmostationWalletsPkg from "./components/Cosmos/CosmostationWalletsPkg";
import { CosmosProvider } from "@cosmostation/use-wallets";
import EthereumImage from "./assets/images/ethereum.png";
import CosmosImage from "./assets/images/cosmos.png";

// NOTE 로컬호스트로 접근했을때, 웹,앱 정상 동작, 로컬네트워크로 접근했을때, 웹 몇몇 지갑 리스팅X, 앱또한 마찬가지
const queryClient = new QueryClient();

const connectType = {
  "eip-6963": "eip-6963",
  wagmi: "wagmi",
  "vanilla-cosmos": "vanilla-cosmos",
  "@cosmostation/wallets": "@cosmostation/wallets",
} as const;

type ConnectType = (typeof connectType)[keyof typeof connectType];

// TODO 디자인 작업
const App: React.FC = () => {
  const { isInstalled, downloadUrl } = useCosmostation();
  const { isMobile, isAndroid, isiOS } = useUserAgent();

  const [activeType, setActiveType] = useState<ConnectType>(
    connectType["eip-6963"]
  );

  const onLaunchApp = useCallback(
    (url: string) => {
      if (isiOS) {
        window.location.href = `cosmostation://dapp?url=${url}`;

        setTimeout(() => {
          if (downloadUrl) {
            window.location.href = downloadUrl;
          }
        }, 3000);
      } else if (isAndroid) {
        window.location.href = `intent://dapp?${url}#Intent;scheme=cosmostation;end`;
      }
    },
    [downloadUrl, isAndroid, isiOS]
  );

  return (
    // TODO 설치여부, ua에 따라 분기처리 필요.
    <div className={styles.container}>
      <h3>Connect Wallet With EIP-6963</h3>

      <div className={styles.connectTypeButtonWrapper}>
        <div className={styles.chainCategory}>
          <div className={styles.chain}>
            <img src={EthereumImage} />
            <h6>Ethereum networks</h6>
          </div>
          <div className={styles.connectTypeButtonContainer}>
            <button
              className={`${styles.connectTypeButton} ${
                activeType === connectType["eip-6963"] ? styles.active : ""
              }`}
              onClick={() => setActiveType(connectType["eip-6963"])}
            >
              <h3>
                use
                <br />
                EIP-6963
              </h3>
            </button>
            <button
              className={`${styles.connectTypeButton} ${
                activeType === connectType["wagmi"] ? styles.active : ""
              }`}
              onClick={() => setActiveType(connectType["wagmi"])}
            >
              <h3>
                use
                <br />
                Wagmi
              </h3>
            </button>
          </div>
        </div>

        <div className={styles.divier} />

        <div className={styles.chainCategory}>
          <div className={styles.chain}>
            <img src={CosmosImage} />
            <h6>Cosmos networks</h6>
          </div>
          <div className={styles.connectTypeButtonContainer}>
            <button
              className={`${styles.connectTypeButton} ${
                activeType === connectType["vanilla-cosmos"]
                  ? styles.active
                  : ""
              }`}
              onClick={() => setActiveType(connectType["vanilla-cosmos"])}
            >
              <h3>
                use
                <br />
                Vanilla
              </h3>
            </button>
            <button
              className={`${styles.connectTypeButton} ${
                activeType === connectType["@cosmostation/wallets"]
                  ? styles.active
                  : ""
              }`}
              onClick={() =>
                setActiveType(connectType["@cosmostation/wallets"])
              }
            >
              <h3>
                use
                <br />
                wallets pkg
              </h3>
            </button>
          </div>
        </div>
      </div>

      {activeType === connectType["eip-6963"] && <VanillaEthereumConnect />}
      {activeType === connectType["wagmi"] && (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <Wagmi />
          </QueryClientProvider>
        </WagmiProvider>
      )}
      {activeType === connectType["vanilla-cosmos"] && <VanillaCosmosConnect />}
      {activeType === connectType["@cosmostation/wallets"] && (
        <CosmosProvider>
          <CosmostationWalletsPkg />
        </CosmosProvider>
      )}

      {isInstalled && (
        <>
          <h2 className={styles.title}>Cosmos Wallets</h2>
          <div className={styles.notice}>
            <p>
              This page is a sample dApp that allows users to transfer tokens to
              their wallet. It was designed for developers building dApps with
              the <b>Cosmostation App Wallet</b> or <b>Extension Wallet</b>.
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
        </>
      )}
      {!isInstalled && !downloadUrl && (
        <div className={styles.warning}>
          <p>This client is not supported.</p>
          <p>
            Please access it using <i>Android / iOS</i> mobile devices or&nbsp;
            <i>Chrome / Firefox</i> on desktop.
          </p>
        </div>
      )}
      {!isInstalled && !!downloadUrl && isMobile && (
        <div className={styles.warning}>
          <p>
            This page is accessible via the Cosmostation App Wallet or desktop
            web page.
          </p>
          <p>
            <a
              href="#none"
              onClick={() => onLaunchApp(window.location.href)}
              className={styles.link}
            >
              Click here
            </a>
            &nbsp;to launch the dApp within the Cosmostation App Wallet.
          </p>
        </div>
      )}
      {!isInstalled && !!downloadUrl && !isMobile && (
        <div className={styles.warning}>
          <p>The Cosmostation Wallet Extension is missing.</p>
          <p>
            <a href={downloadUrl} className={styles.link} target="_blank">
              Click here
            </a>
            &nbsp;to install, then refresh the page to continue.
          </p>
        </div>
      )}
      {/* <Logger /> */}
    </div>
  );
};

export default App;
