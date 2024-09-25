# Cosmostation App Wallet Injection Example

This code is built using the Cosmostation App Wallet’s injection script, created to assist developers building dApps with both the Cosmostation App Wallet and Cosmostation Extension Wallet.

By unifying the injection script interface, the Cosmostation App Wallet and Extension Wallet can be seamlessly integrated and used within a single codebase.

- Detailed instructions for using the injection script can be found in the [Cosmostation Docs](https://docs.cosmostation.io/extension)
- [Example Page](https://cosmostation.github.io/cosmostation-app-injection-example/)

## Run example page

```bash
# Using yarn package manager
yarn install
yarn dev
```

## Flow Overview

1. When the wallet is installed (or the page is opened via the Cosmostation App Wallet on mobile), a cosmostation object will be present in the global window variable. This object allows you to execute the injected script. (To test, navigate to `Cosmostation App Wallet -> Settings -> App Info -> Developer Mode`, and enter the development address) - `src/hooks/useCosmostation.ts`

2. Upon the app’s initial launch, an offlineSigner is used to create a cosmjs client, which is then added to the global context - `src/providers/ClientProvider.tsx`

   To define the offlineSigner, refer to the documentation for the Extension, or for the App, simply include the code provided below.

   ```typescript
   // Example code of getOfflineSigner
   const getOfflineSigner = (chainId: string) => {
     const signer: OfflineSigner = {
       getAccounts: async () => {
         const account = await getAccount(chainId);

         if (!account) throw Error("getAccount Failed");

         return [
           {
             address: account.address,
             pubkey: account.publicKey,
             algo: "secp256k1",
           },
         ];
       },
       signDirect: async (_, signDoc: SignDoc) => {
         const response = await signDirect(signDoc);

         if (!response) throw Error("signDirect Failed");

         return {
           signed: {
             accountNumber: response.signed_doc.account_number,
             chainId: response.signed_doc.chain_id,
             authInfoBytes: response.signed_doc.auth_info_bytes,
             bodyBytes: response.signed_doc.body_bytes,
           },
           signature: {
             pub_key: response.pub_key,
             signature: response.signature,
           },
         };
       },
     };
     return signer;
   };
   ```

   ```typescript
   // Example code of create client with signer
   const offlineSigner = await getOfflineSigner(chain.chainId);

   const client = await SigningStargateClient.connectWithSigner(
     chain.rpc,
     offlineSigner,
     { gasPrice: GasPrice.fromString(`0.025${chain.denom}`) }
   );
   ```

3. With this setup, you can proceed to build your app using cosmjs.
   ```typescript
   // Example code of sendTokens via cosmjs (src/hooks/useCosmJS.ts)
   await client.sendTokens(from, to, amount, fee, memo);
   ```
