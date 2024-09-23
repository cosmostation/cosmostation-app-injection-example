export interface IChain {
  network: string;
  denom: string;
  symbol: string;
  chainId: string;
  rpc: string;
  decimals: number;
  cosmostation: string;
}

const chains: IChain[] = [
  {
    network: "cosmos",
    denom: "uatom",
    symbol: "atom",
    chainId: "cosmoshub-4",
    rpc: "https://cosmos-rpc.publicnode.com:443",
    decimals: 6,
    cosmostation: "cosmos1ze2ye5u5k3qdlexvt2e0nn0508p04094j0vmx8",
  },
  {
    network: "terra",
    denom: "uluna",
    symbol: "luna",
    chainId: "phoenix-1",
    rpc: "https://terra-rpc.publicnode.com:443",
    decimals: 6,
    cosmostation: "terra1uusf63dqqwlq9mws8guth45nawnpuv6836jk6m",
  },
];

export default chains;
