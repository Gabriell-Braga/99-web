"use client";

import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

export interface FoodFilters {
  freteGratis: boolean;
  noHorario: boolean;
}

/**
 * Fileira montada na borda de cima da folha branca, metade sobre o amarelo,
 * como no app. Dois filtros e o chevron que indica que a lista continua.
 */
export function FilterChips({
  value,
  onChange,
}: {
  value: FoodFilters;
  onChange: (f: FoodFilters) => void;
}) {
  const chip = (active: boolean) =>
    cx(
      "flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-black-99 transition-colors duration-150",
      active ? "bg-yellow-99-light ring-2 ring-yellow-99-border" : "bg-white hover:bg-offwhite-99",
    );

  return (
    <div className="scroll-rail flex items-center gap-2 overflow-x-auto rounded-full bg-white p-2 shadow-high">
      <button
        type="button"
        aria-pressed={value.freteGratis}
        onClick={() => onChange({ ...value, freteGratis: !value.freteGratis })}
        className={chip(value.freteGratis)}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-99 text-black-99" aria-hidden="true">
          <Icon name="moto" size={16} />
        </span>
        Entrega grátis
      </button>

      <button
        type="button"
        aria-pressed={value.noHorario}
        onClick={() => onChange({ ...value, noHorario: !value.noHorario })}
        className={chip(value.noHorario)}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-99 text-black-99" aria-hidden="true">
          <Icon name="boltFill" size={16} />
        </span>
        No Horário
      </button>

      <Icon name="chevronRight" size={20} className="mr-1 shrink-0 text-muted-99" aria-hidden="true" />
    </div>
  );
}
