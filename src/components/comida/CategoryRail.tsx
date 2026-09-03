"use client";

import { useRef } from "react";
import { foodCategories } from "@/data/categories";
import type { FoodCategoryId } from "@/lib/types";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";

interface CategoryRailProps {
  value: FoodCategoryId | null;
  onChange: (id: FoodCategoryId | null) => void;
}

export function CategoryRail({ value, onChange }: CategoryRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  function scrollBy(delta: number) {
    railRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="relative flex items-center gap-3">
      <button
        type="button"
        onClick={() => scrollBy(-240)}
        aria-label="Categorias anteriores"
        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-offwhite-99 hover:bg-border-99 lg:flex"
      >
        <Icon name="chevronLeft" />
      </button>
      <div className="relative min-w-0 flex-1">
        <div
          ref={railRef}
          role="group"
          aria-label="Categorias"
          className="scroll-rail flex gap-2 overflow-x-auto py-1"
        >
          <Chip active={value === null} onClick={() => onChange(null)}>
            Tudo
          </Chip>
          {foodCategories.map((c) => (
            <Chip key={c.id} active={value === c.id} onClick={() => onChange(value === c.id ? null : c.id)}>
              {c.label}
            </Chip>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent"
        />
      </div>
      <button
        type="button"
        onClick={() => scrollBy(240)}
        aria-label="Próximas categorias"
        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-offwhite-99 hover:bg-border-99 lg:flex"
      >
        <Icon name="chevronRight" />
      </button>
    </div>
  );
}
