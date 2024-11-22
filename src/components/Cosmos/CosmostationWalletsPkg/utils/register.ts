import {
  CosmosPublicKeyType,
  CosmosRegisterWallet,
  registerCosmosWallet,
} from "@cosmostation/wallets";
import { BroadcastMode } from "@keplr-wallet/types";
import Long from "long";

export function registerKeplrWallet() {
  if (window.keplr) {
    const keplrWallet: CosmosRegisterWallet = {
      name: "Keplr",
      logo: "https://wallet.keplr.app/keplr-brand-assets/keplr-logo.svg",
      events: {
        on(type, listener) {
          if (type === "AccountChanged") {
            window.addEventListener("keplr_keystorechange", listener);
          }
        },
        off(type, listener) {
          if (type === "AccountChanged") {
            window.removeEventListener("keplr_keystorechange", listener);
          }
        },
      },
      methods: {
        getSupportedChainIds: async () => {
          return ["cosmoshub-4", "archway-1"];
        },
        connect: async (chainIds) => {
          const cIds = typeof chainIds === "string" ? [chainIds] : chainIds;
          const supportedChainIds =
            await keplrWallet.methods.getSupportedChainIds();

          if (!cIds.every((cId) => supportedChainIds.includes(cId))) {
            throw new Error("Unsupported chainId is exist");
          }

          await window.keplr!.enable(chainIds);
        },
        getAccount: async (chainId) => {
          const response = await window.keplr!.getKey(chainId);

          return {
            address: response.bech32Address,
            name: response.name,
            public_key: {
              type: response.algo as CosmosPublicKeyType,
              value: Array.from(response.pubKey)
                .map((byte) => byte.toString(16).padStart(2, "0"))
                .join(""),
            },
            is_ledger: response.isNanoLedger,
          };
        },
        signAmino: async (chainId, document, options) => {
          const signer =
            options?.signer ||
            (await keplrWallet.methods.getAccount(chainId)).address;

          const newdocument = {
            ...document,
            fee: {
              ...document.fee,
              amount: document.fee.amount || [],
            },
          };

          const response = await window.keplr!.signAmino(
            chainId,
            signer,
            newdocument
          );

          return {
            signature: response.signature.signature,
            signed_doc: response.signed,
          };
        },
        signDirect: async (chainId, document, options) => {
          const account = await keplrWallet.methods.getAccount(chainId);

          if (account.is_ledger) {
            throw new Error("Ledger is not supported");
          }

          const signer = options?.signer || account.address;

          const signingDoc = {
            accountNumber: new Long(Number(document.account_number)),
            authInfoBytes:
              typeof document.auth_info_bytes === "string"
                ? new Uint8Array(
                    Buffer.from(document.auth_info_bytes, "base64")
                  )
                : document.auth_info_bytes,
            chainId: document.chain_id,
            bodyBytes:
              typeof document.body_bytes === "string"
                ? new Uint8Array(Buffer.from(document.body_bytes, "base64"))
                : document.body_bytes,
          };

          const response = await window.keplr!.signDirect(
            chainId,
            signer,
            signingDoc
          );

          return {
            signature: response.signature.signature,
            signed_doc: {
              auth_info_bytes: response.signed.authInfoBytes,
              body_bytes: response.signed.bodyBytes,
            },
          };
        },
        disconnect: async () => {
          await window.keplr?.disable();
        },
        sendTransaction: async (chainId, tx_bytes, mode) => {
          const broadcastMode: BroadcastMode =
            mode === 1
              ? BroadcastMode.Block
              : mode === 2
              ? BroadcastMode.Sync
              : mode === 3
              ? BroadcastMode.Async
              : BroadcastMode.Sync;

          const txBytes =
            typeof tx_bytes === "string"
              ? new Uint8Array(Buffer.from(tx_bytes, "base64"))
              : tx_bytes;

          const response = await window.keplr!.sendTx(
            chainId,
            txBytes,
            broadcastMode
          );

          const txHash = Buffer.from(response).toString("hex").toUpperCase();

          return txHash;
        },
        addChain: async (chain) => {
          const coinType = chain.coin_type
            ? Number(chain.coin_type.replace("'", ""))
            : 118;

          await window.keplr!.experimentalSuggestChain({
            chainId: chain.chain_id,
            chainName: chain.chain_name,
            rpc: chain.lcd_url,
            rest: chain.lcd_url,
            bip44: {
              coinType,
            },
            bech32Config: {
              bech32PrefixAccAddr: chain.address_prefix,
              bech32PrefixAccPub: chain.address_prefix + "pub",
              bech32PrefixValAddr: chain.address_prefix + "valoper",
              bech32PrefixValPub: chain.address_prefix + "valoperpub",
              bech32PrefixConsAddr: chain.address_prefix + "valcons",
              bech32PrefixConsPub: chain.address_prefix + "valconspub",
            },
            currencies: [
              {
                coinDenom: chain.display_denom,
                coinMinimalDenom: chain.base_denom,
                coinDecimals: chain.decimals || 6,
                coinGeckoId: chain.coingecko_id || "unknown",
              },
            ],
            feeCurrencies: [
              {
                coinDenom: chain.display_denom,
                coinMinimalDenom: chain.base_denom,
                coinDecimals: chain.decimals || 6,
                coinGeckoId: chain.coingecko_id || "unknown",
                gasPriceStep: {
                  low: chain?.gas_rate?.tiny
                    ? Number(chain?.gas_rate?.tiny)
                    : 0.01,
                  average: chain?.gas_rate?.low
                    ? Number(chain?.gas_rate?.low)
                    : 0.025,
                  high: chain?.gas_rate?.average
                    ? Number(chain?.gas_rate?.average)
                    : 0.04,
                },
              },
            ],
            stakeCurrency: {
              coinDenom: chain.display_denom,
              coinMinimalDenom: chain.base_denom,
              coinDecimals: chain.decimals || 6,
              coinGeckoId: chain.coingecko_id || "unknown",
            },
          });
        },
      },
    };
    registerCosmosWallet(keplrWallet);
  }
}
