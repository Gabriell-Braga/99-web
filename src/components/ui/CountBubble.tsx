"use client";

import { motion, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";

/** Contador em círculo preto que faz scale(1.15) e volta quando o número muda. */
export function CountBubble({ count, className }: { count: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      key={count}
      initial={reduce ? false : { scale: 1.15 }}
      animate={{ scale: 1 }}
      transition={{ duration: reduce ? 0 : 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={cx("flex items-center justify-center rounded-full bg-black-99 font-bold text-white", className)}
    >
      {count}
    </motion.span>
  );
}
