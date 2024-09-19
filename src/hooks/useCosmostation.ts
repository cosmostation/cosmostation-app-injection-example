import { useMemo } from "react";

const useCosmostation = () => {
  const provider = useMemo(() => {
    return window.cosmostation;
  }, []);

  const cosmos = useMemo(() => {
    return provider.cosmos;
  }, [provider]);

  return {
    provider,
    cosmos,
  };
};

export default useCosmostation;
