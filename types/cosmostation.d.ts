interface ICosmostation {
  cosmos?: {
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

interface ICosmosSignDirectResponse {
  pub_key: {
    type: string;
    value: string;
  };
  signature: string;
  signed_doc: {
    account_number: string;
    auth_info_bytes: Uint8Array;
    body_bytes: Uint8Array;
    chain_id: string;
  };
}
