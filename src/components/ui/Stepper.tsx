import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
  label?: string;
  size?: "sm" | "md";
  removeAtMin?: boolean;
}

export function Stepper({
  value,
  min = 1,
  max = 20,
  onChange,
  label = "Quantidade",
  size = "md",
  removeAtMin,
}: StepperProps) {
  const btn = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const atMin = value <= min;
  return (
    <div
      className={cx(
        "inline-flex items-center rounded-full bg-offwhite-99",
        size === "sm" ? "h-8 gap-1 px-0.5" : "h-12 gap-2 px-1",
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={atMin && !removeAtMin}
        aria-label={atMin && removeAtMin ? "Remover" : "Diminuir"}
        className={cx(
          "flex items-center justify-center rounded-full text-black-99 hover:bg-border-99 disabled:text-disabled-99 disabled:hover:bg-transparent",
          btn,
        )}
      >
        <Icon name={atMin && removeAtMin ? "trash" : "minus"} size={size === "sm" ? 16 : 20} />
      </button>
      <span
        className={cx("min-w-6 text-center font-semibold tabular-nums", size === "sm" ? "text-sm" : "text-base")}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Aumentar"
        className={cx(
          "flex items-center justify-center rounded-full text-black-99 hover:bg-border-99 disabled:text-disabled-99 disabled:hover:bg-transparent",
          btn,
        )}
      >
        <Icon name="plus" size={size === "sm" ? 16 : 20} />
      </button>
    </div>
  );
}
