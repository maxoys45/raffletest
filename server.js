import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

import { pickRandomWinner, winnerData, barColors } from "./helpers/raffle.js";
import { RAFFLE_MAX_PLAYERS } from "./shared/config.js";

const wss = new WebSocketServer({ port: 8080 });

const globals = {
  availableColors: [...barColors],
  phaseTimer: null,
};

const gameState = {
  pot: [],
  queued: [],
  status: "OPEN",
  countdownEndsAt: null,
  winner: null,
};

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.send(
    JSON.stringify({
      type: "GAME_STATE",
      state: gameState,
    })
  );

  // Listen for messages from client
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);

    console.log("Received:", data);

    // if (data.type === "CHECKING_IN") {
    //   const { user } = data;

    //   globals.currentUsers.push(user);

    //   broadcast({ type: "USERS_UPDATE", user });
    // }

    if (data.type === "RAFFLE_ENTRY") {
      const { amount, address } = data;

      const entry = {
        id: uuidv4(),
        address,
        amount,
        color: assignColor(),
      };

      if (gameState.status === "OPEN") {
        gameState.pot.push(entry);

        if (gameState.pot.length >= RAFFLE_MAX_PLAYERS) {
          advanceGame("COUNTDOWN");
        } else {
          broadcastGameState();
        }
      } else {
        gameState.queued.push(entry);

        broadcastGameState();
      }
    } else {
      console.log("Unknown message type:", data.type);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Broadcast helper function
const broadcastGameState = () => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "GAME_STATE",
          state: gameState,
        })
      );
    }
  });
};

// Assign a random color to a bet which hasn't been used yet in the current pot.
const assignColor = () => {
  const index = Math.floor(Math.random() * globals.availableColors.length);
  const color = globals.availableColors[index];

  globals.availableColors.splice(index, 1);

  return color;
};

// Advance the raffle to the next phase.
const advanceGame = (nextStatus) => {
  let durationMs = null;

  if (globals.phaseTimer) clearTimeout(globals.phaseTimer);

  gameState.status = nextStatus;

  switch (nextStatus) {
    case "COUNTDOWN":
      durationMs = 5000;
      gameState.countdownEndsAt = Date.now() + durationMs;

      break;

    case "SPINNING":
      durationMs = 3000;
      gameState.winner = pickWinner(gameState.pot);

      break;

    case "SHOW_WINNER":
      durationMs = 5000;

      break;
      1;

    case "OPEN":
      durationMs = null;

      gameState.pot = [];
      gameState.queued = gameState.queued;
      gameState.status = "OPEN";
      gameState.countdownEndsAt = null;
      gameState.winner = null;

      break;
  }

  broadcastGameState();

  if (durationMs) {
    globals.phaseTimer = setTimeout(() => {
      if (nextStatus === "COUNTDOWN") {
        advanceGame("SPINNING");
      } else if (nextStatus === "SPINNING") {
        advanceGame("SHOW_WINNER");
      } else if (nextStatus === "SHOW_WINNER") {
        advanceGame("OPEN");
      }
    }, durationMs);
  }
};

const pickWinner = (entries) => {
  const winner = pickRandomWinner(entries);

  return winnerData(winner, entries);
};

// Handle new raffle entry
// const handleNewEntry = (entry) => {
//   let broadcastType;

//   if (globals.pickingWinner) {
//     globals.queuedEntries.push(entry);

//     broadcastType = "QUEUED_ENTRY";
//   } else {
//     globals.currentEntries.push(entry);

//     broadcastType = "ENTRY_ACCEPTED";
//   }

//   broadcast({
//     type: broadcastType,
//     id: entry.id,
//     amount: entry.amount,
//     address: entry.address,
//     color: entry.color,
//   });

//   shouldPickWinner();
// };

// const shouldPickWinner = () => {
//   if (
//     !globals.pickingWinner &&
//     globals.currentEntries?.length >= RAFFLE_MAX_PLAYERS
//   ) {
//     broadcast({ type: "POT_FULL" });

//     globals.potFull = true;

//     pickWinner();
//   }
// };

// const resetPot = () => {
//   globals.pickingWinner = false;
//   globals.currentEntries = [];
//   globals.availableColors = [...barColors];
//   globals.potFull = false;

//   if (globals.queuedEntries.length) {
//     globals.currentEntries = globals.queuedEntries.splice(
//       0,
//       RAFFLE_MAX_PLAYERS
//     );
//   }

//   console.log("queue", globals.queuedEntries);

//   broadcast({
//     type: "RAFFLE_ENTRIES",
//     entries: globals.currentEntries,
//   });

//   broadcast({
//     type: "QUEUED_ENTRIES",
//     entries: globals.queuedEntries,
//   });

//   shouldPickWinner();
// };

console.log("WebSocket server running on ws://localhost:8080");
