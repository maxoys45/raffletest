import { toPercent, truncateLongAdd } from "../helpers";

import type { StatsType } from "../@types";

const Stats = ({ stats }: { stats: StatsType }) => {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl bg-black">
      <h2 className="bg-gray-600 pt-1 pb-2 text-2xl text-black">Stats</h2>

      <div className="grid grid-cols-3 px-4 py-4">
        {stats.biggestWin && (
          <div>
            <h3 className="text-xl">Biggest win:</h3>

            <p className="text-sm text-amber-300">
              {stats.biggestWin?.value.toFixed(2)} by{" "}
              {truncateLongAdd(stats.biggestWin?.alias)}
            </p>
          </div>
        )}

        {stats.lowestPctWin && (
          <div>
            <h3 className="text-xl">Lowest percentage win:</h3>

            <p className="text-sm text-amber-300">
              {toPercent(stats.lowestPctWin.chance)} by{" "}
              {truncateLongAdd(stats.lowestPctWin?.alias)}
            </p>
          </div>
        )}

        {stats.mostWins?.length > 0 && (
          <div>
            <h3 className="text-xl">Most wins:</h3>

            {stats.mostWins.map((winner, index) => (
              <p key={index} className="text-sm text-amber-300">
                {index + 1}. {truncateLongAdd(winner.alias)} - {winner.winCount}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
