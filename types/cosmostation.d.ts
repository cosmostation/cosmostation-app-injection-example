interface ICosmostation {
  cosmos: {
    request: <T>(message) => Promise<T>;
    on: (eventName: string, eventHandler: (event?: unknown) => void) => unknown;
    off: (handler: unknown) => void;
  };
}

interface ICosmosRequestAccount {
  address: string;
  isEthermint: boolean;
  isKeystone: boolean;
  isLedger: boolean;
  name: string;
  publicKey: Uint8Array;
}
