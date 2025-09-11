// @ts-nocheck

import { motion } from "motion/react";

import { barColors } from "../helpers";

const Entry = ({ entry, index, spinning }) => {
  return (
    <motion.div
      className="shrink-0 basis-0 border-1 border-t-0 border-b-0 border-black"
      initial={spinning ? false : { flexGrow: 0 }}
      animate={{
        flexGrow: entry.amount,
        transition: spinning
          ? { duration: 0 }
          : { duration: 0.5, ease: "easeInOut" },
      }}
      exit={spinning ? {} : { flexGrow: 0 }}
      style={{ backgroundColor: barColors[index] }}
    ></motion.div>
  );
};

export default Entry;
