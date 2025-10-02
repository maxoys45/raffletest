import chainweb from "@kadena/chainwebjs";
import { EventEmitter } from "events";

import { setLastProcessedBlock, getLastProcessedBlock } from "../db/helpers.js";
import {
  isCoinTransfer,
  toMatchesAddress,
  validateTransferInputs,
} from "../helpers/txs.js";

import { config, env } from "../config.js";

// Event emitter
export const pactEvents = new EventEmitter();

// get latest cut (tip of the network)
const getLatestHeight = async () => {
  const cut = await chainweb.default.cut.current(
    config.NETWORK,
    config.EVENT_HOST
  );

  const height = cut.hashes[`${config.CHAIN_ID}`].height;

  console.log("Latest height:", height);

  return height;
};

// get all txs from a block
const getBlockTxs = async (height) => {
  const blocks = await chainweb.default.block.height(
    String(config.CHAIN_ID),
    height,
    config.NETWORK,
    config.EVENT_HOST
  );

  const txs = blocks.payload.transactions; // contains transactions

  // console.log(txs);

  return txs;
};

const handleNewDeposit = async (height) => {
  console.log("Checking block for TX...");

  const txs = await getBlockTxs(height);

  if (!txs.length) return;

  const events = txs[0].output?.events;

  if (!events.length) return;

  events.forEach((tx) => {
    // Confirm it's a coin transfer
    if (!isCoinTransfer(tx)) return;

    // Confirm tx is coming to ezkda wallet.
    if (!toMatchesAddress(tx.params[1], env.EZKDA_WALLET)) return;

    console.log("DEPOSIT event:", {
      from: tx.params[0],
      to: tx.params[1],
      amount: tx.params[2],
      height,
    });

    pactEvents.emit("RAFFLE_ENTRY", {
      address: tx.params[0],
      amount: tx.params[2],
    });

    setLastProcessedBlock(height);
  });
};

// loop from last known block to latest
const catchUp = async (lastProcessed, latestBlockHeight) => {
  let height;

  for (height = lastProcessed + 1; height < latestBlockHeight; height++) {
    await handleNewDeposit(height);
  }

  return height;
};

export const listenForTxs = async () => {
  // 5746774 = test tx
  const lastProcessed =
    getLastProcessedBlock() ?? 5746855 ?? (await getLatestHeight()) - 1;
  const latestBlockHeight = await getLatestHeight();

  const height = await catchUp(lastProcessed, latestBlockHeight);

  let catchUpHeight = height;

  while (true) {
    console.log("Polling...");

    const currentLatestBlock = await getLatestHeight();

    if (catchUpHeight < currentLatestBlock) {
      await handleNewDeposit(catchUpHeight);

      catchUpHeight++;
    }

    await new Promise((res) => setTimeout(res, 10000));
  }

  // let lastProcessed =
  //   getLastProcessedBlock() ?? 5746764 ?? (await getLatestHeight()) - 1;

  // console.log("Starting from height:", lastProcessed);

  // while (true) {
  //   try {
  //     lastProcessed = await catchUp(lastProcessed);
  //   } catch (err) {
  //     console.error("Error while catching up:", err);
  //   }

  //   // wait 10s before checking again
  //   await new Promise((res) => setTimeout(res, 3000));
  // }
};

// handleNewDeposit(5746774);
// catchUp(5746764, 5746784);
// listenForTxs();
