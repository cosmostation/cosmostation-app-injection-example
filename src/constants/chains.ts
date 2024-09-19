export interface Chain {
  network: string;
  denom: string;
  chainId: string;
  rpc: string;
}

const chains: Chain[] = [
  {
    network: "cosmos",
    denom: "uatom",
    chainId: "cosmoshub-4",
    rpc: "https://cosmos-rpc.publicnode.com:443",
  },
  {
    network: "terra",
    denom: "uluna",
    chainId: "phoenix-1",
    rpc: "https://terra-rpc.publicnode.com:443",
  },
];

export default chains;
