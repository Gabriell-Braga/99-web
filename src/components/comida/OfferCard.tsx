import Link from "next/link";
import type { MenuItem, Restaurant } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { FoodArt } from "@/components/comida/FoodArt";
import { Icon } from "@/components/ui/Icon";

export interface Offer {
  restaurant: Restaurant;
  item: MenuItem & { promoPrice: number };
}

export function discountPercent(price: number, promo: number): number {
  return Math.round((1 - promo / price) * 100);
}

/**
 * Card de oferta: fundo yellow-tint, título bold, descrição em duas linhas,
 * bloco de preço em verde com o antigo riscado e pílula de percentual.
 * Imagem à direita com botão circular amarelo de adicionar sobreposto.
 */
export function OfferCard({ offer }: { offer: Offer }) {
  const { restaurant, item } = offer;
  return (
    <Link
      href={`/comida/${restaurant.slug}?item=${item.id}`}
      className="flex gap-3 rounded-2xl bg-yellow-99-light p-3 transition-colors hover:bg-yellow-99-hover/40"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-[15px] font-bold">{item.name}</p>
        <p className="line-clamp-2 text-[13px] text-secondary-99">{item.description}</p>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[13px] text-green-99">a partir de</span>
          <span className="text-[17px] font-bold tabular-nums text-green-99">{formatBRL(item.promoPrice)}</span>
          <span className="text-[13px] tabular-nums text-muted-99 line-through">{formatBRL(item.price)}</span>
          <span className="rounded-full bg-green-99-tint px-2 py-0.5 text-[11px] font-bold text-green-99">
            -{discountPercent(item.price, item.promoPrice)}%
          </span>
        </div>
        <p className="truncate text-[12px] text-secondary-99">{restaurant.name}</p>
      </div>
      <div className="relative shrink-0">
        <FoodArt kind={item.art} tint={restaurant.tint} className="h-24 w-24 rounded-xl" />
        <span
          className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-yellow-99 text-black-99"
          aria-hidden="true"
        >
          <Icon name="plus" size={18} strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}
