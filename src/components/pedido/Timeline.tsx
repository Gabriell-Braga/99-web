"use client";

import { motion, useReducedMotion } from "motion/react";
import type { OrderStage, Vertical } from "@/lib/types";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/Icon";

interface TimelineProps {
  stages: OrderStage[];
  current: number;
  vertical: Vertical;
}

export function Timeline({ stages, current }: TimelineProps) {
  const reduce = useReducedMotion();
  // A cor da vertical é sempre o amarelo da marca; laranja fica só para erro.
  const accent = "bg-yellow-99";
  const pulse = "rgba(255,221,0,0.7)";

  return (
    <ol className="flex flex-col" aria-label="Etapas do pedido">
      {stages.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === stages.length - 1;
        return (
          <li key={s.id} className="flex gap-4" aria-current={active ? "step" : undefined}>
            <div className="flex flex-col items-center">
              <span
                className={cx(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                  done && "border-success-99 bg-success-99 text-black-99",
                  active && cx("border-transparent text-black-99", accent, !reduce && "animate-pulse-soft"),
                  !done && !active && "border-border-99 bg-white text-transparent",
                )}
                style={active && !reduce ? { ["--tw-shadow-color" as string]: pulse } : undefined}
              >
                {done ? (
                  <Icon name="check" size={16} strokeWidth={2.5} />
                ) : (
                  <span className={cx("block h-2.5 w-2.5 shrink-0 rounded-full", active ? "bg-black-99" : "bg-border-99")} />
                )}
              </span>
              {!last && (
                <span
                  className={cx("my-1 w-0.5 flex-1 rounded-full", done ? "bg-success-99" : "bg-border-99")}
                  style={{ minHeight: 28 }}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className={cx("pb-6", last && "pb-0")}>
              <p className={cx("font-semibold leading-8", !done && !active && "text-muted-99")}>
                {s.title}
              </p>
              {active && (
                <motion.p
                  initial={reduce ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-secondary-99"
                >
                  {s.description}
                </motion.p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
