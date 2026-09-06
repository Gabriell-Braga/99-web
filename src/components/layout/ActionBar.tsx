import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { PaymentIcon } from "@/components/payment/PaymentIcon";

interface ActionBarProps {
  /** Coluna esquerda: meio de pagamento ou valor total. */
  left?: ReactNode;
  /** Texto verde com chevron no meio, para oferta de saldo ou desconto. */
  offer?: string;
  /** Botão primário. */
  action: ReactNode;
  /** Texto abaixo dizendo o que falta, quando o botão está bloqueado. */
  hint?: ReactNode;
}

/**
 * Barra de ação inferior do app: fixa no rodapé do painel, branca, com o
 * pagamento ou o total à esquerda e o botão primário à direita.
 */
export function ActionBar({ left, offer, action, hint }: ActionBarProps) {
  return (
    <div className="flex flex-col gap-2">
      {offer && (
        <p className="flex items-center justify-between text-sm font-bold text-green-99">
          {offer}
          <Icon name="chevronRight" size={18} />
        </p>
      )}
      <div className="flex items-center gap-4">
        {left && <div className="min-w-0 shrink-0">{left}</div>}
        <div className="min-w-0 flex-1">{action}</div>
      </div>
      {hint}
    </div>
  );
}

/** Valor total em 24px bold com a economia em verde logo abaixo. */
export function TotalBlock({ total, savings, label }: { total: string; savings?: string; label?: string }) {
  return (
    <div className="flex flex-col leading-tight">
      {label && <span className="text-[13px] text-secondary-99">{label}</span>}
      <span className="text-2xl font-bold tabular-nums">{total}</span>
      {savings && <span className="text-sm font-bold text-green-99">{savings}</span>}
    </div>
  );
}

/** Meio de pagamento: ícone, nome e últimos dígitos, com chevron para trocar. */
export function PaymentBlock({
  icon,
  label,
  detail,
  onClick,
}: {
  icon: "pix" | "card" | "cash" | "ticket";
  label: string;
  detail?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl py-1 text-left hover:bg-subtle-99"
      aria-label={`Pagamento: ${label}${detail ? ` ${detail}` : ""}. Trocar`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-offwhite-99 text-black-99">
        <PaymentIcon name={icon} size={20} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-bold">{label}</span>
        {detail && <span className="text-[13px] text-secondary-99">{detail}</span>}
      </span>
      <Icon name="chevronDown" size={16} className="text-muted-99" />
    </button>
  );
}
