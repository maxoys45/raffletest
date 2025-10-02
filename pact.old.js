import Pact from "pact-lang-api";
import { EventEmitter } from "events";

import { setLastProcessedBlock, getLastProcessedBlock } from "./db/helpers.js";

import { config, env } from "./config.js";

export const pactEvents = new EventEmitter();

export const getLatestHeight = async () => {
  const res = await fetch(
    `${config.EVENT_HOST}/chainweb/0.0/${config.NETWORK}/cut`
  );
  const data = await res.json();

  console.log(`Latest height: ${data.hashes[0].height}`);

  return data.hashes[0].height;
};

/**
 * Utility: normalize/inspect params safely
 */
const getParams = (ev) => {
  // pact examples sometimes use `params`, other places `parameters` — handle both
  return ev.params ?? ev.parameters ?? ev.Params ?? [];
};

const isCoinTransfer = (ev) => {
  return (
    ev &&
    ev.module &&
    ev.module.name === "coin" &&
    // ev.module.namespace === null && // I'm not sure it's namespace being 'null' is required?
    (ev.name === "TRANSFER" ||
      ev.name === "coin.TRANSFER" ||
      ev.name?.toUpperCase() === "TRANSFER")
  );
};

const toMatchesAddress = (to, watched) => {
  if (!to) return false;

  to = String(to);

  if (to === watched) return true;

  // handle case where event gives raw pubkey (no 'k:' prefix) but your address includes 'k:'
  if (watched.startsWith("k:") && to === watched.slice(2)) return true;

  // reverse: event might have 'k:' but watched is pubkey
  if (to.startsWith("k:") && to === `k:${watched}`) return true;

  return false;
};

/**
 * Process & handle incoming deposit
 */
const handleIncomingEvent = (ev) => {
  const params = getParams(ev);

  if (!toMatchesAddress(params[1], config.WATCH_ADDR)) return;

  const from = params[0];
  const to = params[1];
  const amount = Number(params[2]);
  const height = ev.height ?? ev.block?.height ?? null;

  console.log("DEPOSIT event:", {
    from,
    to,
    amount,
    height,
  });

  const tx = {
    address: from,
    amount,
  };

  pactEvents.emit("RAFFLE_ENTRY", tx);

  // Save the last block height so we can retrieve missed deposits if server goes down.
  setLastProcessedBlock(height);
};

const retrieveHistoricalTxs = async (latestBlockHeight) => {
  const lastTx = getLastProcessedBlock() ?? 5743380;

  let blockHeight;

  for (
    blockHeight = lastTx + 1;
    blockHeight <= latestBlockHeight;
    blockHeight++
  ) {
    console.log("checking block...");

    const events = await Pact.event.height(
      0,
      blockHeight,
      config.NETWORK,
      config.EVENT_HOST
    );

    const transfers = events.filter((event) => isCoinTransfer(event));

    for (const tx of transfers) {
      handleIncomingEvent(tx);
    }
  }

  setLastProcessedBlock(blockHeight);

  console.log("Finished checking missed blocks.");
};

/**
 * 1) historical txs since last deposit
 * 2) start stream (for live events)
 */
export const listenForTxs = async (latestBlockHeight) => {
  try {
    retrieveHistoricalTxs(latestBlockHeight);

    const callback = (ev) => {
      if (!isCoinTransfer(ev)) return;

      handleIncomingEvent(ev);
    };

    console.log("Starting Pact.event.stream...");

    const es = Pact.event.stream(
      config.DEPTH,
      [config.CHAIN],
      callback,
      config.NETWORK,
      config.EVENT_HOST
    );

    // keep a reference if you want to close later:
    // es.close();

    // basic reconnect on error/close:
    if (es && typeof es.addEventListener === "function") {
      es.addEventListener("error", (err) => {
        console.warn("Stream error, will attempt to restart", err);
        try {
          es.close();
        } catch (_) {}
        // a simple reconnect after a short delay
        setTimeout(() => listenForTxs(), 5000);
      });
    }
  } catch (err) {
    console.error("listenForTxs error:", err);
    // simple retry/backoff
    setTimeout(listenForTxs, 5000);
  }
};

// const isHex = /^[0-9a-fA-F]{64}$/.test(env.EZKDA_PRIVATE_KEY);
// console.log("Is valid hex?", isHex);

/**
 * Get balance of KDA account.
 */

// async function getBalance() {
//   const cmdObj = {
//     networkId: config.NETWORK,
//     keyPairs: {
//       publicKey: env.EZKDA_PUBLIC_KEY,
//       secretKey: env.EZKDA_PRIVATE_KEY,
//     },
//     pactCode: `(coin.get-balance "${env.EZKDA_WALLET}")`,
//     meta: Pact.lang.mkMeta(
//       env.EZKDA_WALLET,
//       "0",
//       0.0000001, // gas price
//       3000, // gas limit
//       Math.floor(Date.now() / 1000),
//       600
//     ),
//     nonce: JSON.stringify(Date.now()),
//   };

//   const res = await Pact.fetch.local(cmdObj, config.TX_HOST);

//   console.log("Balance result:", res);

//   return res.result.data;
// }

// getBalance().then(console.log).catch(console.error);

/**
 * Create named Kadena account.
 */

// async function createNamedAccount() {
//   const cmdObj = {
//     networkId: config.NETWORK,
//     keyPairs: {
//       publicKey: env.EZKDA_PUBLIC_KEY,
//       secretKey: env.EZKDA_PRIVATE_KEY,
//     },
//     pactCode:
//       "(coin.create-account 'ezkda-wallet-01 (read-keyset 'account-keyset))",
//     envData: {
//       "account-keyset": [
//         "4cac61077a03bdd08fa811fa652ad85100d7aba215bbba9ff070902837a41eb3",
//       ],
//     },
//     meta: Pact.lang.mkMeta(
//       env.EZKDA_WALLET, // payer for gas
//       "0",
//       config.GAS_PRICE, // gas price
//       config.GAS_LIMIT, // gas limit
//       Math.floor(Date.now() / 1000),
//       config.TTL
//     ),
//     nonce: JSON.stringify(`ezkda-${Date.now()}`),
//   };

//   const sendRes = await Pact.fetch.send(cmdObj, config.TX_HOST);
//   const requestKey = sendRes.requestKeys[0];
//   console.log("Account creation requestKey:", requestKey);

//   // poll for confirmation
//   let result = null;

//   while (!result) {
//     await new Promise((r) => setTimeout(r, 5000));

//     const pollRes = await Pact.fetch.poll(
//       { requestKeys: [requestKey] },
//       config.TX_HOST
//     );

//     result = pollRes[requestKey];
//   }

//   console.log("Account creation result:", result.result);
// }

// createNamedAccount();
