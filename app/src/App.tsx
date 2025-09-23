import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { motion, animate } from "motion/react";
import { Tooltip } from "react-tooltip";

import Entry from "./components/Entry";
import WinnerBar from "./components/WinnerBar";
import WinnerCountdown from "./components/WinnerCountdown";
import Stats from "./components/Stats";
import EntryQueue from "./components/EntryQueue";
import ChatBox from "./components/ChatBox";
import SplashScreen from "./components/SplashScreen";

import { spinAnimation } from "./helpers";

import type { FormEvent } from "react";
import type {
  EntryType,
  StatusType,
  WinnerType,
  StatsType,
  ChatMessageType,
} from "./@types";

import "./App.css";

function App() {
  const wsRef = useRef<WebSocket | null>(null);
  const animatedEntriesRef = useRef<EntryType[]>([]);
  const hasAnimatedRef = useRef<boolean>(false);
  // const [users, setUsers] = useState([]);
  // const [username, setUsername] = useState("");
  const [entries, setEntries] = useState<EntryType[]>([]);
  const [queuedEntries, setQueuedEntries] = useState<EntryType[]>([]);
  const [status, setStatus] = useState<StatusType>("OPEN");
  const [spinning, setSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<WinnerType | null>(null);
  const [lastWinner, setLastWinner] = useState<WinnerType | null>(null);
  const [showWinner, setShowWinner] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [stats, setStats] = useState<StatsType | null>(null);

  // Raffle form
  const [amount, setAmount] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // Chat form
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);

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
      console.log("Connected to server");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "GAME_STATE") {
        const { state } = data;

        // console.table(state);

        setStatus(state.status);

        setEntries(state.pot);

        setQueuedEntries(state.queued);

        if (state.status === "SPINNING" && state.winner) {
          animatedEntriesRef.current = state.pot;
        }

        setCountdown(state.countdownEndsAt);

        setSpinning(
          state.status === "SPINNING" || state.status === "SHOW_WINNER"
        );

        setShowWinner(state.status === "SHOW_WINNER");

        setWinner(state.winner);

        if (state.status === "SHOW_WINNER") {
          setLastWinner(state.winner);
        }

        // We don't want someone to see the updated stats while a pot is rolling.
        if (state.status === "OPEN" || state.status === "SHOW_WINNER") {
          setStats(state.stats);
        }
      }

      if (data.type === "CHAT_UPDATE") {
        setChatMessages((prev) => {
          const updated = [
            ...(prev ?? []),
            {
              alias: data.alias,
              msg: data.msg,
              timestamp: data.timestamp,
            },
          ];

          return updated.slice(-10);
        });
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

  // A user enters the raffle.
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

  // Setup the animated entries.
  // useLayoutEffect(() => {
  //   if (spinning && winner && !prevSpinningRef.current) {
  //     animatedEntriesRef.current = entries;
  //   }

  //   prevSpinningRef.current = spinning;
  // }, [spinning, winner, entries]);

  // Spin animation
  useEffect(() => {
    if (!carouselRef.current || !containerRef.current) return;

    if (
      spinning &&
      winner &&
      animatedEntriesRef.current.length &&
      !hasAnimatedRef.current
    ) {
      hasAnimatedRef.current = true;

      const targetX = spinAnimation(
        containerRef.current,
        animatedEntriesRef.current,
        winner,
        numOfLoops
      );

      animate(
        carouselRef.current,
        { x: [0, Math.round(targetX)] },
        {
          duration: import.meta.env.VITE_RAFFLE_TIMINGS_SPIN_DURATION / 1000,
          ease: [0.5, 0, 0, 1],
        }
      );
    } else if (!spinning) {
      hasAnimatedRef.current = false;

      animate(carouselRef.current, { x: 0 });
    }
  }, [status, winner]);

  const renderEntries = spinning
    ? Array(numOfLoops + 1)
        .fill(animatedEntriesRef.current)
        .flat()
    : entries;

  return (
    <>
      <div className="mx-auto max-w-[1280px] p-4 text-center">
        <h1 className="mb-6 text-4xl font-bold">🎟️ EZ KDA</h1>

        <div>
          <div className="mx-auto mt-6 mb-4 max-w-[644px] overflow-hidden rounded-full border-2 border-black shadow-md">
            <div ref={containerRef} className="bet-bar">
              <motion.div
                ref={carouselRef}
                className={clsx("flex h-[30px]", !spinning && "w-full")}
                style={spinning ? { width: `${(numOfLoops + 1) * 100}%` } : {}}
              >
                {renderEntries.map((entry, index) => {
                  return (
                    <Entry key={index} entry={entry} spinning={spinning} />
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

        <WinnerBar lastWinner={lastWinner} showWinner={showWinner} />

        <WinnerCountdown countdown={countdown} />

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

          <button
            className="cursor-pointer rounded-lg bg-green-400 px-4 py-2 font-medium text-black transition-colors hover:bg-green-300"
            type="submit"
          >
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

        {stats && <Stats stats={stats} />}

        <EntryQueue entries={entries} queuedEntries={queuedEntries} />
      </div>

      <ChatBox
        chatMessages={chatMessages}
        sendSocketMessage={sendSocketMessage}
      />

      <SplashScreen />
    </>
  );
}

export default App;
