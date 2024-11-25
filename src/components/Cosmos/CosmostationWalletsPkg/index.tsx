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

  console.log("🚀 ~ isMobile:", isMobile);

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

  // NOTE cosmJs로직
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

          const _account = await currentWallet.methods.getAccount(chainId);

          const publicKeyFormatMapping = {
            secp256k1: "tendermint/PubKeySecp256k1",
            ethsecp256k1: "ethermint/PubKeyEthSecp256k1",
          };

          const pubKey = {
            type: publicKeyFormatMapping[_account.public_key.type],
            value: _account.public_key.value,
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

      const _clients = await SigningStargateClient.connectWithSigner(
        rpcURL,
        offlineSigner,
        { gasPrice: GasPrice.fromString(`0.025${chain.denom}`) }
      );

      return _clients;
    },
    [chain.denom, getOfflineSigner]
  );

  const getBalance = useCallback(
    async (
      chainId: string,
      address: string,
      denom: string
    ): Promise<Coin | null> => {
      const _client = await getCosmJsClient(chainId);
      const balance = await _client.getBalance(address, denom);

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
      const _client = await getCosmJsClient(chainId);
      const response = await _client.sendTokens(from, to, amount, fee, memo);

      return response;
    },
    [getCosmJsClient]
  );

  useEffect(() => {
    // NOTE 모바일일 경우 window.keplr에도 cosmostation의 프로바이더를 인젝트해서 사용중이기 때문에 같은 프로바이더가 중복리스팅되지 않도록 작업.

    // FIXME 이거 바로 true가 뜨는게 아니라 시간차로 true로 바뀌어서 수정이 필요함.
    if (isChrome || isFirefox) {
      registerKeplrWallet();
    }

    // NOTE 모바일일 경우 바로 연결되도록 작업.
    if (isMobile) {
      selectWallet(cosmosWallets[0].id);
    }
  }, [cosmosWallets, isChrome, isFirefox, isMobile, selectWallet]);

  // TODO 모바일인 경우에는 useEffect로 바로 연결되도록 작업.

  return (
    <>
      <div className={styles.notice}>
        <p>
          This page is a sample dApp that allows users to transfer tokens to
          their wallet. It was designed for developers building dApps with the{" "}
          <b>Cosmostation App Wallet</b> or <b>Extension Wallet</b>.
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
      <div className={styles.container}>
        <div className={styles.contentsContainer}>
          <h3 className={styles.title}>Choose your Wallet</h3>

          <div className={styles.walletButtonContainer}>
            {cosmosWallets.length > 0 ? (
              cosmosWallets?.map((wallet) => (
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
                    "uatom"
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
          <h3>Call Send Sign</h3>
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
                    [{ denom: "uatom", amount: "1" }],
                    "auto",
                    "Memo of sendTokens"
                  );
                  console.log(response.transactionHash);

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
