import { useCallback, useMemo, useState } from "react";
import { CosmosWallet } from "../../types/cosmos";
import CosmostaionIcon from "../assets/images/cosmostation.png";
import KeplrIcon from "../assets/images/keplr.png";
import chains from "../constants/chains";
import {
  Coin,
  GasPrice,
  SigningStargateClient,
  StdFee,
} from "@cosmjs/stargate";
import { Key } from "@keplr-wallet/types";
import useUserAgent from "./useUserAgent";

const useCosmosWalletsWithVanilla = () => {
  const { isMobile } = useUserAgent();

  const cosmosWallets: CosmosWallet[] = [
    {
      id: "cosmostation",
      name: "Cosmostation",
      icon: CosmostaionIcon,
      // https://docs.cosmostation.io/extension/integration/cosmos/integrate-keplr
      provider: window.cosmostation?.providers?.keplr,
    },
    // NOTE 모바일에서는 keplr도 뜨는데 우리는 window.keplr에도 인젝트 시켰기 때문에 나온다. 인젝트되는 provier객체는  window.cosmostation?.providers?.keplr와 동일한 객체임.
    // NOTE 별도로 ui로 표시해줘도 좋을듯.
    {
      id: "keplr",
      name: "Keplr",
      icon: KeplrIcon,
      provider: window.keplr,
    },
  ]
    // NOTE provider가 없는 경우는 연결 불가능한 지갑으로 판단
    .filter((wallet) => wallet.provider)
    // NOTE 모바일에서는 cosmostation만 뜨도록 함.
    // NOTE 모바일에서는 window.keplr에도 코스모스테이션의 프로바이더를 인젝트 시켰기 때문에 둘다 뜨게 됨.
    .filter((wallet) => {
      if (isMobile) {
        return wallet.id === "cosmostation";
      }

      return true;
    });

  const [selectedCosmosWallet, setSelectedCosmosWallet] =
    useState<CosmosWallet>();
  const [selectedUserAccount, setSelectedUserAccount] = useState<Key>();

  const selectedWallet = useMemo(
    () => selectedCosmosWallet,
    [selectedCosmosWallet]
  );

  const userAccount = useMemo(() => selectedUserAccount, [selectedUserAccount]);

  const connectWallet = useCallback(
    async (walletId: string, chainId: string) => {
      const wallet = cosmosWallets.find((wallet) => wallet.id === walletId);

      if (!wallet) {
        throw new Error("No Wallet");
      }

      const provider = wallet.provider;

      await provider.enable(chainId);

      const response = await provider.getKey(chainId);

      setSelectedCosmosWallet(wallet);
      setSelectedUserAccount(response);
    },

    [cosmosWallets]
  );

  const disconnectWallet = useCallback(async () => {
    if (!selectedWallet) {
      throw new Error("No Wallet");
    }

    if (selectedWallet.provider.disable) {
      await selectedWallet.provider.disable();
    }

    setSelectedCosmosWallet(undefined);
  }, [selectedWallet]);

  const getOfflineSigner = useCallback(
    async (chainId: string) => {
      if (!selectedWallet) {
        throw new Error("No Wallet");
      }

      const provider = selectedWallet.provider;

      const offlineSigner = await provider.getOfflineSigner(chainId);

      return offlineSigner;
    },
    [selectedWallet]
  );

  const signMessage = useCallback(
    async (chainId: string, signer: string, data: string | Uint8Array) => {
      if (!selectedWallet) {
        throw new Error("No Wallet");
      }

      const provider = selectedWallet.provider;

      const signature = await provider.signArbitrary(chainId, signer, data);

      return signature;
    },
    [selectedWallet]
  );

  const getAccount = useCallback(
    async (chainId: string) => {
      if (!selectedWallet) {
        throw new Error("No Wallet");
      }

      const provider = selectedWallet.provider;

      const response = await provider.getKey(chainId);

      setSelectedUserAccount(response);
    },
    [selectedWallet]
  );

  const getMultipleAccounts = useCallback(
    async (chainIds: string[]) => {
      if (!selectedWallet) {
        throw new Error("No Wallet");
      }

      const provider = selectedWallet.provider;

      const response = await Promise.all(
        chainIds.map(async (chainId) => {
          return await provider.getKey(chainId);
        })
      );

      return response;
    },
    [selectedWallet]
  );

  const getCosmJsClient = useCallback(
    async (chainId: string) => {
      const offlineSigner = await getOfflineSigner(chainId);

      const selectedChain = chains.find((chain) => chain.chainId === chainId);
      const rpcURL = selectedChain?.rpc;

      if (!rpcURL) {
        throw new Error("No RPC URL");
      }

      const cosmJsClient = await SigningStargateClient.connectWithSigner(
        rpcURL,
        offlineSigner,
        { gasPrice: GasPrice.fromString(`0.025${selectedChain.denom}`) }
      );

      return cosmJsClient;
    },
    [getOfflineSigner]
  );

  const getBalance = useCallback(
    async (
      chainId: string,
      address: string,
      denom: string
    ): Promise<Coin | null> => {
      const cosmJsClient = await getCosmJsClient(chainId);
      const balance = await cosmJsClient.getBalance(address, denom);

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
      const cosmJsClient = await getCosmJsClient(chainId);
      const response = await cosmJsClient.sendTokens(
        from,
        to,
        amount,
        fee,
        memo
      );

      return response;
    },
    [getCosmJsClient]
  );

  return {
    selectedWallet,
    cosmosWallets,
    userAccount,
    connectWallet,
    disconnectWallet,
    getOfflineSigner,
    signMessage,
    getAccount,
    getMultipleAccounts,
    getCosmJsClient,
    getBalance,
    sendTokens,
  };
};

export default useCosmosWalletsWithVanilla;
