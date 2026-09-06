import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import { CountBubble } from "@/components/ui/CountBubble";

type Variant = "primary" | "secondary" | "ghost" | "icon" | "text";
type Size = "sm" | "md" | "lg";

/**
 * Botão do 99 Web. Primário é amarelo com texto preto bold, raio de 12px, nunca
 * pílula. Laranja não é fundo de botão.
 */
const base =
  "inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap select-none transition-[background-color,transform] duration-150 active:scale-[0.98] active:duration-100 disabled:cursor-not-allowed motion-reduce:active:scale-100";

const variants: Record<Variant, string> = {
  primary:
    "bg-yellow-99 text-black-99 hover:bg-yellow-99-hover active:bg-yellow-99-deep disabled:bg-offwhite-99 disabled:text-disabled-99",
  secondary:
    "bg-black-99 text-white hover:bg-[#3a3a3a] active:bg-black-99 disabled:bg-offwhite-99 disabled:text-disabled-99",
  ghost:
    "bg-white text-black-99 border border-border-99 hover:bg-subtle-99 active:bg-offwhite-99 disabled:text-disabled-99",
  icon: "bg-offwhite-99 text-black-99 hover:bg-border-99 active:bg-placeholder-99 disabled:text-disabled-99",
  text: "bg-transparent text-black-99 hover:bg-subtle-99 active:bg-offwhite-99 disabled:text-disabled-99",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[15px] rounded-xl",
  md: "h-12 px-5 text-base rounded-xl",
  lg: "h-14 px-6 text-[17px] rounded-xl",
};

const iconSizes: Record<Size, string> = {
  sm: "h-8 w-8 rounded-full",
  md: "h-10 w-10 rounded-full",
  lg: "h-12 w-12 rounded-full",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  /** Valor em uma linha e a ação em outra, como em "R$ 70,40 / Solicitar Pop". */
  price?: string;
  /** Contador em círculo preto à direita, como em "Continuar (2)". */
  count?: number;
}

function Content({
  price,
  count,
  variant,
  children,
}: CommonProps & { children?: ReactNode }) {
  if (price) {
    return (
      <span className="flex flex-col items-center leading-tight">
        <span className="text-[15px] font-bold">{price}</span>
        <span className="text-[15px] font-bold">{children}</span>
      </span>
    );
  }
  if (count !== undefined) {
    return (
      <>
        <span>{children}</span>
        <CountBubble count={count} className={cx("h-6 min-w-6 px-1.5 text-xs", variant === "secondary" && "bg-white text-black-99")} />
      </>
    );
  }
  return <>{children}</>;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, CommonProps {
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  full,
  price,
  count,
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
      <Content price={price} count={count} variant={variant}>
        {children}
      </Content>
    </button>
  );
}

interface LinkButtonProps extends CommonProps {
  href: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  full,
  price,
  count,
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
      <Content price={price} count={count} variant={variant}>
        {children}
      </Content>
    </Link>
  );
}
