import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { motion, AnimatePresence, useAnimation } from "motion/react";

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
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [spinning, setSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<WinnerType | null>(null);
  const [showWinner, setShowWinner] = useState<boolean>(false);
  const [showCountdown, setShowCountdown] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const controls = useAnimation();

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
            { amount: data.amount, address: data.address, id: data.id },
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

      controls
        .start({
          x: [0, Math.round(targetX)],
          transition: {
            x: {
              duration: 3,
              ease: [0.5, 0, 0, 1],
            },
          },
        })
        .then(() => {
          setShowWinner(true);

          controls
            .start({
              opacity: 0,
              transition: { duration: 0.5, delay: 5, ease: "easeInOut" },
            })
            .then(() => {
              setEntries([]);
              setSpinning(false);
              setWinner(null);
              setShowWinner(false);

              controls.set({ x: 0, opacity: 1 });
            });
        });
    }
  }, [spinning, entries, controls, winner]);

  // .then(() => {
  //         setTimeout(() => {
  //           controls.
  //         }, 5000)
  //       })

  const renderEntries = spinning
    ? Array(numOfLoops + 1)
        .fill(entries)
        .flat()
    : entries;

  return (
    <div className="p-4">
      <WinnerBar winner={winner} showWinner={showWinner} />

      {showCountdown && (
        <WinnerCountdown
          setShowCountdown={setShowCountdown}
          setSpinning={setSpinning}
        />
      )}

      <div className="mt-6 mb-4 overflow-hidden rounded-full border-2 border-black shadow-md">
        <div ref={containerRef} className="bet-bar">
          <motion.div
            ref={carouselRef}
            className={clsx(
              "flex h-[30px]",
              // entries.length > 1 && "flex-row-reverse",
              !spinning && "w-full"
            )}
            style={spinning ? { width: `${(numOfLoops + 1) * 100}%` } : {}}
            animate={controls}
          >
            <AnimatePresence>
              {renderEntries.map((entry, index) => {
                const originalIndex = index % entries.length;

                return (
                  <Entry
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
    </div>
  );
}

export default App;
