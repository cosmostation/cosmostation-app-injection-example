import { Keplr } from "@keplr-wallet/types";

declare global {
  interface Window {
    cosmostation?: ICosmostation;
    keplr?: Keplr;
  }
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent;
  }
}
