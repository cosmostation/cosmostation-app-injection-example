import React, { useCallback, useEffect, useMemo, useState } from "react";

import styles from "./index.module.scss";
import { registerKeplrWallet } from "./utils/register";
import { useCosmosAccount, useCosmosWallets } from "@cosmostation/use-wallets";
import chains from "../../../constants/chains";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { toUint8Array } from "@cosmostation/wallets";
import { Coin, StdFee } from "@cosmjs/stargate";
import { base64ToHex, isBase64 } from "./utils/pubkeyConverter";
import useUserAgent from "../../../hooks/useUserAgent";
import WalletButton from "../../UI/WalletButton";

const CosmostationWalletsPkg: React.FC = () => {
  const { isMobile, isChrome, isFirefox } = useUserAgent();

  const chain = chains[0];

  const { cosmosWallets, currentWallet, selectWallet, closeWallet } =
    useCosmosWallets();

  const { data: account } = useCosmosAccount(chain.chainId);

  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isProcessingSignMessage, setIsProcessingSignMessage] = useState(false);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [isProcessingSendToken, setIsProcessingSendToken] = useState(false);

  const isConnectedWallet = useMemo(() => !!currentWallet, [currentWallet]);

  const [signature, setsignature] = useState("");
  const [txHash, setTxHash] = useState("");
  const [balance, setBalance] = useState<Coin>();

  const getOfflineSigner = useCallback(
    async (chainId: string) => {
      const signer: OfflineSigner = {
        getAccounts: async () => {
          if (!currentWallet) {
            throw Error("No Wallet");
          }

          const _account = await currentWallet.methods.getAccount(chainId);

          const pubKeyValue = isBase64(_account.public_key.value)
            ? base64ToHex(_account.public_key.value)
            : _account.public_key.value;

          return [
            {
              address: _account.address,
              pubkey: toUint8Array(pubKeyValue),
              algo: "secp256k1",
            },
          ];
        },

        signDirect: async (_, signDoc: SignDoc) => {
          if (!currentWallet) {
            throw Error("No Wallet");
          }

          const signDirectDoc = {
            chain_id: signDoc.chainId,
            account_number: signDoc.accountNumber.toString(),
            body_bytes: signDoc.bodyBytes,
            auth_info_bytes: signDoc.authInfoBytes,
          };

          const response = await currentWallet.methods.signDirect(
            signDoc.chainId,
            signDirectDoc
          );

          if (!response) {
            throw Error("signDirect Failed");
          }

          const account = await currentWallet.methods.getAccount(chainId);

          const publicKeyFormatMapping = {
            secp256k1: "tendermint/PubKeySecp256k1",
            ethsecp256k1: "ethermint/PubKeyEthSecp256k1",
          };

          const pubKey = {
            type: publicKeyFormatMapping[account.public_key.type],
            value: account.public_key.value,
          };

          return {
            signed: {
              accountNumber: signDoc.accountNumber,
              chainId: signDoc.chainId,
              authInfoBytes: response.signed_doc.auth_info_bytes,
              bodyBytes: response.signed_doc.body_bytes,
            },
            signature: {
              pub_key: pubKey,
              signature: response.signature,
            },
          };
        },
      };
      return signer;
    },
    [currentWallet]
  );

  const getCosmJsClient = useCallback(
    async (chainId: string) => {
      const offlineSigner = await getOfflineSigner(chainId);

      const rpcURL = chains.find((chain) => chain.chainId === chainId)?.rpc;

      if (!rpcURL) {
        throw new Error("No RPC URL");
      }

      const client = await SigningStargateClient.connectWithSigner(
        rpcURL,
        offlineSigner,
        { gasPrice: GasPrice.fromString(`0.025${chain.denom}`) }
      );

      return client;
    },
    [chain.denom, getOfflineSigner]
  );

  const getBalance = useCallback(
    async (
      chainId: string,
      address: string,
      denom: string
    ): Promise<Coin | null> => {
      const client = await getCosmJsClient(chainId);
      const balance = await client.getBalance(address, denom);

      return balance || null;
    },
    [getCosmJsClient]
  );

  const sendTokens = useCallback(
    async (
      chainId: string,
      from: string,
      to: string,
      amount: Coin[],
      fee: StdFee | "auto" | number,
      memo?: string
    ) => {
      const client = await getCosmJsClient(chainId);
      const response = await client.sendTokens(from, to, amount, fee, memo);

      return response;
    },
    [getCosmJsClient]
  );

  useEffect(() => {
    //  On mobile, the Cosmostation provider is injected into `window.keplr`.
    // To avoid duplicate listings, adjustments are made to prevent the same provider from appearing twice.
    if (isChrome || isFirefox) {
      registerKeplrWallet();
    }

    // Logic for automatic connection support in the Cosmostation mobile app.
    if (isMobile) {
      selectWallet(cosmosWallets[0].id);
    }
  }, [cosmosWallets, isChrome, isFirefox, isMobile, selectWallet]);

  if (!cosmosWallets) {
    return (
      <div className={styles.container}>
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
            {cosmosWallets.map((wallet) => (
              <WalletButton
                walletImage={wallet.logo}
                walletName={wallet.name}
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
              />
            ))}
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
                    src={currentWallet?.logo}
                  />
                  <div className={styles.walletName}>{currentWallet.name}</div>
                </div>
                <div className={styles.workBreak}>
                  {account?.account?.address}
                </div>
                <div className={styles.workBreak}>{account?.account?.name}</div>
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
              closeWallet();
            }}
          >
            <h4>Disconnect</h4>
          </button>
        </div>

        <div className={styles.contentsContainer}>
          <h3>Sign Message</h3>
          <div className={styles.contents}>
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
                  if (!currentWallet) {
                    throw new Error("No Account");
                  }

                  if (!account) {
                    throw new Error("No Account");
                  }

                  if (!currentWallet.methods.signMessage) {
                    throw new Error("No signMessage method");
                  }

                  setIsProcessingSignMessage(true);

                  const message = "Example `signMessage` message";

                  const signature = await currentWallet.methods.signMessage(
                    chain.chainId,
                    message,
                    account.account.address
                  );

                  if (!signature) {
                    throw new Error("No Signature");
                  }

                  setsignature(signature.signature);
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

        <div className={styles.contentsContainer}>
          <h3>Balance</h3>

          <div className={styles.contents}>
            <div className={styles.workBreak}>
              {isFetchingBalance
                ? "Fetching Balance..."
                : balance
                ? `${balance.amount} ${balance.denom}`
                : "No Balance"}
            </div>
          </div>
          <div>
            <button
              className={styles.baseButton}
              disabled={!isConnectedWallet || isFetchingBalance}
              onClick={async () => {
                try {
                  setIsFetchingBalance(true);

                  const response = await getBalance(
                    chain.chainId,
                    account.account.address,
                    chain.denom
                  );

                  if (!response) {
                    throw new Error("No Balance");
                  }

                  setBalance(response);
                } catch (error) {
                  console.error("🚀 ~ error:", error);
                } finally {
                  setIsFetchingBalance(false);
                }
              }}
            >
              Get Balance
            </button>
          </div>
        </div>

        <div className={styles.contentsContainer}>
          <h3>Call Send Token</h3>
          <div>
            <div className={styles.contents}>
              <div className={styles.workBreak}>
                {isProcessingSendToken
                  ? "Processing..."
                  : txHash || "No TxHash"}
              </div>
            </div>
          </div>
          <div>
            <button
              className={styles.baseButton}
              disabled={!isConnectedWallet || isProcessingSendToken}
              onClick={async () => {
                try {
                  setIsProcessingSendToken(true);

                  if (!account) {
                    throw new Error("No Account");
                  }

                  const response = await sendTokens(
                    chain.chainId,
                    account.account.address,
                    account.account.address,
                    [{ denom: chain.denom, amount: "1" }],
                    "auto",
                    "Memo of sendTokens"
                  );

                  setTxHash(response.transactionHash);
                } catch (error) {
                  console.error("🚀 ~ error:", error);
                } finally {
                  setIsProcessingSendToken(false);
                }
              }}
            >
              Send Token
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CosmostationWalletsPkg;
