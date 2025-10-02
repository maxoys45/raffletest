// Import the tools we need from the Kadena library.
import { Pact, createClient } from "@kadena/client";

const config = {
  NETWORK: "testnet04", // "mainnet01" for mainnet
  EVENT_HOST: "https://api.testnet.chainweb.com", // chainweb API host (default for testnet)
  DEPTH: 2, // confirmation depth to avoid orphans
  WATCH_ADDR:
    "k:cf0e0d2a3bb872e6332a8532d0e0b90dd98522990603422b96b083ee9f5407d2",
  CHAIN: 0,
  GAS_PRICE: 0.00001,
  GAS_LIMIT: 1500,
  TTL: 28800, // 8 hour
};

// Create an asynchronous function that checks a Kadena account balance.
async function checkBalance(accountName) {
  console.log(`Checking balance for account: ${accountName}`);

  try {
    // Step 1: Build a transaction that uses the Pact language.
    const transaction = Pact.builder
      .execution(
        // Call the "get-balance" function from the "coin" smart contract
        Pact.modules.coin["get-balance"](accountName)
      )
      // Specify the chain to check.
      .setMeta({ chainId: "3" })
      .createTransaction();

    // Step 2: Create a client on a specific chain in the Kadena development network.
    const client = createClient(
      `https://api.testnet.chainweb.com/chainweb/0.0/${config.NETWORK}/chain/${config.CHAIN}/pact`
    );

    // Step 3: Send the request to the blockchain.
    const result = await client.local(transaction, {
      preflight: false,
      signatureVerification: false,
    });

    // Step 4: Display the result
    if (result.result.status === "success") {
      console.log(`Balance: ${result.result.data} KDA`);
      return result.result.data;
    } else {
      console.log("Error:", result.result.error);
    }
  } catch (error) {
    console.log("Something went wrong:", error.message);
  }
}

// Example usage - replace with a real Kadena account
const exampleAccount =
  "k:4cac61077a03bdd08fa811fa652ad85100d7aba215bbba9ff070902837a41eb3";
checkBalance(exampleAccount);
