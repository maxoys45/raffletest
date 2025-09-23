import type { EntryType } from "../@types";

const EntryQueue = ({
  entries,
  queuedEntries,
}: {
  entries: EntryType[];
  queuedEntries: EntryType[];
}) => {
  return (
    <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-black px-4 py-4">
      <div className="">
        <h2>Entries:</h2>
        <ul className="">
          {entries.map((entry, index) => (
            <li key={index}>
              {entry.id}: {entry.amount}
            </li>
          ))}
        </ul>
      </div>

      <div className="">
        <h2>Queue:</h2>
        <ul className="">
          {queuedEntries.map((entry, index) => (
            <li key={index}>
              {entry.id}: {entry.amount}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EntryQueue;
