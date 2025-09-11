import clsx from "clsx";

import { toPercent, barColors } from "../helpers";

import type { WinnerType } from "../@types";

const WinnerBar = ({
  winner,
  showWinner,
}: {
  winner: WinnerType | null;
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
            backgroundColor: winner ? barColors[winner.index] : "#FFFFFF",
          }}
        ></span>
        {winner ? winner.alias : ""}
      </span>

      <span>They won with a</span>

      {winner && (
        <span className="flex items-center gap-2 rounded-md bg-gray-950 px-2 py-0.5">
          {toPercent(winner.chance, 2)}
        </span>
      )}

      <span>chance. They won</span>

      {winner && (
        <span className="flex items-center gap-2 rounded-md bg-gray-950 px-2 py-0.5">
          {winner.value}
        </span>
      )}

      <span>KDA.</span>
    </h2>
  );
};

export default WinnerBar;
