import { useState, useEffect } from "react";

const WinnerCountdown = ({ countdown }: { countdown: number }) => {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!countdown) return;

    console.table(countdown, Date.now());

    const timer = setInterval(() => {
      const msRemaining = countdown - Date.now();

      setRemaining(Math.max(0, Math.ceil(msRemaining / 1000)));
    }, 200);

    return () => clearInterval(timer);
  }, [countdown]);

  return <div>Selecting winner in... {remaining}</div>;
};

export default WinnerCountdown;
