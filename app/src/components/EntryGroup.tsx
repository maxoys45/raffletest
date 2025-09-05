// @ts-nocheck

import { motion } from "framer-motion";

const EntryGroup = ({ entry, index, spinning }) => {
  const colors = [
    "#FF0000",
    "#00FFFF",
    "#FF8000",
    "#0080FF",
    "#FFFF00",
    "#8000FF",
    "#80FF00",
    "#FF00FF",
    "#00FF80",
    "#FF0080",
  ];

  return (
    <motion.div
      className="basis-0 shrink-0  outline-1 outline-black"
      layout={!spinning}
      initial={spinning ? false : { flexGrow: 0 }}
      animate={{
        flexGrow: entry.amount,
        transition: spinning
          ? { duration: 0 }
          : { duration: 0.5, delay: 0.2, ease: "easeInOut" },
      }}
      exit={spinning ? {} : { flexGrow: 0 }}
      style={{ backgroundColor: colors[index] }}
    ></motion.div>
  );
};

export default EntryGroup;
