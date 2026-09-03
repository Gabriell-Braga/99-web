import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-150",
        active ? "bg-black-99 text-white" : "bg-offwhite-99 text-black-99 hover:bg-border-99",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "yellow" | "success" | "orange";
  className?: string;
}) {
  const tones = {
    neutral: "bg-offwhite-99 text-secondary-99",
    yellow: "bg-yellow-99 text-black-99",
    success: "bg-success-99-bg text-success-99-deep",
    orange: "bg-orange-99-bg text-orange-99-text",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
