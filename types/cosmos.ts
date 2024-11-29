import { Keplr } from "@keplr-wallet/types";

export type CosmosWallet = {
  id: string;
  name: string;
  icon: string;
  provider: Keplr;
};
