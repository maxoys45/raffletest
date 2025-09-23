import db from "./index.js";
import { potTotal } from "../helpers/raffle.js";

export const recordWin = (winner, pot) => {
  db.prepare(
    `
    INSERT OR REPLACE INTO wins (id, alias, amount, value, potTotal, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  ).run(
    winner.id,
    winner.alias,
    winner.amount,
    winner.value,
    potTotal(pot),
    Date.now()
  );
};

export const getStats = () => {
  const biggestWin = db
    .prepare(
      `
    SELECT * FROM wins ORDER BY value DESC LIMIT 1
  `
    )
    .get();

  const lowestPctWin = db
    .prepare(
      `
    SELECT *, (CAST(amount AS REAL) / CAST(potTotal as REAL)) AS chance
    FROM wins
    ORDER BY chance ASC LIMIT 1
  `
    )
    .get();

  const mostWins = db
    .prepare(
      `
    SELECT alias, COUNT(*) as winCount
    FROM wins
    GROUP BY alias
    ORDER BY winCount DESC
    LIMIT 5
  `
    )
    .all();

  console.log({ biggestWin, lowestPctWin, mostWins });

  return { biggestWin, lowestPctWin, mostWins };
};
