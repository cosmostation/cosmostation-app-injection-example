export {};

declare global {
  interface Window {
    cosmostation?: ICosmostation;
  }
  interface WindowEventMap {
    "eip6963:announceProvider": CustomEvent;
  }
}
