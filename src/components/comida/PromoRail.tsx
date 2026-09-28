"use client";

import { useEffect, useRef, useState } from "react";
import { promos, type Promo } from "@/data/promos";
import type { FoodCategoryId } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

/** Banner amarelo do app: título grande, selo de preço e a comida recortada saindo pela borda. */
function Banner({ p, eager, onPick }: { p: Promo; eager: boolean; onPick: (c: FoodCategoryId) => void }) {
  const [front, back] = p.images;
  return (
    <button
      type="button"
      onClick={() => onPick(p.category)}
      className="relative h-[148px] w-[264px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-yellow-99 text-left text-black-99 transition-transform duration-200 active:scale-[0.98] min-[400px]:h-[156px] min-[400px]:w-[280px] lg:h-[164px] lg:w-[296px]"
    >
      {/* O texto fica na metade esquerda, centrado na altura; a comida nunca passa por baixo dele. */}
      <span className="relative z-10 flex h-full w-[56%] flex-col justify-center pl-4">
        <span className={cx("block font-extrabold leading-[1.02] tracking-tight", p.price ? "text-[19px] lg:text-[20px]" : "text-[23px] lg:text-[25px]")}>
          {p.title}
        </span>
        {p.price && (
          <span className="mt-1 flex items-start gap-0.5 leading-none">
            <span className="mt-2 text-[12px] font-extrabold">R$</span>
            <span className="flex flex-col">
              <span className="mb-0.5 border-y border-black-99 text-center text-[7px] font-extrabold uppercase leading-[1.4] tracking-wider">
                A partir de
              </span>
              <span className="text-[40px] font-black tracking-tighter">{p.price.reais}</span>
            </span>
            <span className="mt-2 text-[17px] font-black">,{p.price.centavos}</span>
          </span>
        )}
      </span>
      {p.blob && (
        <span
          aria-hidden="true"
          className="absolute -bottom-8 -right-6 h-[120px] w-[160px] rotate-[-18deg] rounded-[46%_54%_40%_60%/55%_45%_55%_45%] bg-[#D992F2]"
        />
      )}
      {back && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={back}
          alt=""
          aria-hidden="true"
          className="absolute -bottom-3 right-[24%] w-[22%] object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={front}
        alt=""
        aria-hidden="true"
        className={cx(
          "absolute object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.22)]",
          back ? "-bottom-4 -right-3 w-[46%]" : "-bottom-6 -right-6 w-[52%]",
        )}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
      />
    </button>
  );
}

/**
 * Carrossel dos banners amarelos, entre as lojas como no app. No desktop as
 * setas ficam nas bordas do trilho.
 */
export function PromoRail({ onPick }: { onPick: (c: FoodCategoryId) => void }) {
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

  const seta =
    "absolute top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border-99 bg-white text-black-99 shadow-high transition-colors duration-150 hover:bg-subtle-99 disabled:opacity-0 lg:flex";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => railRef.current?.scrollBy({ left: -360, behavior: "smooth" })}
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
        className="scroll-rail -mx-4 -my-1.5 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 py-1.5 md:-mx-1.5 md:scroll-px-1.5 md:px-1.5"
      >
        {promos.map((p, i) => (
          <Banner key={p.id} p={p} eager={i === 0} onPick={onPick} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => railRef.current?.scrollBy({ left: 360, behavior: "smooth" })}
        aria-label="Próximas ofertas"
        disabled={borda.fim}
        className={cx(seta, "right-0 translate-x-1/2")}
      >
        <Icon name="chevronRight" />
      </button>
    </div>
  );
}
