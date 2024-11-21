import React, { useState } from "react";

import styles from "./index.module.scss";
import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect,
  useSignMessage,
} from "wagmi";
import BrowserWalletImg from "../../../assets/images/wallet.png";

// NOTE 로컬호스트로 접근했을때, 웹,앱 정상 동작, 로컬네트워크로 접근했을때, 웹 몇몇 지갑 리스팅X, 앱또한 마찬가지

const Wagmi: React.FC = () => {
  const { address } = useAccount();
  const { connectors, connect, isPending, isSuccess } = useConnect();
  const { disconnect } = useDisconnect();

  const [selectedConnector, setselectedConnector] = useState<Connector>();
  const [signature, setSignature] = useState("");

  // 지갑 관련 api훅들은 아래의 docs에서 확인 가능
  // https://wagmi.sh/react/api/hooks
  const { signMessageAsync } = useSignMessage();

  return (
    <div className={styles.container}>
      <h2>Wagmi</h2>
      <div>
        {connectors.map((connector) => {
          const isInjectedWallet = connector.name === "Injected";

          const name = isInjectedWallet ? "Browser Wallet" : connector.name;

          const image = isInjectedWallet ? BrowserWalletImg : connector.icon;

          return (
            <button
              className={styles.walletLogoButton}
              key={connector.uid}
              onClick={async () => {
                connect(
                  { connector },
                  {
                    onSuccess: () => {
                      setselectedConnector(connector);
                    },
                  }
                );
              }}
            >
              <img src={image} />
              <div>{name}</div>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => {
          disconnect();
        }}
      >
        disconnect
      </button>
      <h2>Current address</h2>

      <h3>Current Connected Wallet</h3>
      {isPending ? (
        <div>Connecting...</div>
      ) : isSuccess ? (
        <div>
          <div>
            <img src={selectedConnector?.icon} />
            <div>{selectedConnector?.name}</div>
            <div>({address})</div>
          </div>
        </div>
      ) : (
        <div>Not Connected</div>
      )}

      <button
        onClick={async () => {
          try {
            const signature = await signMessageAsync({
              message: "Example `personal_sign` message",
            });

            setSignature(signature);
          } catch (error) {
            console.log("🚀 ~ error:", error);
          }
        }}
      >
        Sign Message with Wagmi
      </button>
      <div>
        <h3>{signature || "No Signature"}</h3>
      </div>
    </div>
  );
};

export default Wagmi;
