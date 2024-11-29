import { useSyncExternalStore } from "react";
import { eip6963ProviderStore } from "../store/eip6963ProviderStore";

export const useEthereumWallets = () =>
  useSyncExternalStore(
    eip6963ProviderStore.subscribe,
    eip6963ProviderStore.value,
    eip6963ProviderStore.value
  );
