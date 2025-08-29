import crypto from "crypto";

export const pickRandomWinner = (entries) => {
  const randomIndex = crypto.randomInt(entries.length);

  return entries[randomIndex];
};
