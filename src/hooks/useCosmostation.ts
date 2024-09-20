import { useCallback, useMemo } from "react";

const useCosmostation = () => {
  const provider = useMemo(() => {
    return window.cosmostation;
  }, []);

  const cosmos = useMemo(() => {
    return provider.cosmos;
  }, [provider]);

  const isConnected = useMemo(() => {
    return !!provider;
  }, [provider]);

  const getAccount = useCallback(
    async (chainId: string) => {
      return await cosmos.request<ICosmosRequestAccount>({
        method: "cos_requestAccount",
        params: {
          chainName: chainId,
        },
      });
    },
    [cosmos]
  );

  return {
    isConnected,
    provider,
    cosmos,
    getAccount,
  };
};

export default useCosmostation;
