"use client";

import { useEffect, useMemo, useState } from "react";
import { restaurants } from "@/data/restaurants";
import { foodCategories } from "@/data/categories";
import type { FoodCategoryId } from "@/lib/types";
import { useApp } from "@/context/AppProvider";
import { FoodShell } from "@/components/comida/FoodShell";
import { CategoryRail } from "@/components/comida/CategoryRail";
import { RestaurantCard, RestaurantCardSkeleton } from "@/components/comida/RestaurantCard";
import { AddressPicker } from "@/components/comida/AddressPicker";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorNote } from "@/components/ui/States";

export function FoodListing() {
  const { address } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FoodCategoryId | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const loading = loadedFor !== address.id;

  // Simula a busca de lojas para o endereço, com esqueleto na listagem.
  useEffect(() => {
    const t = setTimeout(() => setLoadedFor(address.id), 700);
    return () => clearTimeout(t);
  }, [address.id]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return restaurants
      .filter((r) => (category ? r.category === category : true))
      .filter((r) => (q ? `${r.name} ${r.tagline}`.toLowerCase().includes(q) : true))
      .sort((a, b) => Number(b.open) - Number(a.open) || b.rating - a.rating);
  }, [query, category]);

  const categoryLabel = foodCategories.find((c) => c.id === category)?.label;

  return (
    <FoodShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold md:text-[40px] md:font-bold">Restaurantes</h1>
            <p className="text-secondary-99">
              Entregando em <span className="font-semibold text-black-99">{address.line1}</span>
            </p>
          </div>
          <div className="w-full md:w-80">
            <Input
              type="search"
              placeholder="Buscar restaurante ou prato"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leading={<Icon name="search" />}
              aria-label="Buscar restaurante ou prato"
            />
          </div>
        </div>

        <CategoryRail value={category} onChange={setCategory} />

        {!address.covered ? (
          <ErrorNote
            title="Endereço fora do raio de entrega"
            description={`Nenhum restaurante entrega em ${address.line1}, ${address.city}. Escolha outro endereço para ver as lojas abertas perto de você.`}
            action={
              <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
                Trocar endereço
              </Button>
            }
          />
        ) : loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" aria-busy="true" aria-label="Carregando restaurantes">
            {Array.from({ length: 8 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon="search"
            title="Nenhum restaurante encontrado"
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
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <>
            <p className="text-sm text-muted-99" aria-live="polite">
              {list.length} {list.length === 1 ? "restaurante" : "restaurantes"}
              {categoryLabel ? ` em ${categoryLabel}` : ""}
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" role="list">
              {list.map((r) => (
                <li key={r.slug}>
                  <RestaurantCard r={r} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <AddressPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </FoodShell>
  );
}
