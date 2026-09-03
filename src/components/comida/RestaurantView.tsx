"use client";

import { useState } from "react";
import Link from "next/link";
import type { BagLine, MenuItem, Restaurant } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { useApp } from "@/context/AppProvider";
import { getRestaurant } from "@/data/restaurants";
import { FoodShell } from "@/components/comida/FoodShell";
import { FoodArt } from "@/components/comida/FoodArt";
import { ItemModal } from "@/components/comida/ItemModal";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ErrorNote } from "@/components/ui/States";
import { cx } from "@/lib/cx";

export function RestaurantView({ restaurant }: { restaurant: Restaurant }) {
  const { bag, addLine, replaceBag } = useApp();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [pending, setPending] = useState<Omit<BagLine, "lineId"> | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const otherRestaurant =
    bag.restaurantSlug && bag.restaurantSlug !== restaurant.slug ? getRestaurant(bag.restaurantSlug) : null;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function handleAdd(line: Omit<BagLine, "lineId">) {
    const result = addLine(restaurant.slug, line);
    if (result === "conflict") {
      setPending(line);
      return;
    }
    setItem(null);
    notify(`${line.name} adicionado à sacola`);
  }

  return (
    <FoodShell>
      <nav aria-label="Navegação" className="mb-4 text-sm">
        <Link href="/comida" className="inline-flex items-center gap-1 font-semibold text-secondary-99 hover:text-black-99">
          <Icon name="arrowLeft" size={16} />
          Restaurantes
        </Link>
      </nav>

      <header className="flex flex-col gap-5 md:flex-row md:items-center">
        <FoodArt kind={restaurant.art} tint={restaurant.tint} className="h-32 w-32 shrink-0 rounded-2xl md:h-40 md:w-40" />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[28px] font-semibold md:text-[40px] md:font-bold">{restaurant.name}</h1>
            {!restaurant.open && <Badge tone="orange">Fechado</Badge>}
          </div>
          <p className="text-secondary-99">{restaurant.tagline}</p>
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-99">
            <span className="flex items-center gap-1 font-semibold text-black-99">
              <Icon name="star" size={14} className="fill-yellow-99-deep text-yellow-99-deep" />
              {restaurant.rating.toFixed(1)}
            </span>
            <span>({restaurant.ratingCount.toLocaleString("pt-BR")} avaliações)</span>
            <span aria-hidden="true">·</span>
            <span>
              {restaurant.etaMin}–{restaurant.etaMax} min
            </span>
            <span aria-hidden="true">·</span>
            <span>{restaurant.deliveryFee === 0 ? "Frete grátis" : `Frete ${formatBRL(restaurant.deliveryFee)}`}</span>
            <span aria-hidden="true">·</span>
            <span>Pedido mínimo {formatBRL(restaurant.minOrder)}</span>
          </p>
          <p className="text-[13px] text-muted-99">{restaurant.address}</p>
        </div>
      </header>

      {!restaurant.open && (
        <ErrorNote
          className="mt-6"
          title="Restaurante fechado agora"
          description={`Abre às ${restaurant.opensAt}. Você pode ver o cardápio, mas não dá para adicionar itens. Veja outros restaurantes abertos.`}
          action={
            <Link href="/comida" className="inline-flex h-10 items-center rounded-xl border border-border-99 bg-white px-5 text-sm font-semibold text-black-99 hover:bg-subtle-99">
              Ver restaurantes abertos
            </Link>
          }
        />
      )}

      <div className="mt-8 flex flex-col gap-10">
        {restaurant.menu.map((section) => (
          <section key={section.id} aria-labelledby={`sec-${section.id}`}>
            <h2 id={`sec-${section.id}`} className="mb-4 text-[22px] font-semibold">
              {section.title}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2" role="list">
              {section.items.map((it) => {
                const disabled = !it.available || !restaurant.open;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => setItem(it)}
                      className={cx(
                        "flex w-full gap-4 rounded-xl border border-border-99 bg-white p-4 text-left transition-shadow hover:shadow-mid",
                        disabled && "bg-subtle-99",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold leading-snug">{it.name}</h3>
                          {!it.available && <Badge tone="neutral">Indisponível</Badge>}
                        </div>
                        <p className="line-clamp-2 text-sm text-secondary-99">{it.description}</p>
                        <p className="mt-auto pt-1 font-bold">{formatBRL(it.price)}</p>
                      </div>
                      <FoodArt
                        kind={it.art}
                        tint={restaurant.tint}
                        className={cx("h-24 w-24 shrink-0 rounded-lg", disabled && "grayscale")}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <ItemModal item={item} restaurant={restaurant} onClose={() => setItem(null)} onAdd={handleAdd} />

      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Começar uma nova sacola?"
        width="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setPending(null)}>
              Manter sacola
            </Button>
            <Button
              onClick={() => {
                if (pending) {
                  replaceBag(restaurant.slug, pending);
                  notify(`${pending.name} adicionado à sacola`);
                }
                setPending(null);
                setItem(null);
              }}
            >
              Esvaziar e adicionar
            </Button>
          </div>
        }
      >
        <p className="text-secondary-99">
          Sua sacola tem itens de <strong className="text-black-99">{otherRestaurant?.name}</strong>. Só dá para
          pedir de um restaurante por vez. Quer esvaziar a sacola e adicionar este item?
        </p>
      </Modal>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 lg:bottom-8">
        {toast && (
          <span className="flex items-center gap-2 rounded-full bg-black-99 px-4 py-2 text-sm font-semibold text-white shadow-high">
            <Icon name="check" size={16} className="text-success-99" />
            {toast}
          </span>
        )}
      </div>
    </FoodShell>
  );
}
