"use client";

import { useState } from "react";
import Link from "next/link";
import type { Restaurant } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { FoodArt } from "@/components/comida/FoodArt";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/States";
import { cx } from "@/lib/cx";

/** Maior desconto entre os pratos da loja, para o selo "Itens com até X% OFF". */
export function maxDiscount(r: Restaurant): number {
  let best = 0;
  for (const s of r.menu)
    for (const i of s.items) if (i.promoPrice && i.available) best = Math.max(best, Math.round((1 - i.promoPrice / i.price) * 100));
  return best;
}

function countLabel(n: number): string {
  if (n >= 1000) return "1000+";
  if (n >= 100) return "100+";
  if (n >= 10) return "10+";
  return String(n);
}

/**
 * Linha de loja do app: foto arredondada à esquerda, nome com coração, nota e
 * cozinha, prazo com o raio amarelo, distância e taxa, e o selo verde de ofertas.
 */
export function StoreCard({ r }: { r: Restaurant }) {
  const [fav, setFav] = useState(false);
  const off = maxDiscount(r);
  const isNew = r.ratingCount < 50;
  return (
    <div className="relative flex gap-4 py-3">
      <Link href={`/comida/${r.slug}`} className="absolute inset-0 z-0 rounded-2xl" aria-label={r.name} />
      <FoodArt
        kind={r.art}
        seed={r.slug}
        tint={r.tint}
        className={cx("h-[84px] w-[112px] shrink-0 rounded-2xl min-[400px]:h-[96px] min-[400px]:w-[128px]", !r.open && "grayscale")}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={cx("min-w-0 flex-1 truncate text-[17px] font-bold min-[400px]:text-[18px]", !r.open && "text-secondary-99")}>{r.name}</p>
          <button
            type="button"
            onClick={() => setFav((v) => !v)}
            aria-pressed={fav}
            aria-label={fav ? `Remover ${r.name} dos favoritos` : `Favoritar ${r.name}`}
            className={cx("relative z-10 -mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-offwhite-99", fav ? "text-orange-99" : "text-black-99")}
          >
            <Icon name={fav ? "heartFill" : "heart"} size={22} />
          </button>
        </div>
        <p className="flex min-w-0 items-center gap-1 text-[15px] text-secondary-99">
          {isNew ? (
            <>
              <Icon name="sparkle" size={14} className="shrink-0 text-black-99" />
              <span className="text-black-99">Novo</span>
            </>
          ) : (
            <>
              <Icon name="starFill" size={15} className={cx("shrink-0", r.rating >= 4.6 ? "text-yellow-99-deep" : "text-black-99")} />
              <span className="text-black-99">{r.rating.toFixed(1).replace(".", ",")}</span>
              <span>({countLabel(r.ratingCount)})</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="truncate">{r.cuisine}</span>
        </p>
        {r.open ? (
          <p className="flex min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap text-[14px] text-secondary-99 min-[400px]:text-[15px]">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] bg-yellow-99 text-black-99" aria-hidden="true">
              <Icon name="boltFill" size={12} />
            </span>
            <span className="text-black-99">
              {r.etaMin}-{r.etaMax} Min
            </span>
            {/* Abaixo de 360px a distância sai para a taxa caber. */}
            <span aria-hidden="true" className="hidden min-[360px]:inline">·</span>
            <span className="hidden min-[360px]:inline">{r.distanceKm.toFixed(1)}km</span>
            <span aria-hidden="true">·</span>
            {r.deliveryFee === 0 ? (
              <span className="min-w-0 truncate text-green-99">Grátis</span>
            ) : (
              <span className="flex min-w-0 items-baseline gap-1 truncate">
                <span>{formatBRL(r.deliveryFee).replace(/\s/g, "")}</span>
                {r.deliveryFeeFull && r.deliveryFeeFull > r.deliveryFee && (
                  <span className="truncate text-muted-99 line-through">{formatBRL(r.deliveryFeeFull).replace(/\s/g, "")}</span>
                )}
              </span>
            )}
          </p>
        ) : (
          <p className="text-[15px] text-secondary-99">Fechado{r.opensAt ? ` · abre às ${r.opensAt}` : ""}</p>
        )}
        {r.open && off > 0 && (
          <span className="mt-1.5 inline-block rounded-md bg-green-99-tint px-2 py-0.5 text-[14px] text-green-99">Itens com até {off}% OFF</span>
        )}
      </div>
    </div>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="flex gap-4 py-3">
      <Skeleton className="h-[84px] w-[112px] rounded-2xl min-[400px]:h-[96px] min-[400px]:w-[128px]" />
      <div className="flex flex-1 flex-col gap-2 pt-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  );
}
