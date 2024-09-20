export interface IChain {
  network: string;
  denom: string;
  symbol: string;
  chainId: string;
  rpc: string;
  decimals: number;
}

const chains: IChain[] = [
  {
    network: "cosmos",
    denom: "uatom",
    symbol: "atom",
    chainId: "cosmoshub-4",
    rpc: "https://cosmos-rpc.publicnode.com:443",
    decimals: 6,
  },
  {
    network: "terra",
    denom: "uluna",
    symbol: "luna",
    chainId: "phoenix-1",
    rpc: "https://terra-rpc.publicnode.com:443",
    decimals: 6,
  },
];

export default chains;
