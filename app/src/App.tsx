// @ts-nocheck

import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { motion, AnimatePresence, useAnimation } from "framer-motion";

import EntryGroup from "./components/EntryGroup";

import "./App.css";

function App() {
  const [ws, setWs] = useState(null);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [entries, setEntries] = useState([]);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [spinning, setSpinning] = useState(false);

  const containerRef = useRef(null);
  const carouselRef = useRef(null);
  const controls = useAnimation();

  const maxEntries = 4;
  const numOfloops = 20;

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

        case "PICKING_WINNER":

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

  // const checkingIn = (event: React.SyntheticEvent<HTMLFormElement>) => {
  //   event.preventDefault();

  //   if (ws && username.trim()) {
  //     ws.send(JSON.stringify({ type: "CHECKING_IN", user: username }));
  //     setUsername("");
  //   }
  // };

  const enterRaffle = (event) => {
    event.preventDefault();

    ws.send(
      JSON.stringify({ type: "RAFFLE_ENTRY", amount: Number(amount), address })
    );

    setAmount("");
    setAddress("");
  };

  // Spin when entries reaches 5
  useEffect(() => {
    if (entries.length === maxEntries && !spinning) {
      setTimeout(() => {
        setSpinning(true);
      }, 1000);
    }
  }, [entries, spinning]);

  // Spin animation
  useEffect(() => {
    if (carouselRef.current && spinning) {
      const totalWidth = containerRef.current.offsetWidth;

      console.log(totalWidth);

      controls
        .start({
          x: [-0, -totalWidth * (numOfloops - 1)],
          transition: {
            x: {
              duration: 3, // adjust speed here
              ease: [0.5, 0, 0, 1],
            },
          },
        })
        .then(() => {
          // controls.set({ x: 0 });
          // setEntries([]);
          // setSpinning(false);
        });
    }
  }, [spinning, entries, controls]);

  const renderEntries = spinning
    ? Array(numOfloops + 1)
        .fill(entries)
        .flat()
    : entries;

  return (
    <div className="p-4">
      <div
        ref={containerRef}
        className=" overflow-hidden max-w-[640px] w-[640px] rounded-full mb-4 bg-black"
      >
        <motion.div
          ref={carouselRef}
          className={clsx(
            "flex h-[30px]",
            entries.length > 1 && "flex-row-reverse",
            !spinning && "w-full"
          )}
          style={spinning ? { width: `${(numOfloops + 1) * 100}%` } : {}}
          animate={controls}
        >
          <AnimatePresence>
            {renderEntries.map((entry, index) => {
              const originalIndex = index % entries.length;

              return (
                <EntryGroup
                  key={index}
                  entry={entry}
                  index={originalIndex}
                  spinning={spinning}
                />
              );
            })}
          </AnimatePresence>
        </motion.div>
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

      <form className="flex gap-2 mt-4 justify-center" onSubmit={enterRaffle}>
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

export default App;
