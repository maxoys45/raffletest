export type EntryType = {
  address: string;
  amount: number;
  id: string;
  color: string;
};

export type EntriesType = EntryType[];

export type WinnerType = {
  id: string;
  alias: string;
  amount: number;
  value: number;
  chance: number;
  color: string;
};

export type StatusType = "OPEN" | "COUNTDOWN" | "SPINNING" | "SHOW_WINNER";

type WinnerStats = Omit<WinnerType, "chance" | "color"> & {
  potTotal: number;
  timestamp: number;
};

export type StatsType = {
  biggestWin: WinnerStats;
  lowestPctWin: WinnerStats & { chance: number };
  mostWins: {
    alias: string;
    winCount: number;
  };
};
