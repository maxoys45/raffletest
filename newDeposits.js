import cron from "node-cron";

import { pollDeposits } from "./graphql.js";

let lastCursor = null;
let failureCount = 0;

// async function main() {
//   const { deposits, lastCursor: newCursor } = await pollDeposits(lastCursor, "2");
//   lastCursor = newCursor;

//   deposits.forEach(dep => {
//     console.log(`Received ${dep.amount} KDA from ${dep.from} in block ${dep.blockHeight}`);
//   });
// }

// // Poll every 20 seconds
// setInterval(main, 20000);

/**
 * Wrapper to safely poll deposits with retry/backoff
 */
async function safePoll() {
  try {
    const { deposits, lastCursor: newCursor } = await pollDeposits(
      lastCursor,
      "0"
    );
    lastCursor = newCursor;

    // Reset failure counter on success
    failureCount = 0;

    console.log("SUCCESS");
    deposits.forEach((dep) => {
      console.log(
        `[${new Date().toISOString()}] Received ${dep.amount} KDA from ${
          dep.from
        } in block ${dep.blockHeight}`
      );
    });
  } catch (err) {
    failureCount++;
    console.error(
      // `[${new Date().toISOString()}] Error polling deposits (attempt ${failureCount}): ${
      //   err.message
      // }. Retrying in ${delay / 1000}s`
      `[${new Date().toISOString()}] Error polling deposits (attempt ${failureCount})`
    );
  }
}

// Schedule polling every 60 seconds
cron.schedule("*/10 * * * * *", async () => {
  try {
    await safePoll();
  } catch (err) {
    console.log("Polling error:", err.message);
  }
});
