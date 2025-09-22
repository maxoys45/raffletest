import clsx from "clsx";

import { toPercent } from "../helpers";

import type { WinnerType } from "../@types";

const WinnerBar = ({
  lastWinner,
  showWinner,
}: {
  lastWinner: WinnerType | null;
  showWinner: boolean;
}) => {
  return (
    <h2
      className={clsx(
        "flex flex-wrap items-baseline justify-center gap-2 transition-opacity",
        showWinner ? "opacity-100" : "opacity-0"
      )}
    >
      <span>The winner is</span>

      <span className="flex items-center gap-2 rounded-md bg-gray-950 px-2 py-0.5">
        <span
          className="block h-[14px] w-[14px] rounded-full"
          style={{
            backgroundColor: lastWinner ? lastWinner.color : "#FFFFFF",
          }}
        ></span>
        {lastWinner ? lastWinner.alias : ""}
      </span>

      <span>They won with a</span>

      <span className="flex items-center gap-2 rounded-md bg-gray-950 px-2 py-0.5">
        {toPercent(lastWinner ? lastWinner.chance : 0)}
      </span>

      <span>chance. They won</span>

      {lastWinner && (
        <span className="flex items-center gap-2 rounded-md bg-gray-950 px-2 py-0.5">
          {lastWinner.value.toFixed(2)}
        </span>
      )}

      <span>KDA.</span>
    </h2>
  );
};

export default WinnerBar;
