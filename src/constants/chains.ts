export interface IChain {
  network: string;
  denom: string;
  symbol: string;
  chainId: string;
  rpc: string;
  decimals: number;
  path: string;
}

const chains: IChain[] = [
  {
    network: "cosmos",
    denom: "uatom",
    symbol: "atom",
    chainId: "cosmoshub-4",
    rpc: "https://cosmos-rpc.publicnode.com:443",
    decimals: 6,
    path: "m/44'/118'/0'/0/X"
  },
  {
    network: "terra",
    denom: "uluna",
    symbol: "luna",
    chainId: "phoenix-1",
    rpc: "https://terra-rpc.publicnode.com:443",
    decimals: 6,
    path: "m/44'/330'/0'/0/X"
  },
];

export default chains;
