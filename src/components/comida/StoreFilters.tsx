"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

export type SortKey = "relevancia" | "tempo" | "taxa" | "nota" | "distancia";
export const sortLabels: Record<SortKey, string> = {
  relevancia: "Relevância",
  tempo: "Menor tempo de entrega",
  taxa: "Menor taxa de entrega",
  nota: "Melhor avaliação",
  distancia: "Mais perto",
};

export interface StoreFilterState {
  sort: SortKey;
  freeDelivery: boolean;
  vr: boolean;
}

const pill =
  "flex h-12 shrink-0 items-center gap-1.5 rounded-2xl px-5 text-[16px] font-semibold transition-colors duration-150 min-[400px]:text-[17px]";

/**
 * Fileira de filtros do app: ajuste, "Ordenar por", "Entrega grátis" e "VR".
 * Fica presa no topo ao rolar a lista de lojas, com fundo branco por trás.
 */
export function StoreFilters({ value, onChange }: { value: StoreFilterState; onChange: (v: StoreFilterState) => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const active = value.sort !== "relevancia" || value.freeDelivery || value.vr;

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="sticky top-0 z-20 -mx-4 bg-white px-4 py-3 md:mx-0 md:px-0">
      <div className="scroll-rail flex gap-2.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => (active ? onChange({ sort: "relevancia", freeDelivery: false, vr: false }) : setOpen((v) => !v))}
          aria-label={active ? "Limpar filtros" : "Filtros"}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-offwhite-99 text-black-99 transition-colors duration-150 hover:bg-border-99"
        >
          <Icon name="tune" size={24} />
          {active && <span aria-hidden="true" className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-99 ring-2 ring-offwhite-99" />}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cx(pill, value.sort !== "relevancia" ? "bg-black-99 text-white" : "bg-offwhite-99 text-black-99 hover:bg-border-99")}
        >
          {value.sort === "relevancia" ? "Ordenar por" : sortLabels[value.sort]}
          <Icon name="chevronDown" size={20} className={cx("transition-transform duration-200", open && "rotate-180")} />
        </button>
        <button
          type="button"
          aria-pressed={value.freeDelivery}
          onClick={() => onChange({ ...value, freeDelivery: !value.freeDelivery })}
          className={cx(pill, value.freeDelivery ? "bg-black-99 text-white" : "bg-offwhite-99 text-black-99 hover:bg-border-99")}
        >
          Entrega grátis
        </button>
        <button
          type="button"
          aria-pressed={value.vr}
          onClick={() => onChange({ ...value, vr: !value.vr })}
          title="Lojas que aceitam vale-refeição"
          className={cx(pill, value.vr ? "bg-black-99 text-white" : "bg-offwhite-99 text-black-99 hover:bg-border-99")}
        >
          VR
          <Icon name="chevronDown" size={20} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Ordenar lojas"
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-4 top-full z-30 mt-1 w-[260px] overflow-hidden rounded-2xl bg-white py-2 shadow-high md:left-0"
          >
            {(Object.keys(sortLabels) as SortKey[]).map((k) => (
              <li key={k}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value.sort === k}
                  onClick={() => {
                    onChange({ ...value, sort: k });
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[16px] hover:bg-offwhite-99"
                >
                  {sortLabels[k]}
                  {value.sort === k && <Icon name="check" size={20} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
