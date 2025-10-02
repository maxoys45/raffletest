import {
  createClient,
  Pact,
  createSignWithKeypair,
  createTransactionBuilder,
} from "@kadena/client";

import { config, env } from "../config.js";

config.TX_HOST = `https://api.testnet.chainweb.com/chainweb/0.0/${config.NETWORK}/chain/${config.CHAIN_ID}/pact`;

const client = createClient(config.TX_HOST, {
  confirmationDepth: config.DEPTH,
});

const sendKDA = async (senderAccount, recipientAccount, amount) => {
  const builder = createTransactionBuilder()
    .execution(
      Pact.modules.coin.transfer(senderAccount, recipientAccount, {
        decimal: amount,
      })
    )
    .addSigner(env.EZKDA_PUBLIC_KEY, (withCaps) => [
      withCaps("coin.GAS"),
      withCaps("coin.TRANSFER", senderAccount, recipientAccount, amount),
    ])
    .setMeta({
      chainId: String(config.CHAIN_ID),
      sender: senderAccount,
      gasLimit: config.GAS_LIMIT,
      gasPrice: config.GAS_PRICE,
      ttl: config.TTL, // 8h
    })
    .setNetworkId(config.NETWORK);

  const tx = builder.createTransaction();

  const signWithKeypair = createSignWithKeypair({
    publicKey: env.EZKDA_PUBLIC_KEY,
    secretKey: env.EZKDA_PRIVATE_KEY,
  });

  const signedTx = await signWithKeypair(tx);

  const response = await client.submit(signedTx);

  const result = await client.listen(response);

  return result;
};

sendKDA(
  env.EZKDA_WALLET,
  "k:cf0e0d2a3bb872e6332a8532d0e0b90dd98522990603422b96b083ee9f5407d2",
  0.1
)
  .then((res) => console.log("Success:", res))
  .catch((err) => console.log("Error:", err));
