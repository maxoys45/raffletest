import { motion } from "motion/react";

import type { EntryType } from "../@types";

const Entry = ({
  entry,
  spinning,
}: {
  entry: EntryType;
  spinning: boolean;
}) => {
  return (
    <>
      <motion.div
        className="shrink-0 basis-0 border-1 border-t-0 border-b-0 border-black"
        initial={spinning ? undefined : { flexGrow: 0 }}
        animate={{ flexGrow: entry.amount }}
        transition={{ duration: spinning ? 0 : 0.5, ease: "easeInOut" }}
        style={{ backgroundColor: entry.color }}
        data-tooltip-id="entry-tooltip"
        data-tooltip-content={`${entry.address && `${entry.address}: `}${entry.amount}`}
        data-tooltip-variant="light"
      ></motion.div>
    </>
  );
};

export default Entry;
