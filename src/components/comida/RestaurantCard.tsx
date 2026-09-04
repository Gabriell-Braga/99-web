import Link from "next/link";
import type { Restaurant } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { FoodArt } from "@/components/comida/FoodArt";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/States";
import { cx } from "@/lib/cx";

/**
 * Card de loja do app: logo quadrado, nome com chevron, linha de metadados e
 * três colunas com prazo ("No Horário"), taxa promocional e quem entrega.
 */
export function StoreCard({ r }: { r: Restaurant }) {
  const promoFee = r.deliveryFee;
  const fullFee = r.deliveryFeeFull;
  return (
    <Link
      href={`/comida/${r.slug}`}
      className={cx(
        "flex flex-col gap-3 rounded-2xl border border-border-99 bg-white p-4 transition-colors hover:bg-subtle-99",
        !r.open && "bg-subtle-99",
      )}
    >
      <div className="flex items-center gap-3">
        <FoodArt kind={r.art} tint={r.tint} className={cx("h-14 w-14 shrink-0 rounded-xl", !r.open && "grayscale")} scale={1.1} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[17px] font-bold leading-tight">
            <span className="truncate">{r.name}</span>
            <Icon name="chevronRight" size={18} className="shrink-0 text-muted-99" />
          </p>
          <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-secondary-99">
            <span>{r.cuisine}</span>
            <span aria-hidden="true">·</span>
            <span>Mín. {formatBRL(r.minOrder)}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5">
              <Icon name="star" size={13} className="fill-yellow-99 text-yellow-99-deep" />
              <span className="font-bold text-black-99">{r.rating.toFixed(1)}</span>
              <span>({r.ratingCount.toLocaleString("pt-BR")})</span>
            </span>
          </p>
        </div>
      </div>
      {r.open ? (
        <div className="grid grid-cols-3 divide-x divide-border-99 text-[13px] text-secondary-99">
          <div className="flex flex-col gap-1 pr-2">
            <span className="font-bold text-black-99">
              {r.etaMin}–{r.etaMax} min
            </span>
            <span className="w-fit rounded bg-yellow-99-light px-1.5 py-0.5 text-[11px] font-bold text-black-99">No Horário</span>
          </div>
          <div className="flex flex-col gap-1 px-2">
            <span className="font-bold text-green-99">{promoFee === 0 ? "Frete grátis" : formatBRL(promoFee)}</span>
            {fullFee && fullFee > promoFee ? <span className="text-muted-99 line-through">{formatBRL(fullFee)}</span> : <span>entrega</span>}
          </div>
          <div className="flex flex-col gap-1 pl-2">
            <span className="font-bold text-black-99">{r.deliveredBy}</span>
            <span>entrega</span>
          </div>
        </div>
      ) : (
        <p className="text-[13px] font-bold text-secondary-99">Fechado{r.opensAt ? ` · abre às ${r.opensAt}` : ""}</p>
      )}
    </Link>
  );
}

export function StoreCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-99 bg-white p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
