"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  const params = useSearchParams();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [pending, setPending] = useState<Omit<BagLine, "lineId"> | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  // Card de oferta abre direto o item (ajuste de estado durante a renderização).
  const wanted = params.get("item");
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  if (wanted && wanted !== openedFor) {
    setOpenedFor(wanted);
    const found = restaurant.menu.flatMap((s) => s.items).find((i) => i.id === wanted);
    if (found) setItem(found);
  }

  const otherRestaurant = bag.restaurantSlug && bag.restaurantSlug !== restaurant.slug ? getRestaurant(bag.restaurantSlug) : null;

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
    notify(`${line.name} adicionado ao carrinho`);
  }

  return (
    <FoodShell>
      <nav aria-label="Navegação" className="mb-4 text-[15px]">
        <Link href="/comida" className="inline-flex items-center gap-1 font-bold text-secondary-99 hover:text-black-99">
          <Icon name="arrowLeft" size={16} />
          Food
        </Link>
      </nav>

      <header className="flex flex-col gap-4 rounded-2xl border border-border-99 p-4 md:flex-row md:items-start">
        <FoodArt kind={restaurant.art} tint={restaurant.tint} className="h-20 w-20 shrink-0 rounded-xl" scale={1.1} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] font-bold">{restaurant.name}</h1>
            {!restaurant.open && <Badge tone="orange">Fechado</Badge>}
          </div>
          <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-secondary-99">
            <span>{restaurant.cuisine}</span>
            <span aria-hidden="true">·</span>
            <span>Mín. {formatBRL(restaurant.minOrder)}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-0.5">
              <Icon name="star" size={13} className="text-yellow-99-deep" />
              <span className="font-bold text-black-99">{restaurant.rating.toFixed(1)}</span>
              <span>({restaurant.ratingCount.toLocaleString("pt-BR")})</span>
            </span>
          </p>
          <div className="grid grid-cols-3 divide-x divide-border-99 text-[13px] text-secondary-99">
            <div className="flex flex-col gap-1 pr-2">
              <span className="font-bold text-black-99">
                {restaurant.etaMin}–{restaurant.etaMax} min
              </span>
              <span className="w-fit rounded bg-yellow-99-light px-1.5 py-0.5 text-[11px] font-bold text-black-99">No Horário</span>
            </div>
            <div className="flex flex-col gap-1 px-2">
              <span className="font-bold text-green-99">{restaurant.deliveryFee === 0 ? "Frete grátis" : formatBRL(restaurant.deliveryFee)}</span>
              {restaurant.deliveryFeeFull && restaurant.deliveryFeeFull > restaurant.deliveryFee ? (
                <span className="text-muted-99 line-through">{formatBRL(restaurant.deliveryFeeFull)}</span>
              ) : (
                <span>entrega</span>
              )}
            </div>
            <div className="flex flex-col gap-1 pl-2">
              <span className="font-bold text-black-99">{restaurant.deliveredBy}</span>
              <span>entrega</span>
            </div>
          </div>
          <p className="text-[13px] text-secondary-99">{restaurant.address}</p>
        </div>
      </header>

      {!restaurant.open && (
        <ErrorNote
          className="mt-6"
          title="Loja fechada agora"
          description={`Abre às ${restaurant.opensAt}. Você pode ver o cardápio, mas não dá para adicionar itens.`}
          action={
            <Link href="/comida" className="inline-flex h-10 items-center rounded-xl border border-border-99 bg-white px-4 text-[15px] font-bold text-black-99 hover:bg-subtle-99">
              Ver lojas abertas
            </Link>
          }
        />
      )}

      <div className="mt-8 flex flex-col gap-8">
        {restaurant.menu.map((section) => (
          <section key={section.id} aria-labelledby={`sec-${section.id}`}>
            <h2 id={`sec-${section.id}`} className="mb-3 text-[20px] font-bold">
              {section.title}
            </h2>
            <ul className="grid gap-3 md:grid-cols-2" role="list">
              {section.items.map((it) => {
                const disabled = !it.available || !restaurant.open;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => setItem(it)}
                      className={cx(
                        "flex w-full gap-4 rounded-2xl border border-border-99 bg-white p-4 text-left transition-colors hover:bg-subtle-99",
                        disabled && "bg-subtle-99",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[17px] font-bold leading-snug">{it.name}</h3>
                          {!it.available && <Badge tone="neutral">Indisponível</Badge>}
                        </div>
                        <p className="line-clamp-2 text-[15px] text-secondary-99">{it.description}</p>
                        <p className="mt-auto flex items-baseline gap-2 pt-1">
                          <span className={cx("text-[17px] font-bold tabular-nums", it.promoPrice ? "text-green-99" : null)}>
                            {formatBRL(it.promoPrice ?? it.price)}
                          </span>
                          {it.promoPrice && <span className="text-[13px] tabular-nums text-muted-99 line-through">{formatBRL(it.price)}</span>}
                        </p>
                      </div>
                      <FoodArt kind={it.art} tint={restaurant.tint} className={cx("h-24 w-24 shrink-0 rounded-xl", disabled && "grayscale")} />
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
        title="Começar um novo carrinho?"
        width="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setPending(null)}>
              Manter carrinho
            </Button>
            <Button
              onClick={() => {
                if (pending) {
                  replaceBag(restaurant.slug, pending);
                  notify(`${pending.name} adicionado ao carrinho`);
                }
                setPending(null);
                setItem(null);
              }}
            >
              Limpar e adicionar
            </Button>
          </div>
        }
      >
        <p className="text-[15px] text-secondary-99">
          Seu carrinho tem itens de <strong className="text-black-99">{otherRestaurant?.name}</strong>. Só dá para pedir de uma loja por
          vez. Quer limpar o carrinho e adicionar este item?
        </p>
      </Modal>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-44 z-30 flex justify-center px-4 lg:bottom-28">
        <AnimatePresence>
          {toast && (
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex items-center gap-2 rounded-full bg-black-99 px-4 py-2 text-sm font-bold text-white shadow-high"
            >
              <Icon name="check" size={16} className="text-success-99" />
              {toast}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </FoodShell>
  );
}
