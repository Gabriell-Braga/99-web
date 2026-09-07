"use client";

import { useEffect, useRef, useState } from "react";
import { categoryScale, foodCategories } from "@/data/categories";
import type { FoodCategoryId } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

interface CategoryRailProps {
  value: FoodCategoryId | null;
  onChange: (id: FoodCategoryId | null) => void;
}

/**
 * Trilho de categorias do app: imagem de 72px em cima e rótulo embaixo, sem
 * pílula, sem fundo e sem estado preenchido. A seleção aparece só no peso do
 * rótulo, como no 99 Food.
 */
export function CategoryRail({ value, onChange }: CategoryRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  // No começo e no fim o esfumaçado sai, senão a primeira categoria some.
  const [borda, setBorda] = useState({ inicio: true, fim: false });

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const medir = () =>
      setBorda({
        inicio: el.scrollLeft <= 1,
        fim: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
      });
    const quadro = requestAnimationFrame(medir);
    el.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      cancelAnimationFrame(quadro);
      el.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, []);

  function scrollBy(delta: number) {
    railRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="relative flex items-center gap-3">
      <button
        type="button"
        onClick={() => scrollBy(-280)}
        aria-label="Categorias anteriores"
        disabled={borda.inicio}
        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-99 bg-white text-black-99 transition-colors duration-150 hover:bg-subtle-99 disabled:opacity-40 lg:flex"
      >
        <Icon name="chevronLeft" />
      </button>

      <div className="relative min-w-0 flex-1">
        <div
          ref={railRef}
          role="group"
          aria-label="Categorias"
          className="scroll-rail flex gap-6 overflow-x-auto py-1"
        >
          {foodCategories.map((c) => {
            const active = value === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(active ? null : c.id)}
                className="flex w-[88px] shrink-0 flex-col items-center gap-2 rounded-xl py-1 text-center"
              >
                <span className="flex h-[72px] w-[72px] items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.icon}
                    alt=""
                    className="h-full w-full object-contain transition-transform duration-150"
                    style={categoryScale[c.id] ? { transform: `scale(${categoryScale[c.id]})` } : undefined}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className={cx("text-[14px] leading-tight text-black-99", active ? "font-bold" : "font-normal")}>
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Esfumaçado só onde ainda há trilho escondido. */}
        {!borda.inicio && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent"
          />
        )}
        {!borda.fim && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent"
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(280)}
        aria-label="Próximas categorias"
        disabled={borda.fim}
        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-99 bg-white text-black-99 transition-colors duration-150 hover:bg-subtle-99 disabled:opacity-40 lg:flex"
      >
        <Icon name="chevronRight" />
      </button>
    </div>
  );
}
