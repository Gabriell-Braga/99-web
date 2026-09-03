import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "icon" | "text";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none transition-colors duration-150 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-yellow-99 text-black-99 hover:bg-yellow-99-hover active:bg-yellow-99-deep disabled:bg-offwhite-99 disabled:text-disabled-99",
  secondary:
    "bg-black-99 text-white hover:bg-secondary-99 active:bg-black-99 disabled:bg-offwhite-99 disabled:text-disabled-99",
  ghost:
    "bg-white text-black-99 border border-border-99 hover:bg-subtle-99 active:bg-offwhite-99 disabled:text-disabled-99",
  icon: "bg-offwhite-99 text-black-99 hover:bg-border-99 active:bg-placeholder-99 disabled:text-disabled-99",
  text: "bg-transparent text-black-99 hover:bg-subtle-99 active:bg-offwhite-99 disabled:text-disabled-99",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-sm rounded-xl",
  md: "h-12 px-6 text-base rounded-xl",
  lg: "h-14 px-8 text-base rounded-xl",
};

const iconSizes: Record<Size, string> = {
  sm: "h-8 w-8 rounded-full",
  md: "h-10 w-10 rounded-full",
  lg: "h-12 w-12 rounded-full",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        base,
        variants[variant],
        variant === "icon" ? iconSizes[size] : sizes[size],
        full && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  full,
  className,
  children,
  ariaLabel,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cx(
        base,
        variants[variant],
        variant === "icon" ? iconSizes[size] : sizes[size],
        full && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}
