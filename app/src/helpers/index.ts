import type { EntriesType, WinnerType } from "../@types";

// Convert decimal number to a percentage.
export const toPercent = (decimal: number, decimals: number = 0) => {
  return `${(decimal * 100).toFixed(decimals)}%`;
};

// Random whole number between 2 numbers.
export const getRandomArbitrary = (min: number, max: number): number => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);

  return Math.floor(Math.random() * (maxInt - minInt) + minInt);
};

// Colors used for the spinning bar.
export const barColors = [
  // "#FF0000",
  // "#00FFFF",
  // "#FF8000",
  // "#0080FF",
  // "#FFFF00",
  // "#8000FF",
  // "#80FF00",
  // "#FF00FF",
  // "#00FF80",
  // "#FF0080",

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

export const spinAnimation = (
  containerEl: HTMLDivElement,
  entries: EntriesType,
  winner: WinnerType,
  loops: number
) => {
  const totalWidth = containerEl.offsetWidth;

  const totalTickets = entries.reduce((sum, e) => sum + e.amount, 0);

  let cumulative = 0;
  let winningEntryStart = 0;
  let winningEntryEnd = 0;

  // Looks through the entries, finds the winning entry, sets the start/end points of the winning entry bar.
  for (const entry of entries) {
    const entryWidth = (entry.amount / totalTickets) * totalWidth;

    if (entry.id === winner.id) {
      winningEntryStart = cumulative;
      winningEntryEnd = cumulative + entryWidth;

      break;
    }

    cumulative += entryWidth;
  }

  // Gets the middle of the winning bar.
  const winnindMid =
    winningEntryStart + (winningEntryEnd - winningEntryStart) / 2;

  const loopsOffset = (loops - 1) * totalWidth;

  return -(loopsOffset + winnindMid - totalWidth / 2);
};
