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
    cosmostation: "cosmos1clpqr4nrk4khgkxj78fcwwh6dl3uw4ep4tgu9q",
  },
  {
    network: "terra",
    denom: "uluna",
    symbol: "luna",
    chainId: "phoenix-1",
    rpc: "https://terra-rpc.publicnode.com:443",
    decimals: 6,
    cosmostation: "terra1564j3fq8p8np4yhh4lytnftz33japc03wuejxm",
  },
];

export default chains;
