type EntryType = {
  address: string;
  amount: number;
  id: string;
};

export type EntriesType = EntryType[];

export type WinnerType = {
  alias: string;
  chance: number;
  id: string;
  index: number;
  value: number;
};
