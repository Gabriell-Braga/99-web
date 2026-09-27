import Link from "next/link";
import type { MenuItem, Restaurant } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { FoodArt } from "@/components/comida/FoodArt";
import { menuVariantIndex } from "@/data/foodPhotos";
import { Icon } from "@/components/ui/Icon";

export interface Offer {
  restaurant: Restaurant;
  item: MenuItem & { promoPrice: number };
}

export function discountPercent(price: number, promo: number): number {
  return Math.round((1 - promo / price) * 100);
}

/** Selo "UAU" do app: estrela laranja com o texto amarelo contornado. */
function UauBadge() {
  const points = Array.from({ length: 24 }, (_, i) => {
    const r = i % 2 ? 22 : 30;
    const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
    return `${(44 + Math.cos(a) * r * 1.45).toFixed(1)},${(30 + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
  return (
    <svg width="88" height="60" viewBox="0 0 88 60" aria-hidden="true" className="shrink-0">
      <polygon points={points} fill="#FC7A2C" />
      <text
        x="44"
        y="40"
        textAnchor="middle"
        fontSize="27"
        fontWeight="900"
        fontStyle="italic"
        fill="#FFDD00"
        stroke="#5A2400"
        strokeWidth="2.5"
        paintOrder="stroke"
        fontFamily="var(--font-sans)"
      >
        UAU
      </text>
    </svg>
  );
}

/** Card de prato da faixa UAU: foto quadrada, selo de desconto verde, "+" amarelo, preço e prazo. */
function UauCard({ offer, eager }: { offer: Offer; eager?: boolean }) {
  const { restaurant: r, item } = offer;
  return (
    <Link href={`/comida/${r.slug}?item=${item.id}`} className="block w-[136px] shrink-0 snap-start min-[400px]:w-[150px] lg:w-[172px]">
      <span className="relative block aspect-square">
        <FoodArt kind={item.art} seed={item.id} index={menuVariantIndex(r, item.id)} tint={r.tint} eager={eager} className="h-full w-full rounded-2xl" />
        <span className="absolute bottom-2 left-2 rounded-lg bg-[#1FAE5B] px-1.5 py-0.5 text-[14px] font-bold text-white">
          -{discountPercent(item.price, item.promoPrice)}%
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 -right-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-99 text-black-99 ring-4 ring-white"
        >
          <Icon name="plus" size={22} />
        </span>
      </span>
      <span className="mt-2 flex items-baseline gap-1 whitespace-nowrap">
        <span className="text-[17px] font-extrabold tabular-nums text-green-99">{formatBRL(item.promoPrice)}</span>
        <span className="truncate text-[12px] tabular-nums text-muted-99 line-through">{formatBRL(item.price)}</span>
      </span>
      <span className="block truncate text-[16px]">{item.name}</span>
      <span className="mt-0.5 flex items-center gap-1 text-[14px] text-secondary-99">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] bg-yellow-99 text-black-99" aria-hidden="true">
          <Icon name="boltFill" size={12} />
        </span>
        <span className="truncate">
          {r.etaMax} Min · {r.deliveryFee === 0 ? "Grátis" : formatBRL(r.deliveryFee)}
        </span>
      </span>
    </Link>
  );
}

/** Faixa "UAU, até X% off" do app: selo, título e o trilho de pratos em oferta. */
export function UauSection({ offers }: { offers: Offer[] }) {
  const top = offers.reduce((m, o) => Math.max(m, discountPercent(o.item.price, o.item.promoPrice)), 0);
  return (
    <section aria-labelledby="uau-title" className="relative -mx-4 overflow-hidden rounded-t-[28px] md:mx-0">
      {/* Fundo amarelo-claro que some para baixo, com % grandes no canto, como no app. */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[200px] bg-gradient-to-b from-yellow-99-light via-yellow-99-light/70 to-white" />
      <span aria-hidden="true" className="absolute right-12 -top-4 select-none text-[120px] font-black leading-none text-yellow-99/25">
        %
      </span>
      <div className="relative px-4 pt-3 md:px-5">
        <a href="#lojas" className="flex items-center gap-2">
          <UauBadge />
          <span id="uau-title" className="min-w-0 flex-1 leading-tight">
            <span className="block text-[20px] font-bold">
              Até <span className="text-[28px] font-black">{top}%</span> off
            </span>
            <span className="block text-[17px]">Clique e peça</span>
          </span>
          <Icon name="chevronRight" size={22} className="shrink-0" />
        </a>
        <ul className="scroll-rail -mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0" role="list">
          {offers.map((o, i) => (
            <li key={`${o.restaurant.slug}-${o.item.id}`}>
              <UauCard offer={o} eager={i < 3} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
