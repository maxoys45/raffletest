// @ts-nocheck

import { useState, useEffect } from "react";

const WinnerCountdown = ({ setShowCountdown, setSpinning }) => {
  const [count, setCount] = useState<number>(5);

  useEffect(() => {
    if (count <= 0) {
      setSpinning(true);
      setShowCountdown(false);

      return;
    }

    const timer = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [count]);

  return <div>Selecting winner in... {count}</div>;
};

export default WinnerCountdown;
