import dotenv from "dotenv";

dotenv.config();

// /**
//  * Config
//  */
const config = {
  NETWORK: "testnet04", // "mainnet01" for mainnet
  EVENT_HOST: "https://api.testnet.chainweb.com", // chainweb API host (default for testnet)
  DEPTH: 2, // confirmation depth to avoid orphans
  CHAIN_ID: 0,
  GAS_PRICE: 0.00001,
  GAS_LIMIT: 1500,
  TTL: 28800, // 8 hour
  WATCH_ADDR:
    "k:cf0e0d2a3bb872e6332a8532d0e0b90dd98522990603422b96b083ee9f5407d2",
};

const env = {
  // Wallet
  EZKDA_WALLET: process.env.EZKDA_WALLET,
  EZKDA_PUBLIC_KEY: process.env.EZKDA_PUBLIC_KEY,
  EZKDA_PRIVATE_KEY: process.env.EZKDA_PRIVATE_KEY,
  // Raffle
  MAX_PLAYERS: Number(process.env.RAFFLE_MAX_PLAYERS) || 10,
  HOUSE_CUT: Number(process.env.HOUSE_CUT) || 0.05,
  TIMINGS_COUNTDOWN: Number(process.env.RAFFLE_TIMINGS_COUNTDOWN) || 5000,
  TIMINGS_SPIN_DURATION:
    Number(process.env.RAFFLE_TIMINGS_SPIN_DURATION) || 3000,
  TIMINGS_WINNER_SCREEN:
    Number(process.env.RAFFLE_TIMINGS_WINNER_SCREEN) || 5000,
  TICKET_SCALE: Number(process.env.TICKET_SCALE) || 1000,
};

config.TX_HOST = `https://api.testnet.chainweb.com/chainweb/0.0/${config.NETWORK}/chain/${config.CHAIN_ID}/pact`;

export { config, env };
