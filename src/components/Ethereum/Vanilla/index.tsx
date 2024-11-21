import React, { useMemo, useState } from "react";

import styles from "./index.module.scss";
import { useEthereumWallets } from "../../../hooks/useEthereumWallets";

const VanillaEthereumConnect: React.FC = () => {
  const [selectedWallet, setSelectedWallet] = useState<EIP6963ProviderDetail>();
  const [userAccount, setUserAccount] = useState<string>("");
  const connectableWallets = useEthereumWallets();

  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  const isConnectedWallet = useMemo(
    () => !!selectedWallet && !!userAccount,
    [selectedWallet, userAccount]
  );

  const [signature, setsignature] = useState("");

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

  // FIXME Cancel이라는 에러 메시지와 함꼐 작동 안됨.
  const signMessageWithEVMWallet = async (msg: string) => {
    if (!selectedWallet) {
      alert("No selected wallet");
      throw new Error("No selected wallet");
    }

    // TODO 앱에서 개발모드로 진입시 이게 무조건 필요함. 이거 없으면 앱에서는 작동안함.
    await selectedWallet.provider.request({
      method: "eth_chainId",
    });

    // TODO 앱에서 개발모드로 진입시 이게 무조건 필요함. 이거 없으면 앱에서는 작동안함.
    await selectedWallet.provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x1" }],
    });

    const signature = (await selectedWallet.provider
      .request({ method: "personal_sign", params: [msg, userAccount] })
      .catch(console.error)) as string;

    return signature;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Connect ETH Wallets with Vanilla codes</h2>
      <div className={styles.walletButtonContainer}>
        {connectableWallets.length > 0 ? (
          connectableWallets?.map((provider: EIP6963ProviderDetail) => (
            <button
              className={styles.walletLogoButton}
              key={provider.info.uuid}
              onClick={() => {
                connectWallet(provider);
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
      {isConnectingWallet ? (
        <div>Connecting...</div>
      ) : isConnectedWallet ? (
        <div>
          <div>
            <img
              src={selectedWallet!.info.icon}
              alt={selectedWallet!.info.name}
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
            const signature = await signMessageWithEVMWallet(
              "Example `personal_sign` message"
            );
            setsignature(signature);
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
          setSelectedWallet(undefined);
        }}
      >
        disconnect
      </button>
    </div>
  );
};

export default VanillaEthereumConnect;
