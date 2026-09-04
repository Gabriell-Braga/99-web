import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: ReactNode;
}

/** Chip de filtro: fundo branco, raio total, ícone à esquerda e rótulo em bold 15px. */
export function Chip({ active, icon, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cx(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] font-bold transition-colors duration-150",
        active ? "border-black-99 bg-black-99 text-white" : "border-border-99 bg-white text-black-99 hover:bg-subtle-99",
        className,
      )}
      {...rest}
    >
      {icon}
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
  tone?: "neutral" | "yellow" | "success" | "orange" | "green";
  className?: string;
}) {
  const tones = {
    neutral: "bg-offwhite-99 text-secondary-99",
    yellow: "bg-yellow-99 text-black-99",
    success: "bg-success-99-bg text-success-99-deep",
    green: "bg-green-99-tint text-green-99",
    orange: "bg-orange-99-bg text-orange-99-text",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold", tones[tone], className)}>
      {children}
    </span>
  );
}
