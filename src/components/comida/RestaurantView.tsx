"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { BagLine, MenuItem, Restaurant } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { bagSubtotal, useApp } from "@/context/AppProvider";
import { getRestaurant } from "@/data/restaurants";
import { FoodShell } from "@/components/comida/FoodShell";
import { FoodArt } from "@/components/comida/FoodArt";
import { StoreInfoModal, type Aba } from "@/components/comida/StoreInfoModal";
import { menuVariantIndex } from "@/data/foodPhotos";
import { ItemModal } from "@/components/comida/ItemModal";
import { discountPercent } from "@/components/comida/OfferCard";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cx } from "@/lib/cx";

export function RestaurantView({ restaurant }: { restaurant: Restaurant }) {
  const { bag, addLine, replaceBag } = useApp();
  const params = useSearchParams();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [pending, setPending] = useState<Omit<BagLine, "lineId"> | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // Guarda em qual aba a ficha da loja abre: nome leva a Informações, nota a Avaliações.
  const [infoAba, setInfoAba] = useState<Aba | null>(null);
  const reduceMotion = useReducedMotion();
  const [favorita, setFavorita] = useState(false);

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

  async function compartilhar() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: restaurant.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      notify("Link da loja copiado");
    } catch {
      // Compartilhamento cancelado: nada a fazer.
    }
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

  const offers = restaurant.menu.flatMap((s) => s.items).filter((i) => i.promoPrice && i.available);
  // Os primeiros do cardápio fazem as vezes dos mais pedidos, numerados como no app.
  const preferidos = restaurant.menu.flatMap((s) => s.items).filter((i) => i.available).slice(0, 4);
  const inBag = bag.restaurantSlug === restaurant.slug ? bagSubtotal(bag) : 0;
  const faltaMinimo = restaurant.minOrder - inBag;

  return (
    <FoodShell>
      {/* Capa da loja. No celular ocupa a largura toda e a folha branca sobe por
          cima com raio de 24px; no desktop fica arredondada dentro da coluna. */}
      <div className="relative -mx-4 h-[200px] md:mx-0 md:h-[240px] md:overflow-hidden md:rounded-3xl">
        <FoodArt kind={restaurant.art} seed={`${restaurant.slug}-capa`} tint={restaurant.tint} eager className="absolute inset-0" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between md:inset-x-6 md:top-6">
          <Link href="/comida" aria-label="Voltar para o Food" className={coverButton}>
            <Icon name="chevronLeft" size={28} />
          </Link>
          <div className="flex gap-3">
            <Link href="/comida" aria-label="Buscar no Food" className={coverButton}>
              <Icon name="search" size={24} />
            </Link>
            <button
              type="button"
              aria-label={favorita ? "Remover dos favoritos" : "Favoritar loja"}
              aria-pressed={favorita}
              onClick={() => setFavorita((v) => !v)}
              className={cx(coverButton, favorita && "text-orange-99")}
            >
              <Icon name="heart" size={24} />
            </button>
            <button type="button" aria-label="Compartilhar loja" onClick={compartilhar} className={coverButton}>
              <Icon name="share" size={24} />
            </button>
          </div>
        </div>
      </div>

      <header className="relative -mx-4 -mt-6 rounded-t-[24px] bg-white px-4 pt-6 md:mx-0 md:mt-6 md:rounded-none md:px-0 md:pt-0">
        <div className="flex items-center gap-4">
          <FoodArt kind={restaurant.art} seed={restaurant.slug} tint={restaurant.tint} className="h-16 w-16 shrink-0 rounded-2xl" />
          <div className="flex min-w-0 flex-col gap-1">
            <button
              type="button"
              onClick={() => setInfoAba("informacoes")}
              aria-haspopup="dialog"
              className="flex w-fit min-w-0 max-w-full items-center gap-1 rounded-xl text-left transition-colors duration-150 hover:text-secondary-99"
            >
              <h1 className={cx("truncate text-[19px] font-bold md:text-[22px]", !restaurant.open && "text-secondary-99")}>{restaurant.name}</h1>
              <Icon name="chevronRight" size={22} className="shrink-0" />
            </button>
            <p className="flex flex-wrap items-center gap-x-1.5 text-[14px] text-secondary-99">
              <span>{restaurant.cuisine}</span>
              <span aria-hidden="true">·</span>
              <span>Min {formatBRL(restaurant.minOrder)}</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setInfoAba("avaliacoes")}
                aria-haspopup="dialog"
                className="flex items-center gap-0.5 rounded text-black-99 hover:underline"
              >
                <Icon name="starFill" size={14} className="text-yellow-99-deep" />
                <span>
                  {restaurant.rating.toFixed(1).replace(".", ",")} ({restaurant.ratingCount >= 200 ? "200+" : restaurant.ratingCount})
                </span>
                <Icon name="chevronRight" size={16} className="text-muted-99" />
              </button>
            </p>
          </div>
        </div>

        {restaurant.open ? (
          // Três colunas separadas por fios: prazo, taxa e quem entrega.
          <dl className="mt-7 flex text-[13px] md:text-[14px]">
            <div className="flex min-w-0 flex-col gap-1 pr-3 min-[400px]:whitespace-nowrap min-[400px]:pr-4 md:pr-8">
              <dt className="flex items-center gap-1 text-secondary-99">
                <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-yellow-99 text-black-99" aria-hidden="true">
                  <Icon name="boltFill" size={12} />
                </span>
                No Horário
              </dt>
              <dd className="text-[16px] font-bold tabular-nums">
                {restaurant.etaMin}-{restaurant.etaMax} Min
              </dd>
            </div>
            <div className="flex min-w-0 flex-col gap-1 border-l border-border-99 px-3 min-[400px]:whitespace-nowrap min-[400px]:px-4 md:px-8">
              <dt className="text-secondary-99">Taxa de entrega</dt>
              <dd className="flex flex-wrap items-baseline gap-x-1 tabular-nums">
                <span className="text-[16px] font-bold">{restaurant.deliveryFee === 0 ? "Grátis" : formatBRL(restaurant.deliveryFee)}</span>
                {restaurant.deliveryFeeFull && restaurant.deliveryFeeFull > restaurant.deliveryFee && (
                  <span className="text-[13px] text-muted-99 line-through">{formatBRL(restaurant.deliveryFeeFull)}</span>
                )}
              </dd>
            </div>
            <div className="flex min-w-0 flex-col gap-1 border-l border-border-99 pl-3 min-[400px]:whitespace-nowrap min-[400px]:pl-4 md:pl-8">
              <dt className="text-secondary-99">Entregue pela</dt>
              <dd className="text-[16px] font-bold">{restaurant.deliveredBy === "Entregador 99" ? "99Food" : "Loja"}</dd>
            </div>
          </dl>
        ) : (
          // Loja fechada: só a faixa cinza com o horário, como no app.
          <p className="mt-7 rounded-2xl bg-subtle-99 px-5 py-4 text-[17px] font-bold text-black-99" role="status">
            Abre às {restaurant.opensAt}
          </p>
        )}
      </header>

      <div className="mt-10 flex flex-col gap-10">
        {offers.length > 0 && (
          <section aria-labelledby="sec-ofertas">
            <h2 id="sec-ofertas" className="mb-4 text-[22px] font-bold">
              Ofertas
            </h2>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2" role="list">
              {offers.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => setItem(it)}
                    className="flex w-full gap-4 rounded-3xl bg-yellow-99-light p-4 text-left transition-colors hover:bg-yellow-99-hover/30"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="line-clamp-2 text-[17px] font-bold leading-snug">{it.name}</h3>
                      <p className="line-clamp-2 text-[14px] text-secondary-99">{it.description}</p>
                      <Price item={it} className="mt-auto pt-2" />
                    </div>
                    <ItemPhoto item={it} restaurant={restaurant} className="h-28 w-28" add={restaurant.open} onTint />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="sec-preferidos">
          <h2 id="sec-preferidos" className="mb-4 text-[22px] font-bold">
            Preferidos
          </h2>
          <ul className="scroll-rail -mx-4 flex gap-3 overflow-x-auto px-4 pt-2 md:mx-0 md:px-0" role="list">
            {preferidos.map((it, i) => (
              <li key={it.id} className="w-[132px] shrink-0 md:w-[160px]">
                <button type="button" onClick={() => setItem(it)} className="flex w-full flex-col gap-2 text-left">
                  <span className="relative block">
                    <ItemPhoto item={it} restaurant={restaurant} className="aspect-square w-full" add={restaurant.open} />
                    {i < 3 && (
                      <span
                        aria-hidden="true"
                        className="absolute -left-1 -top-2 text-[40px] font-extrabold leading-none text-orange-99-soft [-webkit-text-stroke:3px_white] [paint-order:stroke_fill]"
                      >
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <Price item={it} compact />
                  <span className="truncate text-[15px]">{it.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {restaurant.menu.map((section) => (
          <section key={section.id} aria-labelledby={`sec-${section.id}`}>
            <h2 id={`sec-${section.id}`} className="mb-2 text-[22px] font-bold">
              {section.title}
            </h2>
            <ul className="grid grid-cols-1 divide-y divide-border-99 md:grid-cols-2 md:gap-x-8 md:divide-y-0" role="list">
              {section.items.map((it) => {
                const semCor = !it.available;
                return (
                  <li key={it.id}>
                    <button type="button" onClick={() => setItem(it)} className="flex w-full gap-4 py-4 text-left">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <h3 className={cx("text-[17px] font-bold leading-snug", semCor && "text-secondary-99")}>{it.name}</h3>
                          {semCor && <Badge tone="neutral">Indisponível</Badge>}
                        </div>
                        <p className="line-clamp-2 text-[14px] text-secondary-99">{it.description}</p>
                        <Price item={it} className="mt-auto pt-1" />
                      </div>
                      <ItemPhoto item={it} restaurant={restaurant} className={cx("h-24 w-24", semCor && "grayscale")} add={it.available && restaurant.open} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {/* Faixa verde colada no rodapé enquanto o pedido não chega ao mínimo, como no app. */}
      {restaurant.open && faltaMinimo > 0 && (
        <p className="fixed inset-x-0 bottom-0 z-20 bg-green-99-tint px-4 py-3 text-center text-[14px] text-black-99 min-[400px]:text-[15px] md:hidden">
          Adicione {formatBRL(faltaMinimo)} para atingir o valor mínimo
        </p>
      )}

      <StoreInfoModal
        restaurant={restaurant}
        aba={infoAba ?? "informacoes"}
        onAba={setInfoAba}
        open={infoAba !== null}
        onClose={() => setInfoAba(null)}
      />

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

/** Botão branco quadrado de canto arredondado sobre a capa, como no app. */
const coverButton =
  "flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black-99 transition-colors duration-150 hover:bg-offwhite-99";

/**
 * Preço do prato: verde com "a partir de" quando tem opções, o cheio riscado
 * e o selo de desconto ao lado. Sem promoção, só o valor em preto.
 */
function Price({ item, className, compact }: { item: MenuItem; className?: string; compact?: boolean }) {
  const promo = item.promoPrice;
  return (
    <div className={cx("flex flex-col", className)}>
      {promo && item.options?.length ? <span className="text-[14px] text-green-99">a partir de</span> : null}
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span className={cx("font-bold tabular-nums", compact ? "text-[16px]" : "text-[18px]", promo ? "text-green-99" : null)}>
          {formatBRL(promo ?? item.price)}
        </span>
        {promo ? <span className="text-[13px] tabular-nums text-muted-99 line-through">{formatBRL(item.price)}</span> : null}
        {promo && !compact ? (
          <span className="rounded-md bg-green-99-tint px-1.5 py-0.5 text-[13px] text-green-99">-{discountPercent(item.price, promo)}%</span>
        ) : null}
      </p>
    </div>
  );
}

/** Foto do prato com o botão amarelo de adicionar no canto, recortado da foto. */
function ItemPhoto({
  item,
  restaurant,
  className,
  add,
  onTint,
}: {
  item: MenuItem;
  restaurant: Restaurant;
  className?: string;
  add?: boolean;
  /** Sobre o card amarelo o recorte do botão acompanha o fundo. */
  onTint?: boolean;
}) {
  return (
    <span className={cx("relative block shrink-0", className)}>
      <FoodArt kind={item.art} seed={item.id} index={menuVariantIndex(restaurant, item.id)} tint={restaurant.tint} className="h-full w-full rounded-2xl" />
      {add && (
        <span
          aria-hidden="true"
          className={cx(
            "absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-xl rounded-br-2xl bg-yellow-99 text-black-99 ring-4",
            onTint ? "ring-yellow-99-light" : "ring-white",
          )}
        >
          <Icon name="plus" size={20} />
        </span>
      )}
    </span>
  );
}
