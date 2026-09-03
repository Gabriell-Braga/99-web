import Link from "next/link";
import type { Restaurant } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { FoodArt } from "@/components/comida/FoodArt";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/States";

export function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <Link
      href={`/comida/${r.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-low transition-shadow duration-150 hover:shadow-mid"
    >
      <div className="relative aspect-video">
        <FoodArt kind={r.art} tint={r.tint} className="h-full w-full" scale={0.9} />
        {!r.open && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded bg-white px-3 py-1 text-sm font-semibold text-black-99">
              Fechado{r.opensAt ? ` · abre às ${r.opensAt}` : ""}
            </span>
          </div>
        )}
        {r.deliveryFee === 0 && r.open && (
          <span className="absolute left-3 top-3 rounded bg-yellow-99 px-2 py-0.5 text-xs font-semibold text-black-99">
            Frete grátis
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h2 className="text-lg font-semibold leading-snug">{r.name}</h2>
        <p className="truncate text-sm text-secondary-99">{r.tagline}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-muted-99">
          <span className="flex items-center gap-1 font-semibold text-black-99">
            <Icon name="star" size={14} className="fill-yellow-99-deep text-yellow-99-deep" />
            {r.rating.toFixed(1)}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {r.etaMin}–{r.etaMax} min
          </span>
          <span aria-hidden="true">·</span>
          <span>{r.deliveryFee === 0 ? "Grátis" : formatBRL(r.deliveryFee)}</span>
        </p>
      </div>
    </Link>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-low">
      <Skeleton className="aspect-video rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
