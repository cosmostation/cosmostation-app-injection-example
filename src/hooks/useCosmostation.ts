import { useCallback, useEffect, useMemo, useState } from "react";

import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import useUserAgent from "./useUserAgent";

const useCosmostation = () => {
  const [provider, setProvider] = useState<ICosmostation | null>(null);
  const { isMobile, isAndroid, isiOS, isChrome, isFirefox } = useUserAgent();

  useEffect(() => {
    let originProvider = window.cosmostation;

    setProvider(originProvider || null);

    Object.defineProperty(window, "cosmostation", {
      get() {
        return originProvider;
      },
      set(newProvider) {
        setProvider(newProvider);
        originProvider = newProvider;
      },
    });

    return () => {
      Object.defineProperty(window, "cosmostation", {
        value: originProvider,
        writable: true,
      });
    };
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
    (chainId: string) => {
      return cosmos?.request<ICosmosRequestAccount>({
        method: "cos_requestAccount",
        params: {
          chainName: chainId,
        },
      });
    },
    [cosmos]
  );

  const signDirect = useCallback(
    (signDoc: SignDoc) => {
      return cosmos?.request<ICosmosSignDirectResponse>({
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
