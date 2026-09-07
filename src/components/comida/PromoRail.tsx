"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { promos } from "@/data/promos";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/**
 * Carrossel de banners promocionais. Fica na mesma coluna dos cards, com as
 * setas ao lado do trilho, como no trilho de categorias, para nada passar por
 * cima do banner nem por baixo do carrinho.
 */
export function PromoRail() {
  const railRef = useRef<HTMLDivElement>(null);
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

  // As setas ficam montadas na borda do trilho, para o banner continuar
  // alinhado com os cards das outras seções.
  const seta =
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-99 bg-white text-black-99 shadow-high transition-colors duration-150 hover:bg-subtle-99 disabled:opacity-0 lg:flex";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollBy(-460)}
        aria-label="Ofertas anteriores"
        disabled={borda.inicio}
        className={cx(seta, "left-0 -translate-x-1/2")}
      >
        <Icon name="chevronLeft" />
      </button>

      <div
        ref={railRef}
        role="group"
        aria-label="Ofertas em destaque"
        className="scroll-rail flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1"
      >
        {promos.map((p, i) => (
          <Link
            key={p.id}
            href="/comida"
            className="group relative flex h-[170px] w-[86%] shrink-0 snap-start overflow-hidden rounded-2xl text-white sm:w-[440px] lg:h-[200px] lg:w-[540px]"
            style={{ background: p.tint }}
          >
            <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-5 lg:p-6">
              <span className="w-fit rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">
                {p.badge}
              </span>
              <span className="text-pretty text-[19px] font-bold leading-tight lg:text-[22px]">{p.title}</span>
              <span className="text-[13px] text-white/80 lg:text-[15px]">{p.description}</span>
              <span className="mt-2 inline-flex w-fit items-center gap-1.5 text-[15px] font-bold">
                {p.cta}
                <Icon name="arrowRight" size={18} />
              </span>
            </span>
            {/* O primeiro banner ainda entra na primeira tela: é ele que mede o LCP. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.image}
              alt=""
              className="h-full w-[34%] max-w-[180px] shrink-0 object-cover"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              decoding="async"
            />
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(460)}
        aria-label="Próximas ofertas"
        disabled={borda.fim}
        className={cx(seta, "right-0 translate-x-1/2")}
      >
        <Icon name="chevronRight" />
      </button>
    </div>
  );
}
