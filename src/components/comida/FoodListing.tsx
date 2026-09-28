"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { restaurants } from "@/data/restaurants";
import { foodCategories } from "@/data/categories";
import type { FoodCategoryId, Restaurant } from "@/lib/types";
import { useApp } from "@/context/AppProvider";
import { Container } from "@/components/layout/Container";
import { FoodShell } from "@/components/comida/FoodShell";
import { PromoRail } from "@/components/comida/PromoRail";
import { FilterChips } from "@/components/comida/FilterChips";
import { CategoryRail } from "@/components/comida/CategoryRail";
import { StoreCard, StoreCardSkeleton } from "@/components/comida/RestaurantCard";
import { UauSection, type Offer } from "@/components/comida/OfferCard";
import { StoreFilters, type StoreFilterState } from "@/components/comida/StoreFilters";
import { FoodArt } from "@/components/comida/FoodArt";
import { StoreLogo } from "@/components/comida/StoreLogo";
import { cx } from "@/lib/cx";
import { AddressPicker } from "@/components/comida/AddressPicker";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorNote } from "@/components/ui/States";

function SectionTitle({ children, href, id }: { children: string; href?: string; id?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 id={id} className="text-[22px] font-bold">
        {children}
      </h2>
      {href && (
        <a href={href} className="flex items-center gap-1 text-[17px] font-medium text-black-99 hover:underline">
          Ver mais
          <Icon name="chevronRight" size={20} />
        </a>
      )}
    </div>
  );
}

/** Pratos da faixa UAU, na ordem em que aparecem. Todos têm foto fixa e preço promocional. */
const UAU_PICKS = ["smash-duplo", "classico", "picanha-brasa", "calabresa", "combo-20", "galeto-inteiro", "margherita", "carbonara-bm"];

/** Vale-refeição:na demonstração, só as lojas de sobremesa e sorvete não aceitam. */
function acceptsVR(r: Restaurant): boolean {
  return r.category !== "sorvetes" && r.category !== "doces";
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

  const [filters, setFilters] = useState<StoreFilterState>({ sort: "relevancia", freeDelivery: false, vr: false });
  const filtering = Boolean(query.trim() || category || filters.freeDelivery || filters.vr || filters.sort !== "relevancia");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const by: Record<StoreFilterState["sort"], (a: Restaurant, b: Restaurant) => number> = {
      relevancia: (a, b) => b.rating - a.rating,
      tempo: (a, b) => a.etaMin - b.etaMin || a.etaMax - b.etaMax,
      taxa: (a, b) => a.deliveryFee - b.deliveryFee,
      nota: (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
      distancia: (a, b) => a.distanceKm - b.distanceKm,
    };
    return restaurants
      .filter((r) => (category ? r.category === category : true))
      .filter((r) => (q ? `${r.name} ${r.tagline} ${r.cuisine}`.toLowerCase().includes(q) : true))
      .filter((r) => (filters.freeDelivery ? r.deliveryFee === 0 : true))
      .filter((r) => (filters.vr ? acceptsVR(r) : true))
      .sort((a, b) => Number(b.open) - Number(a.open) || by[filters.sort](a, b));
  }, [query, category, filters]);

  // A faixa UAU é vitrine: pratos escolhidos a dedo pela foto, com os lanches na frente.
  const offers = useMemo<Offer[]>(
    () =>
      UAU_PICKS.flatMap((id) => {
        for (const r of restaurants) {
          if (!r.open) continue;
          for (const s of r.menu) {
            const i = s.items.find((x) => x.id === id);
            if (i?.promoPrice && i.available) return [{ restaurant: r, item: i as Offer["item"] }];
          }
        }
        return [];
      }),
    [],
  );

  // "Últimas lojas" da demonstração: uma seleção fixa, com lojas fechadas no meio como no app.
  const recent = useMemo(() => ["acai-do-largo", "kaito-sushi", "braseiro-burger", "doceria-amelie", "forno-da-vila", "casa-da-coxinha"]
    .map((s) => restaurants.find((r) => r.slug === s))
    .filter((r): r is Restaurant => Boolean(r)), []);

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
              className="h-14 w-full rounded-xl border border-transparent bg-white pl-14 pr-5 text-[17px] font-bold text-black-99 placeholder:font-medium placeholder:text-placeholder-99 focus:border-black-99 focus:outline-none"
            />
          </div>

        </Container>
      </div>

      {/* A folha branca sobe por cima do banner, com raio só no topo. No celular a
          aba cola na borda esquerda e a folha fica reta, como no app. */}
      <div className="relative -mt-8 bg-white md:rounded-t-[24px]">
        {/* Aba branca que sai da folha. No celular, como no app, fica presa à borda
            esquerda e só a ponta direita desce para a folha numa curva côncava. No
            desktop recua até a coluna da página, com curva nas duas pontas. */}
        <Container className="pointer-events-none absolute inset-x-0 top-0 -translate-y-full overflow-hidden max-md:px-0">
          <div className="pointer-events-auto relative w-fit max-w-[calc(100%-2rem)] rounded-t-3xl bg-white py-2 pl-5 pr-4 md:max-w-full md:pl-4 md:pr-1">
            <FilterChips />
            <span
              aria-hidden="true"
              className="absolute bottom-0 right-full hidden h-10 w-10 bg-white [mask-image:radial-gradient(circle_40px_at_0_0,transparent_98%,#000_100%)] md:block"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-full h-8 w-8 bg-white [mask-image:radial-gradient(circle_32px_at_100%_0,transparent_98%,#000_100%)] md:h-10 md:w-10 md:[mask-image:radial-gradient(circle_40px_at_100%_0,transparent_98%,#000_100%)]"
            />
          </div>
        </Container>

        <FoodShell>
          <div className="flex flex-col gap-7">
            <CategoryRail value={category} onChange={setCategory} />

            {address.covered && !filtering && !loading && (
              <>
                <UauSection offers={offers} />

                <section aria-labelledby="ultimas" className="flex flex-col gap-3">
                  <SectionTitle id="ultimas" href="#lojas">
                    Últimas lojas
                  </SectionTitle>
                  <ul className="scroll-rail -mx-4 -my-1.5 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 py-1.5 md:-mx-1.5 md:scroll-px-1.5 md:px-1.5" role="list">
                    {recent.map((r) => (
                      <li key={r.slug} className="w-[150px] shrink-0 snap-start min-[400px]:w-[164px]">
                        <Link href={`/comida/${r.slug}`} className="block">
                          <span className="relative block">
                            <FoodArt kind={r.art} seed={`${r.slug}-capa`} tint={r.tint} className={cx("h-[104px] w-full rounded-2xl", !r.open && "grayscale")} />
                            <StoreLogo r={r} className="absolute left-2 top-2 h-10 w-10 rounded-xl ring-2 ring-white" />
                          </span>
                          <span className="mt-2 block truncate text-[17px] font-semibold">{r.name}</span>
                          <span className="block truncate text-[15px] text-secondary-99">
                            {r.open ? `${r.etaMin}-${r.etaMax} Min` : `Abre às ${r.opensAt ?? "amanhã"}`}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

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
            ) : (
              <section id="lojas" aria-labelledby="lojas-title" className="-mt-3 flex scroll-mt-4 flex-col">
                <h2 id="lojas-title" className="sr-only">
                  Lojas
                </h2>
                <StoreFilters value={filters} onChange={setFilters} />
                {loading ? (
                  <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2" aria-busy="true" aria-label="Carregando lojas">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <StoreCardSkeleton key={i} />
                    ))}
                  </div>
                ) : list.length === 0 ? (
                  <EmptyState
                    icon="search"
                    title="Nenhuma loja encontrada"
                    description={
                      query
                        ? `Não achamos “${query}”${categoryLabel ? ` em ${categoryLabel}` : ""}. Tente outro termo ou limpe os filtros.`
                        : "Nenhuma loja aberta com esses filtros nessa região."
                    }
                    action={
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setQuery("");
                          setCategory(null);
                          setFilters({ sort: "relevancia", freeDelivery: false, vr: false });
                        }}
                      >
                        Limpar
                      </Button>
                    }
                  />
                ) : (
                  <>
                    {filtering && (
                      <p className="pb-1 text-[15px] text-secondary-99" aria-live="polite">
                        {list.length} {list.length === 1 ? "loja" : "lojas"}
                        {categoryLabel ? ` em ${categoryLabel}` : ""}
                      </p>
                    )}
                    <ul className="grid grid-cols-1 gap-x-8 md:grid-cols-2" role="list">
                      {list.map((r, i) => (
                        <Fragment key={r.slug}>
                          <li className="min-w-0">
                            <StoreCard r={r} />
                          </li>
                          {/* Os banners amarelos entram entre as lojas, como no app. */}
                          {!filtering && i === 1 && (
                            <li className="col-span-full min-w-0 py-4">
                              <PromoRail onPick={setCategory} />
                            </li>
                          )}
                        </Fragment>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            )}
          </div>
          <AddressPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
        </FoodShell>
      </div>
    </>
  );
}
