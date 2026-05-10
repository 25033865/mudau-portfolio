"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

type ScrollRevealProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
  y?: number;
};

export default function ScrollReveal({
  children,
  delay = 0,
  y = 24,
  ...props
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
