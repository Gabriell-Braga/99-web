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

function Row({
  point,
  placeholder,
  onClick,
}: {
  point: RoutePoint | null;
  placeholder: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cx(
        "flex min-h-14 w-full items-center gap-3 py-2 text-left",
        onClick && "rounded-lg hover:bg-subtle-99",
      )}
    >
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

/** Par origem e destino: círculo vazado verde, linha, círculo vazado laranja. */
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
    <div className="flex gap-3">
      <div className="relative flex w-6 shrink-0 flex-col items-center py-4">
        <span className="h-4 w-4 shrink-0 rounded-full border-[3px] border-success-99 bg-white" aria-hidden="true" />
        <span className="w-0.5 flex-1 bg-border-99" aria-hidden="true" />
        <span className="h-4 w-4 shrink-0 rounded-full border-[3px] border-orange-99 bg-white" aria-hidden="true" />
        {onSwap && (
          <button
            type="button"
            onClick={onSwap}
            aria-label="Inverter origem e destino"
            className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border-99 bg-white text-black-99 hover:bg-subtle-99"
          >
            <Icon name="swap" size={16} strokeWidth={2} />
          </button>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col divide-y divide-border-99">
        <Row point={origin} placeholder={originPlaceholder} onClick={onEditOrigin} />
        <Row point={destination} placeholder={destinationPlaceholder} onClick={onEditDestination} />
      </div>
    </div>
  );
}
