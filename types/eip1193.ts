export interface EIP1193Provider {
  // Event subscription methods
  on(event: string, listener: (...args: unknown[]) => void): this;
  once(event: string, listener: (...args: unknown[]) => void): this;
  off(event: string, listener?: (...args: unknown[]) => void): this;
  removeListener(event: string, listener?: (...args: unknown[]) => void): this;

  // Request method for calling Ethereum JSON-RPC methods
  request(args: {
    method: string;
    params?: unknown[] | object;
  }): Promise<unknown>;

  // Optional methods (based on provider's lifecycle management)
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
}
