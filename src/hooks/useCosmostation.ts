import { useCallback, useMemo } from "react";

import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";

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

  const signDirect = useCallback(
    async (signDoc: SignDoc) => {
      return await cosmos.request<ICosmosSignDirectResponse>({
        method: "cos_signDirect",
        params: {
          chainName: signDoc.chainId,
          doc: {
            account_number: signDoc.accountNumber.toString(),
            chain_id: signDoc.chainId,
            auth_info_bytes: signDoc.authInfoBytes,
            body_bytes: signDoc.bodyBytes,
          },
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
    signDirect,
  };
};

export default useCosmostation;
