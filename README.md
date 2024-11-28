# Cosmostation App Wallet Injection Example

This code used the Cosmostation Wallet Injection Script to help developers to build dApps using the `Cosmostation Mobile wallet` and `Cosmostation extension wallet`.

By unifying the injection script interface, developers can seamlessly integrate both the `Mobile wallet` and `Extension wallet` within a single codebase.

- Detailed instructions for using the injection script can be found in the [Cosmostation Docs](https://docs.cosmostation.io/extension)
- [Example Page](https://cosmostation.github.io/cosmostation-app-injection-example/)

## Run example page

Get the ngrok token from <https://dashboard.ngrok.com/get-started/your-authtoken>

```shell
brew install ngrok

ngrok config add-authtoken <TOKEN>

ngrok http http://localhost:${PORT}
```

<https://ngrok.com/docs/getting-started/>

```bash
# Using yarn package manager
npm install
npm run dev
```

## Flow Overview

1. When the wallet is either installed or the page is loaded via the Cosmostation wallet (mobile or extension), cosmostation object will present as a window variable of global. This object allows you to execute the injected Script.

   Please navigate to the following from the mobile if you wish to test the functionality of your developing dApp

   `Setting -> App Info -> Developer -> Enter the link of the developing dApp`

2. Upon the initialization of the app, an offlineSigner is used to create a cosmjs client, which is then added to the global context

   If you need assistance with the code regarding this, please refer to the following directory `src/providers/ClientProvider.tsx`

   To define the offlineSigner, simply refer to the code provided below

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
