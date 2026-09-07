"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { restaurants } from "@/data/restaurants";
import { foodCategories } from "@/data/categories";
import type { FoodCategoryId } from "@/lib/types";
import { useApp } from "@/context/AppProvider";
import { Container } from "@/components/layout/Container";
import { FoodShell } from "@/components/comida/FoodShell";
import { PromoRail } from "@/components/comida/PromoRail";
import { FilterChips } from "@/components/comida/FilterChips";
import { CategoryRail } from "@/components/comida/CategoryRail";
import { StoreCard, StoreCardSkeleton } from "@/components/comida/RestaurantCard";
import { OfferCard, discountPercent, type Offer } from "@/components/comida/OfferCard";
import { AddressPicker } from "@/components/comida/AddressPicker";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorNote } from "@/components/ui/States";

function SectionTitle({ children, href }: { children: string; href?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-[20px] font-bold">{children}</h2>
      {href && (
        <Link href={href} className="text-[15px] font-bold text-black-99 hover:underline">
          Ver tudo
        </Link>
      )}
    </div>
  );
}

export function FoodListing() {
  const { address } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FoodCategoryId | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const loading = loadedFor !== address.id;

  useEffect(() => {
    const t = setTimeout(() => setLoadedFor(address.id), 700);
    return () => clearTimeout(t);
  }, [address.id]);

  const filtering = Boolean(query.trim() || category);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants
      .filter((r) => (category ? r.category === category : true))
      .filter((r) => (q ? `${r.name} ${r.tagline} ${r.cuisine}`.toLowerCase().includes(q) : true))
      .sort((a, b) => Number(b.open) - Number(a.open) || b.rating - a.rating);
  }, [query, category]);

  const offers = useMemo<Offer[]>(
    () =>
      restaurants
        .filter((r) => r.open)
        .flatMap((r) =>
          r.menu.flatMap((s) => s.items.filter((i) => i.promoPrice && i.available).map((i) => ({ restaurant: r, item: i as Offer["item"] }))),
        )
        .sort((a, b) => discountPercent(b.item.price, b.item.promoPrice) - discountPercent(a.item.price, a.item.promoPrice))
        .slice(0, 4),
    [],
  );

  const categoryLabel = foodCategories.find((c) => c.id === category)?.label;

  return (
    <>
      {/* Busca e banner continuam na faixa amarela, como no app. */}
      <div className="bg-yellow-99 pb-20">
        <Container className="pb-8 pt-2">
          <h1 className="sr-only">Food</h1>
          <div className="relative">
            <Icon name="search" size={22} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-black-99" />
            <input
              type="search"
              placeholder="O que você quer comer hoje?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar loja ou prato"
              className="h-14 w-full rounded-xl border border-transparent bg-white pl-14 pr-5 text-[17px] font-bold text-black-99 placeholder:font-bold placeholder:text-placeholder-99 focus:border-black-99 focus:outline-none"
            />
          </div>
        </Container>
      </div>

      {/* A folha branca sobe por cima do banner, com raio só no topo. */}
      <div className="relative -mt-8 rounded-t-[24px] bg-white">
        {/* Aba branca que sai da folha, recuada até a coluna da página. As duas
            pontas ligam na folha por uma curva côncava, como no app. */}
        <Container className="pointer-events-none absolute inset-x-0 top-0 -translate-y-full overflow-hidden">
          <div className="pointer-events-auto relative w-fit max-w-full rounded-t-2xl bg-white py-2 pl-4 pr-1">
            <FilterChips />
            <span
              aria-hidden="true"
              className="absolute bottom-0 right-full h-6 w-6 bg-white [mask-image:radial-gradient(circle_24px_at_0_0,transparent_98%,#000_100%)]"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-full h-6 w-6 bg-white [mask-image:radial-gradient(circle_24px_at_100%_0,transparent_98%,#000_100%)]"
            />
          </div>
        </Container>

        <FoodShell>
          <div className="flex flex-col gap-8">
            <CategoryRail value={category} onChange={setCategory} />

        {!address.covered ? (
          <ErrorNote
            title="Endereço fora do raio de entrega"
            description={`Nenhuma loja entrega em ${address.line1}, ${address.city}. Escolha outro endereço para ver as lojas abertas perto de você.`}
            action={
              <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
                Trocar endereço
              </Button>
            }
          />
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" aria-busy="true" aria-label="Carregando lojas">
            {Array.from({ length: 6 }).map((_, i) => (
              <StoreCardSkeleton key={i} />
            ))}
          </div>
        ) : filtering ? (
          list.length === 0 ? (
            <EmptyState
              icon="search"
              title="Nenhuma loja encontrada"
              description={
                query
                  ? `Não achamos “${query}”${categoryLabel ? ` em ${categoryLabel}` : ""}. Tente outro termo ou limpe os filtros.`
                  : `Nenhuma loja de ${categoryLabel} aberta agora nessa região.`
              }
              action={
                <Button
                  variant="ghost"
                  onClick={() => {
                    setQuery("");
                    setCategory(null);
                  }}
                >
                  Limpar
                </Button>
              }
            />
          ) : (
            <section aria-labelledby="res-title" className="flex flex-col gap-4">
              <h2 id="res-title" className="text-[20px] font-bold" aria-live="polite">
                {list.length} {list.length === 1 ? "loja" : "lojas"}
                {categoryLabel ? ` em ${categoryLabel}` : ""}
              </h2>
              <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" role="list">
                {list.map((r) => (
                  <li key={r.slug}>
                    <StoreCard r={r} />
                  </li>
                ))}
              </ul>
            </section>
          )
        ) : (
          <>
            <section aria-labelledby="ofertas" className="flex flex-col gap-4">
              <SectionTitle>Ofertas</SectionTitle>
              <ul className="grid gap-4 md:grid-cols-2" role="list">
                {offers.map((o, i) => (
                  <li className="min-w-0" key={`${o.restaurant.slug}-${o.item.id}`}>
                    <OfferCard offer={o} eager={i < 2} />
                  </li>
                ))}
              </ul>
            </section>

            {/* O carrossel de ofertas ocupa esta faixa; a área amarela ficou só de fundo. */}
            <PromoRail />

            <section aria-labelledby="lojas" className="flex flex-col gap-4">
              <SectionTitle>Lojas recomendadas na região</SectionTitle>
              <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" role="list">
                {list.map((r) => (
                  <li key={r.slug}>
                    <StoreCard r={r} />
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
          </div>
          <AddressPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
        </FoodShell>
      </div>
    </>
  );
}
