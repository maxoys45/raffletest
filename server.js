import dotenv from "dotenv";
import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

import { pickRandomWinner, winnerData, barColors } from "./helpers/raffle.js";

dotenv.config();

const wss = new WebSocketServer({ port: 8080 });

const env = {
  MAX_PLAYERS: Number(process.env.RAFFLE_MAX_PLAYERS) || 10,
  HOUSE_CUT: Number(process.env.HOUSE_CUT) || 0.05,
  TIMINGS_COUNTDOWN: Number(process.env.RAFFLE_TIMINGS_COUNTDOWN) || 5000,
  TIMINGS_SPIN_DURATION:
    Number(process.env.RAFFLE_TIMINGS_SPIN_DURATION) || 3000,
  TIMINGS_WINNER_SCREEN:
    Number(process.env.RAFFLE_TIMINGS_WINNER_SCREEN) || 5000,
};

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
        color: null,
      };

      if (gameState.status === "OPEN") {
        entry.color = assignColor();

        gameState.pot.push(entry);

        broadcastGameState();

        if (gameState.pot.length >= env.MAX_PLAYERS) {
          advanceGame("COUNTDOWN");
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
  console.log(gameState);

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
  if (!globals.availableColors || globals.availableColors.length === 0) {
    return "#FFFFFF";
  }

  const index = Math.floor(Math.random() * globals.availableColors.length);
  const color = globals.availableColors[index];

  globals.availableColors.splice(index, 1);

  return color;
};

// Advance the raffle to the next phase.
const advanceGame = (nextStatus) => {
  // Clear timer
  if (globals.phaseTimer) {
    clearTimeout(globals.phaseTimer);
    globals.phaseTimer = null;
  }

  gameState.status = nextStatus;

  switch (nextStatus) {
    case "COUNTDOWN":
      gameState.countdownEndsAt = Date.now() + env.TIMINGS_COUNTDOWN;

      globals.phaseTimer = setTimeout(
        () => advanceGame("SPINNING"),
        env.TIMINGS_COUNTDOWN
      );

      break;

    case "SPINNING":
      gameState.winner = pickWinner(gameState.pot);
      gameState.countdownEndsAt = null;

      globals.phaseTimer = setTimeout(
        () => advanceGame("SHOW_WINNER"),
        env.TIMINGS_SPIN_DURATION
      );

      break;

    case "SHOW_WINNER":
      globals.phaseTimer = setTimeout(
        () => advanceGame("OPEN"),
        env.TIMINGS_WINNER_SCREEN
      );

      break;

    case "OPEN":
      gameState.winner = null;
      gameState.countdownEndsAt = null;
      globals.availableColors = [...barColors];
      gameState.pot = [];

      if (gameState.queued.length) {
        const take = Math.min(env.MAX_PLAYERS, gameState.queued.length);
        const moved = gameState.queued.splice(0, take);

        moved.forEach((entry) => {
          entry.color = assignColor();
        });

        gameState.pot = moved;
      }

      broadcastGameState();

      if (gameState.pot.length >= env.MAX_PLAYERS) {
        setImmediate(() => {
          if (gameState.status === "OPEN") advanceGame("COUNTDOWN");
        });
      }

      return;
  }

  broadcastGameState();
};

// Select the winning entry and return the data.
const pickWinner = (entries) => {
  const winner = pickRandomWinner(entries);

  return winnerData(winner, entries, env.HOUSE_CUT);
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
//     globals.currentEntries?.length >= process.env.RAFFLE_MAX_PLAYERS
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
//       process.env.RAFFLE_MAX_PLAYERS
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
