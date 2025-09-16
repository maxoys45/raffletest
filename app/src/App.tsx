import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { motion, animate } from "motion/react";
import { Tooltip } from "react-tooltip";

import Entry from "./components/Entry";
import WinnerBar from "./components/WinnerBar";
import WinnerCountdown from "./components/WinnerCountdown";

import { spinAnimation } from "./helpers";

import type { FormEvent } from "react";
import type { EntriesType, WinnerType } from "./@types";

import "./App.css";

function App() {
  const wsRef = useRef<WebSocket | null>(null);
  // const [users, setUsers] = useState([]);
  // const [username, setUsername] = useState("");
  const [entries, setEntries] = useState<EntriesType>([]);
  const [queuedEntries, setQueuedEntries] = useState<EntriesType>([]);
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [spinning, setSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<WinnerType | null>(null);
  const [showWinner, setShowWinner] = useState<boolean>(false);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const numOfLoops = 15; // @TEMP

  // Send message over web socket.
  const sendSocketMessage = (msg: object) => {
    const socket = wsRef.current;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg));
    }
  };

  useEffect(() => {
    // Connect to WebSocket server
    const socket = new WebSocket("ws://localhost:8080");

    wsRef.current = socket;

    socket.onopen = () => {
      // Create some kind of welcome to the site popup
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log("data type", data.type);

      console.log("data", data);

      switch (data.type) {
        case "RAFFLE_ENTRIES":
          setEntries(data.entries);

          break;

        case "ENTRY_ACCEPTED":
          console.log(`amount=${data.amount} address=${data.address}`);

          setEntries((prev) => [
            ...prev,
            {
              amount: data.amount,
              address: data.address,
              id: data.id,
              color: data.color,
            },
          ]);

          break;

        case "QUEUED_ENTRIES":
          setQueuedEntries(data.entries);

          break;

        case "QUEUED_ENTRY":
          setQueuedEntries((prev) => [
            ...prev,
            {
              amount: data.amount,
              address: data.address,
              id: data.id,
              color: data.color,
            },
          ]);

          break;

        case "POT_FULL":
          setShowCountdown(true);

          break;

        // case "PICKING_WINNER":
        //   break;

        case "WINNER_CHOSEN":
          const { type, ...rest } = data;

          console.log(data);

          setWinner(rest);

          break;

        default:
          console.log("Unknown data.type");
      }
    };

    socket.onclose = () => {
      console.log("Disconnected from server");
    };

    // Cleanup on unmount
    return () => {
      socket.close();
      wsRef.current = null;
    };
  }, []);

  // const checkingIn = (event: React.SyntheticEvent<HTMLFormElement>) => {
  //   event.preventDefault();

  //   if (ws && username.trim()) {
  //     ws.send(JSON.stringify({ type: "CHECKING_IN", user: username }));
  //     setUsername("");
  //   }
  // };

  const enterRaffle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    sendSocketMessage({
      type: "RAFFLE_ENTRY",
      amount: Number(amount),
      address,
    });

    setAmount("");
    setAddress("");
  };

  // Spin animation
  useEffect(() => {
    if (carouselRef.current && containerRef.current && spinning && winner) {
      const targetX = spinAnimation(
        containerRef.current,
        entries,
        winner,
        numOfLoops
      );

      animate(
        carouselRef.current,
        { x: [0, Math.round(targetX)] },
        { duration: 3, ease: [0.5, 0, 0, 1] }
      ).then(() => {
        setShowWinner(true);

        animate(
          carouselRef.current!,
          { opacity: 0 },
          { duration: 0.5, delay: 5, ease: "easeInOut" }
        ).then(() => {
          setSpinning(false);
          setWinner(null);
          setShowWinner(false);

          animate(carouselRef.current!, { x: 0, opacity: 1 });

          sendSocketMessage({
            type: "POT_RESET",
          });
        });
      });
    }
  }, [spinning, entries, winner]);

  const renderEntries = spinning
    ? Array(numOfLoops + 1)
        .fill(entries)
        .flat()
    : entries;

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold">🎟️ EZ KDA</h1>

      <WinnerBar winner={winner} showWinner={showWinner} />

      {showCountdown && (
        <WinnerCountdown
          setShowCountdown={setShowCountdown}
          setSpinning={setSpinning}
        />
      )}

      <div>
        <div className="mx-auto mt-6 mb-4 max-w-[644px] overflow-hidden rounded-full border-2 border-black shadow-md">
          <div ref={containerRef} className="bet-bar">
            <motion.div
              ref={carouselRef}
              className={clsx("flex h-[30px]", !spinning && "w-full")}
              style={spinning ? { width: `${(numOfLoops + 1) * 100}%` } : {}}
            >
              {renderEntries.map((entry, index) => {
                const originalIndex = index % entries.length;

                console.log("entry", entry);

                return (
                  <Entry
                    key={index}
                    entry={entry}
                    index={originalIndex}
                    spinning={spinning}
                  />
                );
              })}
            </motion.div>
          </div>
        </div>

        <Tooltip
          id="entry-tooltip"
          float="true"
          style={{ padding: "0.2em 0.5em", fontWeight: "bold", zIndex: 20 }}
        />
      </div>

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

      <form className="mt-4 flex justify-center gap-2" onSubmit={enterRaffle}>
        <input
          className="rounded-sm bg-white p-1 leading-1 text-black outline-0"
          type="number"
          value={amount}
          min="1"
          max="50"
          onChange={(event) => setAmount(event.target.value)}
        />

        <input
          className="rounded-sm bg-white p-1 leading-1 text-black outline-0"
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />

        <button className="cursor-pointer rounded-lg bg-green-400 px-4 py-2 font-medium text-black transition-colors hover:bg-green-300">
          Enter
        </button>
      </form>

      {/* <ul className="mt-4 space-y-2">
        {users.map((user, i) => (
          <li key={i} className="rounded bg-gray-100 p-2">
            {user} has checked in!
          </li>
        ))}
      </ul> */}

      <div className="mt-10 grid grid-cols-2 gap-2">
        <div className="">
          <h2>Entries:</h2>
          <ul className="">
            {entries.map((entry, index) => (
              <li key={index}>
                {entry.id}: {entry.amount}
              </li>
            ))}
          </ul>
        </div>

        <div className="">
          <h2>Queue:</h2>
          <ul className="">
            {queuedEntries.map((entry, index) => (
              <li key={index}>
                {entry.id}: {entry.amount}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
