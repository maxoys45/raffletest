import { toPercent } from "../helpers";

import type { StatsType } from "../@types";

const Stats = ({ stats }: { stats: StatsType }) => {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl bg-black">
      <h2 className="bg-gray-600 pt-1 pb-2 text-2xl text-black">Stats</h2>

      <div className="grid grid-cols-3 px-4 py-4">
        {stats.biggestWin && (
          <div>
            <h3 className="text-xl">Biggest win:</h3>

            <p className="text-sm text-amber-300">
              {stats.biggestWin?.value} by {stats.biggestWin?.alias}
            </p>
          </div>
        )}

        {stats.lowestPctWin && (
          <div>
            <h3 className="text-xl">Lowest percentage win:</h3>

            <p className="text-sm text-amber-300">
              {toPercent(stats.lowestPctWin.chance)} by{" "}
              {stats.lowestPctWin?.alias}
            </p>
          </div>
        )}

        {stats.mostWins && (
          <div>
            <h3 className="text-xl">Most wins:</h3>

            <p className="text-sm text-amber-300">
              {stats.mostWins?.alias} has {stats.mostWins?.winCount}{" "}
              {stats.mostWins?.winCount !== 1 ? "wins" : "win"}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
