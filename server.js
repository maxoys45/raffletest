import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

import { pickRandomWinner, winnerData } from "./helpers/raffle.js";
import { RAFFLE_MAX_PLAYERS } from "./shared/config.js";

const wss = new WebSocketServer({ port: 8080 });

const globals = {
  // Users
  // currentUsers: [],
  // Raffle
  currentEntries: [],
  queuedEntries: [],
  pickingWinner: false,
};

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send current raffle state to new client
  // ws.send(JSON.stringify({ type: "CURRENT_USERS", users: globals.currentUsers }));

  ws.send(
    JSON.stringify({ type: "RAFFLE_ENTRIES", entries: globals.currentEntries })
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

      handleNewEntry({ amount, address, id: uuidv4() });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Broadcast helper function
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      console.log(data);

      client.send(JSON.stringify(data));
    }
  });
};

// Handle new raffle entry
const handleNewEntry = (entry) => {
  if (globals.pickingWinner) {
    globals.queuedEntries.push(entry);

    broadcast({ type: "QUEUED_ENTRY", entry });
  } else {
    globals.currentEntries.push(entry);

    broadcast({
      type: "ENTRY_ACCEPTED",
      id: entry.id,
      amount: entry.amount,
      address: entry.address,
    });

    if (globals.currentEntries?.length >= RAFFLE_MAX_PLAYERS) {
      broadcast({ type: "POT_FULL" });

      startPickingWinner();
    }
  }
};

const startPickingWinner = () => {
  globals.pickingWinner = true;

  // broadcast({ type: "PICKING_WINNER", entries: globals.currentEntries });

  const winner = pickRandomWinner(globals.currentEntries);

  broadcast({
    type: "WINNER_CHOSEN",
    ...winnerData(winner, globals.currentEntries),
  });

  globals.currentEntries = globals.queuedEntries.splice(0, RAFFLE_MAX_PLAYERS);

  globals.pickingWinner = false;

  // If the pot is full again, pick another winner.
  // if (globals.currentEntries.length >= RAFFLE_MAX_PLAYERS) {
  //   startPickingWinner();
  // }
};

console.log("WebSocket server running on ws://localhost:8080");
