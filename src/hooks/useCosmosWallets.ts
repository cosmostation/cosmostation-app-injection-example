import { useCallback, useMemo, useState } from "react";
import { CosmosWallet } from "../../types/cosmos";
import CosmostaionIcon from "../assets/images/cosmostation.png";
import KeplrIcon from "../assets/images/keplr.png";

const useCosmosWalletsWithVanilla = () => {
  const cosmosWallets: CosmosWallet[] = [
    {
      id: "cosmostation",
      name: "Cosmostation",
      icon: CosmostaionIcon,
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
  ].filter((wallet) => wallet.provider);

  const [selectedCosmosWallet, setSelectedCosmosWallet] =
    useState<CosmosWallet>();

  const selectedWallet = useMemo(
    () => selectedCosmosWallet,
    [selectedCosmosWallet]
  );

  //NOTE enable안에 들어가는 chainId는 크게 의미가 없음. enable은 단순히 활성화만 시키는 것이기 때문
  const connectWallet = useCallback(
    async (id: string) => {
      const wallet = cosmosWallets.find((wallet) => wallet.id === id);

      if (!wallet) {
        throw new Error("No Wallet");
      }

      const provider = wallet.provider;

      await provider.enable("archway-1");
      setSelectedCosmosWallet(wallet);
    },

    [cosmosWallets]
  );

  const disconnectWallet = useCallback(() => {
    if (!selectedWallet) {
      throw new Error("No Wallet");
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

      return response;
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

  return {
    selectedWallet,
    cosmosWallets,
    connectWallet,
    disconnectWallet,
    getOfflineSigner,
    signMessage,
    getAccount,
    getMultipleAccounts,
  };
};

export default useCosmosWalletsWithVanilla;
