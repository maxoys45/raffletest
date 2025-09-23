import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

import type { FormEvent } from "react";
import type { ChatMessageType } from "../@types";

const ChatBox = ({
  chatMessages,
  sendSocketMessage,
}: {
  chatMessages: ChatMessageType[];
  sendSocketMessage: (msg: object) => void;
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [newChatMessage, setNewChatMessage] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [chatMessages]);

  // A user sends a message in chat.
  const newChatMsg = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newChatMessage.trim()) return;

    let randomName;

    if (localStorage.getItem("randomName")) {
      randomName = localStorage.getItem("randomName");
    } else {
      randomName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
      });

      localStorage.setItem("randomName", randomName);
    }

    sendSocketMessage({
      type: "NEW_CHAT_MESSAGE",
      msg: newChatMessage,
      alias: randomName,
    });

    setNewChatMessage("");
  };

  const isOwnMsg = (alias: string) => {
    return alias === localStorage.getItem("randomName");
  };

  /**
   * transparent thing for fading out top messages
   * before:absolute before:top-0 before:right-0 before:left-0 before:z-10 before:h-6 before:bg-gradient-to-b before:from-white before:to-white/0
   */

  return (
    <div className="absolute right-0 bottom-0 z-10 mr-2 mb-2 flex w-full max-w-[280px] flex-col gap-2 rounded-sm border-1 border-black bg-white pb-2 pl-2 text-black">
      <div
        className="relative flex h-[200px] flex-col gap-3 overflow-y-auto pt-2 pr-2"
        ref={containerRef}
      >
        {chatMessages.map((chatMsg) => (
          <div
            className={clsx(
              "relative rounded-sm px-2 py-1 after:absolute after:top-full after:h-0 after:w-0 after:border-t-[6px] after:border-r-[4px] after:border-l-[4px] after:border-r-transparent after:border-l-transparent",
              isOwnMsg(chatMsg.alias)
                ? "bg-green-200 text-right after:right-2 after:border-t-green-200"
                : "bg-gray-200 after:left-2 after:border-t-gray-200"
            )}
            key={chatMsg.timestamp}
          >
            <p className="text-xs font-medium italic">{chatMsg.alias}:</p>
            <p className="text-sm">{chatMsg.msg}</p>
          </div>
        ))}
      </div>

      <form className="flex gap-2 pr-2" onSubmit={newChatMsg}>
        <input
          className="grow-1 rounded-lg border-1 border-black bg-gray-100 px-2 py-1 text-sm"
          type="text"
          value={newChatMessage}
          onChange={(event) => setNewChatMessage(event.target.value)}
        />

        <button
          className="cursor-pointer rounded-lg bg-gray-950 px-3 py-1 text-white transition-colors hover:bg-gray-900"
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
