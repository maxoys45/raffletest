import { WebSocketServer } from "ws";

import { pickRandomWinner } from "./helpers/raffle.js";

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

  // ws.send(
  //   JSON.stringify({ type: "RAFFLE_ENTRIES", entries: globals.currentEntries })
  // );

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

      handleNewEntry({ amount, address });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Broadcast helper function
const broadcast = (data) => {
  console.log("broadcast", data);

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      console.log("client is OPEN");
      client.send(JSON.stringify(data));
    }
  });
};

// Handle new raffle entry
const handleNewEntry = (entry) => {
  console.log(1);
  console.log(entry);

  if (globals.pickingWinner) {
    console.log(2);
    globals.queuedEntries.push(entry);

    broadcast({ type: "QUEUED_ENTRY", entry });
  } else {
    console.log(3);
    globals.currentEntries.push(entry);

    broadcast({
      type: "ENTRY_ACCEPTED",
      amount: entry.amount,
      address: entry.address,
    });

    if (globals.currentEntries?.length >= 10) {
      console.log(4);
      startPickingWinner();
    }
  }

  console.log(globals.currentEntries);
};

const startPickingWinner = () => {
  globals.pickingWinner = true;

  broadcast({ type: "PICKING_WINNER", entries: globals.currentEntries });

  setTimeout(() => {
    const winner = pickRandomWinner(globals.currentEntries);

    broadcast({ TYPE: "WINNER_CHOSEN", winner });

    globals.currentEntries = globals.queuedEntries.splice(0, 10);

    globals.pickingWinner = false;

    // If the pot is full again, pick another winner.
    if (globals.currentEntries.length >= 10) {
      startPickingWinner();
    }
  }, 5000);
};

console.log("WebSocket server running on ws://localhost:8080");
