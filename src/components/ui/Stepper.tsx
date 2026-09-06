import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  label?: string;
  /** "square": quadrados no card de item. "circle": círculos vazados no carrinho. */
  variant?: "square" | "circle";
  size?: "sm" | "md";
  removeAtMin?: boolean;
}

/** Stepper de quantidade: menos e mais em volta do número em bold. */
export function Stepper({
  value,
  min = 1,
  max = 20,
  onChange,
  label = "Quantidade",
  variant = "square",
  size = "md",
  removeAtMin,
}: StepperProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const atMin = value <= min;
  const btn = cx(
    "flex items-center justify-center text-black-99 transition-colors disabled:text-disabled-99",
    dim,
    variant === "square"
      ? "rounded-lg bg-offwhite-99 hover:bg-border-99 disabled:bg-offwhite-99"
      : "rounded-full border border-border-99 bg-white hover:bg-subtle-99 disabled:bg-white",
  );
  return (
    <div className="inline-flex items-center gap-3" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={atMin && !removeAtMin}
        aria-label={atMin && removeAtMin ? "Remover" : "Diminuir"}
        className={btn}
      >
        <Icon name={atMin && removeAtMin ? "trash" : "minus"} size={size === "sm" ? 16 : 18} />
      </button>
      <span className={cx("min-w-5 text-center font-bold tabular-nums", size === "sm" ? "text-[15px]" : "text-[17px]")} aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Aumentar" className={btn}>
        <Icon name="plus" size={size === "sm" ? 16 : 18} />
      </button>
    </div>
  );
}
