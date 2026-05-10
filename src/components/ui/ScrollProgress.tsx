"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[70] h-0.5 origin-left bg-gradient-to-r from-accent via-text to-accent2 shadow-[0_0_18px_rgba(0,229,255,0.5)]"
      style={{ scaleX }}
    />
  );
}
