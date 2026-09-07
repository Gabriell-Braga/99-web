"use client";

import Link from "next/link";
import { useRef } from "react";
import { promos } from "@/data/promos";
import { Icon } from "@/components/ui/Icon";

/**
 * Carrossel de banners promocionais, na faixa amarela logo abaixo da busca.
 * Rola na horizontal com encaixe, e no desktop ganha as setas discretas.
 */
export function PromoRail() {
  const railRef = useRef<HTMLDivElement>(null);

  function scrollBy(delta: number) {
    railRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={railRef}
        role="group"
        aria-label="Ofertas em destaque"
        className="scroll-rail flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 scroll-pl-4 md:px-8 md:scroll-pl-8 xl:px-16 xl:scroll-pl-16"
      >
        {promos.map((p, i) => (
          <Link
            key={p.id}
            href="/comida"
            className="group relative flex h-[160px] w-[86vw] shrink-0 snap-start overflow-hidden rounded-2xl text-white sm:w-[420px] lg:h-[200px] lg:w-[520px]"
            style={{ background: p.tint }}
          >
            <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-5 lg:p-6">
              <span className="w-fit rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
                {p.badge}
              </span>
              <span className="text-[20px] font-bold leading-tight lg:text-[24px]">{p.title}</span>
              <span className="text-[13px] text-white/80 lg:text-[15px]">{p.description}</span>
              <span className="mt-2 inline-flex w-fit items-center gap-1.5 text-[15px] font-bold">
                {p.cta}
                <Icon name="arrowRight" size={18} />
              </span>
            </span>
            {/* O primeiro banner é a maior imagem da tela: carrega na hora. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image}
              alt=""
              className="h-full w-[38%] shrink-0 object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              decoding="async"
            />
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-540)}
        aria-label="Ofertas anteriores"
        className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-99 bg-white text-black-99 transition-colors duration-150 hover:bg-subtle-99 lg:flex xl:left-8"
      >
        <Icon name="chevronLeft" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(540)}
        aria-label="Próximas ofertas"
        className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-99 bg-white text-black-99 transition-colors duration-150 hover:bg-subtle-99 lg:flex xl:right-8"
      >
        <Icon name="chevronRight" />
      </button>
    </div>
  );
}
