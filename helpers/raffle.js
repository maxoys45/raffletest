import crypto from "crypto";

import { HOUSE_CUT } from "../shared/config.js";

export const pickRandomWinner = (entries) => {
  const totalTickets = entries.reduce((acc, curr) => acc + curr.amount, 0);

  const winningTicket = crypto.randomInt(totalTickets);

  let cumulative = 0;

  for (const [index, entry] of entries.entries()) {
    cumulative += entry.amount;

    if (winningTicket < cumulative) {
      return {
        index,
        ...entry,
      };
    }
  }
};

export const winnerData = (winner, entries) => {
  const totalTickets = entries.reduce((acc, curr) => acc + curr.amount, 0);

  const winnerChance = winner.amount / totalTickets;
  let winnerValue = totalTickets * (1 - HOUSE_CUT);

  // If the amount the winner bet is more than the total winnings minus the house cut,
  // then just give the player the whole pot.
  if (winnerValue < winner.amount) {
    winnerValue = totalTickets;
  }

  return {
    id: winner.id,
    index: winner.index,
    alias: winner.address,
    chance: winnerChance,
    value: Number(winnerValue.toFixed(2)),
  };
};
