import { useCallback, useMemo } from "react";

import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import useUserAgent from "./useUserAgent";

const useCosmostation = () => {
  const { isMobile, isAndroid, isiOS, isChrome, isFirefox } = useUserAgent();

  const provider = useMemo(() => {
    return window.cosmostation;
  }, []);

  const cosmos = useMemo(() => {
    return provider?.cosmos;
  }, [provider]);

  const isInstalled = useMemo(() => {
    return !!provider;
  }, [provider]);

  const downloadUrl = useMemo(() => {
    if (isMobile) {
      if (isAndroid) {
        return "https://play.google.com/store/apps/details?id=wannabit.io.cosmostaion";
      }
      if (isiOS) {
        return "https://apps.apple.com/kr/app/cosmostation/id1459830339";
      }
    } else {
      if (isChrome) {
        return "https://chromewebstore.google.com/detail/cosmostation-wallet/fpkhgmpbidmiogeglndfbkegfdlnajnf";
      }

      if (isFirefox) {
        return "https://addons.mozilla.org/en-US/firefox/addon/cosmostation-wallet/";
      }
    }

    return null;
  }, [isMobile, isAndroid, isiOS, isChrome, isFirefox]);

  const getAccount = useCallback(
    async (chainId: string) => {
      return await cosmos?.request<ICosmosRequestAccount>({
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
      return await cosmos?.request<ICosmosSignDirectResponse>({
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
    isInstalled,
    downloadUrl,
    provider,
    cosmos,
    getAccount,
    signDirect,
  };
};

export default useCosmostation;
