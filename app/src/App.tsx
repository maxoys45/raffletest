import { useState, useEffect } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

function App() {
  const [ws, setWs] = useState(null);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [entries, setEntries] = useState([]);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    // Connect to WebSocket server
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      // Create some kind of welcome to the site popup
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // const { type } = data;

      // if (data.type === "CURRENT_USERS") {
      //   setUsers(data.users);
      // } else if (data.type === "USERS_UPDATE") {
      //   setUsers((prev) => [...prev, data.user]);
      // } else if (data.type === "RAFFLE_ENTRIES") {
      //   setEntries(data.entries);
      // } else if (data.type === "ENTRIES_UPDATE") {
      //   setEntries((prev) => [
      //     ...prev,
      //     { amount: data.amount, address: data.address },
      //   ]);
      // }

      switch (data.type) {
        case "RAFFLE_ENTRIES":
          setEntries(data.entries);
          break;

        case "ENTRY_ACCEPTED":
          console.log(`amount=${data.amount} address=${data.address}`);

          setEntries((prev) => [
            ...prev,
            { amount: data.amount, address: data.address },
          ]);
          break;

        default:
          console.log("Unknown data.type");
      }
      if (data.type === "ENTRY_ACCEPTED") {
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from server");
    };

    setWs(socket);

    // Cleanup on unmount
    return () => socket.close();
  }, []);

  const checkingIn = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (ws && username.trim()) {
      ws.send(JSON.stringify({ type: "CHECKING_IN", user: username }));
      setUsername("");
    }
  };

  const enterRaffle = (event) => {
    event.preventDefault();

    ws.send(
      JSON.stringify({ type: "RAFFLE_ENTRY", amount: Number(amount), address })
    );
    setAmount("");
    setAddress("");
  };

  console.log("Current entries");
  console.dir(entries);

  return (
    <div className="p-4">
      <div className="flex flex-row-reverse gap-[1px] w-full h-[30px] bg-black max-w-[640px] rounded-full mb-4 overflow-hidden">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <EntryGroup key={index} entry={entry} index={index} />
          ))}
        </AnimatePresence>
      </div>

      <h1 className="text-4xl font-bold">🎟️ Raffle Updates</h1>

      {/* <form onSubmit={checkingIn}>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
          Check in!
        </button>
      </form> */}

      <form className="flex gap-2 mt-4" onSubmit={enterRaffle}>
        <input
          className="bg-white rounded-sm p-1 leading-1 text-black outline-0"
          type="number"
          value={amount}
          max="50"
          onChange={(event) => setAmount(event.target.value)}
        />

        <input
          className="bg-white rounded-sm p-1 leading-1 text-black outline-0"
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />

        <button className="px-4 py-2 bg-green-400 text-black cursor-pointer hover:bg-green-300 transition-colors font-medium rounded-lg">
          Enter
        </button>
      </form>

      <ul className="mt-4 space-y-2">
        {users.map((user, i) => (
          <li key={i} className="p-2 bg-gray-100 rounded">
            {user} has checked in!
          </li>
        ))}
      </ul>
    </div>
  );
}

const EntryGroup = ({ entry, index }) => {
  const colors = [
    "#FF0000",
    "#00FFFF",
    "#FF8000",
    "#0080FF",
    "#FFFF00",
    "#8000FF",
    "#80FF00",
    "#FF00FF",
    "#00FF80",
    "#FF0080",
  ];

  return (
    <motion.div
      className="basis-0 shrink-0"
      layout
      initial={{ flexGrow: 0 }}
      animate={{
        flexGrow: entry.amount,
        transition: { duration: 0.5, delay: 0.2, ease: "easeInOut" },
      }}
      exit={{ flexGrow: 0 }}
      style={{ backgroundColor: colors[index] }}
    ></motion.div>
  );
};

export default App;
