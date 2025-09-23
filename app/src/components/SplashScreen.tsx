import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import Logo from "../assets/ezkda.svg?react";

const SplashScreen = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  const [logoOffset, setLogoOffset] = useState<number>(0);

  useEffect(() => {
    if (!logoRef.current) return;

    const { width } = logoRef.current.getBoundingClientRect();

    setLogoOffset(width / 2);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#111]"
      animate={{
        opacity: 0,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        delay: 1,
      }}
    >
      <div className="relative flex w-full items-center justify-center">
        <motion.div
          className="absolute top-1/2 left-0 h-[10px] w-full -translate-y-1/2 bg-kda-green"
          initial={{ height: 0 }}
          animate={{
            height: "10px",
          }}
          transition={{
            duration: 0.75,
            ease: "easeOut",
            repeat: 0,
          }}
        ></motion.div>

        <motion.div
          ref={logoRef}
          className="relative shrink-0 bg-[#111] px-2"
          initial={{ x: "-60vw" }}
          variants={{
            slide: {
              x: 0,
              transition: {
                duration: 0.5,
                ease: [0, 0.95, 0, 1],
                delay: 0.5,
              },
            },
            growFade: {
              scale: 2,
              opacity: 0,
              transition: {
                duration: 0.5,
                ease: "easeOut",
                delay: 1,
              },
            },
          }}
          animate={["slide", "growFade"]}
        >
          <Logo className="h-[30px]" />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
