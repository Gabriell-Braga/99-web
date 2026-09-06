"use client";

import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

export interface RoutePoint {
  title: string;
  /** Nome e telefone do contato, separados por ponto médio. */
  contact?: string;
}

interface RoutePairProps {
  origin: RoutePoint | null;
  destination: RoutePoint | null;
  originPlaceholder?: string;
  destinationPlaceholder?: string;
  onEditOrigin?: () => void;
  onEditDestination?: () => void;
  /** Botão circular de inversão sobre a linha, usado em entrega. */
  onSwap?: () => void;
}

/**
 * Linha de origem ou destino. O hover envolve a linha inteira, com o círculo
 * colorido dentro da área, padding de 12px por 16px e raio de 12px.
 */
function Row({
  point,
  placeholder,
  color,
  onClick,
}: {
  point: RoutePoint | null;
  placeholder: string;
  color: "origin" | "destination";
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cx(
        "relative flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left",
        onClick && "transition-colors duration-[120ms] hover:bg-offwhite-99",
      )}
    >
      <span
        className={cx(
          "relative z-10 h-4 w-4 shrink-0 rounded-full border-[3px] bg-white",
          color === "origin" ? "border-success-99" : "border-orange-99",
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className={cx("block truncate text-[17px] font-bold", !point && "text-placeholder-99")}>
          {point?.title ?? placeholder}
        </span>
        {point?.contact && <span className="block truncate text-sm text-secondary-99">{point.contact}</span>}
      </span>
      {onClick && <Icon name="chevronRight" size={20} className="shrink-0 text-muted-99" />}
    </Tag>
  );
}

/** Par origem e destino num card branco de raio 16px e padding 16px, sobre fundo panel. */
export function RoutePair({
  origin,
  destination,
  originPlaceholder = "Origem",
  destinationPlaceholder = "Destino",
  onEditOrigin,
  onEditDestination,
  onSwap,
}: RoutePairProps) {
  return (
    <div className="rounded-2xl bg-offwhite-99 p-2">
      <div className="relative rounded-2xl bg-white p-4">
        {/* Linha vertical ligando os dois círculos, no eixo deles (centro em 40px). */}
        <span
          className="pointer-events-none absolute left-[39px] top-[calc(25%+8px)] bottom-[calc(25%+8px)] w-0.5 bg-border-99"
          aria-hidden="true"
        />
        <Row point={origin} placeholder={originPlaceholder} color="origin" onClick={onEditOrigin} />
        <Row point={destination} placeholder={destinationPlaceholder} color="destination" onClick={onEditDestination} />
        {onSwap && (
          <button
            type="button"
            onClick={onSwap}
            aria-label="Inverter origem e destino"
            className="absolute left-[24px] top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border-99 bg-white text-black-99 transition-colors duration-[120ms] hover:bg-offwhite-99"
          >
            <Icon name="swap" size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
