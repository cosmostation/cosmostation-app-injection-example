import React, { useCallback, useMemo, useState } from "react";

import ChainRow from "./components/ChainRow";
import chains from "./constants/chains";
import styles from "./App.module.scss";
import useCosmostation from "./hooks/useCosmostation";
import useUserAgent from "./hooks/useUserAgent";
import { useEthereumWallets } from "./hooks/useEthereumWallets";

// NOTE 로컬호스트로 접근했을때, 웹,앱 정상 동작, 로컬네트워크로 접근했을때, 웹 몇몇 지갑 리스팅X, 앱또한 마찬가지

// TODO 디자인 작업
const App: React.FC = () => {
  const { isInstalled, downloadUrl } = useCosmostation();
  const { isMobile, isAndroid, isiOS } = useUserAgent();

  // NOTE 이 부분 아예 컴포넌트로 쪼개버려서 보기 편하게 만들기.
  const [
    isConnectingEVMWalletWithVanilla,
    setIsConnectingEVMWalletWithVanilla,
  ] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
  const [userAccount, setUserAccount] = useState<string>("");
  const providers = useEthereumWallets();

  const isConnectedEVMWalletWithVanilla = useMemo(
    () => !!selectedWallet && !!userAccount,
    [selectedWallet, userAccount]
  );

  const [signature, setsignature] = useState("");

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

  const connectEVMWalletWithVanilla = async (
    providerWithInfo: EIP6963ProviderDetail
  ) => {
    try {
      setIsConnectingEVMWalletWithVanilla(true);
      const accounts: string[] | undefined = (await providerWithInfo.provider
        .request({ method: "eth_requestAccounts" })
        .catch(console.error)) as string[] | undefined;

      console.log("🚀 ~ accounts:", accounts);

      if (accounts?.[0]) {
        setSelectedWallet(providerWithInfo);
        setUserAccount(accounts?.[0]);
      }
      setIsConnectingEVMWalletWithVanilla(false);
    } catch (error) {
      console.log("🚀 ~ handleConnect ~ error:", error);
    } finally {
      setIsConnectingEVMWalletWithVanilla(false);
    }
  };

  // FIXME Cancel이라는 에러 메시지와 함꼐 작동 안됨.
  const signMessageWithEVMWallet = async (msg: string) => {
    if (!selectedWallet) {
      alert("No selected wallet");
      throw new Error("No selected wallet");
    }

    // TODO 이게 무조건 필요함. 이거 없으면 앱에서는 작동안함.
    const aaa = await selectedWallet.provider.request({
      method: "eth_chainId",
    });

    console.log("🚀 ~ signMessageWithEVMWal ~ aaa:", aaa);

    const signature = (await selectedWallet.provider
      .request({ method: "personal_sign", params: [msg, userAccount] })

      .catch(console.error)) as string;

    return signature;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Connect ETH Wallets with Vanilla codes</h2>
      <div className={styles.walletButtonContainer}>
        {providers.length > 0 ? (
          providers?.map((provider: EIP6963ProviderDetail) => (
            <button
              className={styles.walletLogoButton}
              key={provider.info.uuid}
              onClick={() => {
                connectEVMWalletWithVanilla(provider);
              }}
            >
              <img src={provider.info.icon} alt={provider.info.name} />
              <div>{provider.info.name}</div>
            </button>
          ))
        ) : (
          <div>No Announced Wallet Providers</div>
        )}
      </div>
      <h3>Current Connected Wallet</h3>
      {isConnectingEVMWalletWithVanilla ? (
        <div>Connecting...</div>
      ) : isConnectedEVMWalletWithVanilla ? (
        <div>
          <div>
            <img
              src={selectedWallet!.info.icon}
              alt={selectedWallet!.info.name}
              style={{ width: "1px", height: "1px" }}
            />
            <div>{selectedWallet!.info.name}</div>
            <div>({userAccount})</div>
          </div>
        </div>
      ) : (
        <div>Not Connected</div>
      )}

      <h3>Sign Message with Connected Wallet</h3>
      <div>
        <button
          onClick={async () => {
            const signature = await signMessageWithEVMWallet("Hello World");
            setsignature(signature);
          }}
        >
          Sign Message
        </button>
      </div>
      <div>
        <h3>{signature || "No Signature"}</h3>
      </div>
      <div>---------------------------------</div>
      {isInstalled && (
        <>
          <h2 className={styles.title}>Cosmos Wallets</h2>
          {/* <Popover
            triggerContent={<span>Connect Wallet with Vanilla code</span>}
            popoverContent={
              <div className={styles.walletButtonContainer}>
                {providers.length > 0 ? (
                  providers?.map((provider: EIP6963ProviderDetail) => (
                    <button
                      className={styles.walletLogoButton}
                      key={provider.info.uuid}
                      onClick={() => {
                        connectEVMWalletWithVanilla(provider);
                        
                      }}
                    >
                      <img src={provider.info.icon} alt={provider.info.name} />
                      <div>{provider.info.name}</div>
                    </button>
                  ))
                ) : (
                  <div>No Announced Wallet Providers</div>
                )}
              </div>
            }
          /> */}

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
          <div className={styles.body}>
            {chains.map((chain) => {
              return <ChainRow key={chain.chainId} chain={chain} />;
            })}
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
    </div>
  );
};

export default App;
