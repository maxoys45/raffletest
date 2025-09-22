import crypto from "crypto";

export const pickRandomWinner = (entries) => {
  const winningTicket = crypto.randomInt(potTotal(entries));

  let cumulative = 0;

  for (const entry of entries) {
    cumulative += entry.amount;

    if (winningTicket < cumulative) {
      return entry;
    }
  }
};

// Get the total of a pot.
export const potTotal = (entries) => {
  return entries.reduce((acc, curr) => acc + curr.amount, 0);
};

// Get the data for the winning bet.
export const winnerData = (winner, entries, HOUSE_CUT) => {
  const totalTickets = potTotal(entries);

  const winnerChance = winner.amount / totalTickets;
  let winnerValue = totalTickets * (1 - HOUSE_CUT);

  // If the amount the winner bet is more than the total winnings minus the house cut,
  // then just give the player the whole pot.
  if (winnerValue < winner.amount) {
    winnerValue = totalTickets;
  }

  return {
    id: winner.id,
    alias: winner.address,
    amount: winner.amount,
    value: Number(winnerValue),
    chance: winnerChance,
    color: winner.color,
  };
};

// Random whole number between 2 numbers.
export const getRandomArbitrary = (min, max) => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);

  return Math.floor(Math.random() * (maxInt - minInt) + minInt);
};

// Colors used for the spinning bar.
export const barColors = [
  "#c2e2ef",
  "#6c2a38",
  "#f3c52a",
  "#b47db6",
  "#f1634b",
  "#077ca7",
  "#75bf44",
  "#dd5386",
  "#3ebcec",
  "#6c6aab",
];
