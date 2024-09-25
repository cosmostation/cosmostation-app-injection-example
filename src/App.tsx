import ChainRow from "./components/ChainRow";
import React from "react";
import chains from "./constants/chains";
import styles from "./App.module.scss";
import useCosmostation from "./hooks/useCosmostation";
import useUserAgent from "./hooks/useUserAgent";

const App: React.FC = () => {
  const { isInstalled, downloadUrl } = useCosmostation();
  const { isMobile } = useUserAgent();

  return (
    <div className={styles.container}>
      {isInstalled && (
        <>
          <h2 className={styles.title}>Make a Donation</h2>
          <div className={styles.notice}>
            <p>
              This page is a sample dApp that allows users to donate tokens to
              Cosmostation. It was designed for developers building dApps with
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
            <a href={downloadUrl} className={styles.link}>
              Click here
            </a>
            &nbsp;to install, then launch the dApp within the Cosmostation App
            Wallet.
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
