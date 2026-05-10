"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export default function PageIntro() {
  const [visible, setVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), 1450);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: "easeInOut" } }}
        >
          <div className="relative flex flex-col items-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <motion.div
                className="absolute inset-2 rounded-[28px] border border-accent/30"
                animate={{ rotate: 180, scale: [1, 1.06, 1] }}
                transition={{ duration: 1.3, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-6 rounded-[22px] border border-accent2/35"
                animate={{ rotate: -180, scale: [0.92, 1, 0.92] }}
                transition={{ duration: 1.3, ease: "easeInOut" }}
              />
              <motion.div
                className="relative flex h-24 w-24 items-center justify-center rounded-[26px] border border-border bg-surface/80 shadow-[0_0_48px_rgba(0,229,255,0.18)]"
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="font-display text-3xl font-bold gradient-text">
                  RM
                </span>
              </motion.div>
            </div>

            <div className="mt-8 h-px w-36 overflow-hidden bg-border">
              <motion.div
                className="h-full w-1/2 bg-gradient-to-r from-accent to-accent2"
                initial={{ x: "-120%" }}
                animate={{ x: "240%" }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
