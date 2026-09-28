"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { bagCount, bagSubtotal, useApp } from "@/context/AppProvider";
import { getRestaurant } from "@/data/restaurants";
import { formatBRL } from "@/lib/format";
import { Button, LinkButton } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { EmptyState, BlockedHint } from "@/components/ui/States";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { isStoreRoute } from "@/lib/routes";
import { cx } from "@/lib/cx";
import { FoodArt } from "@/components/comida/FoodArt";
import { menuVariantIndex } from "@/data/foodPhotos";

/** Conteúdo do carrinho: itens com stepper de círculos vazados, totais e "Continuar". */
export function CartContent({ onNavigate }: { onNavigate?: () => void }) {
  const { bag, updateQuantity } = useApp();
  const router = useRouter();
  const reduce = useReducedMotion();
  const restaurant = bag.restaurantSlug ? getRestaurant(bag.restaurantSlug) : undefined;
  const subtotal = bagSubtotal(bag);
  const count = bagCount(bag);
  const fee = restaurant?.deliveryFee ?? 0;
  const feeFull = restaurant?.deliveryFeeFull;
  const savings = feeFull && feeFull > fee ? feeFull - fee : 0;
  const total = subtotal + fee;
  const minOrder = restaurant?.minOrder ?? 0;
  const belowMin = subtotal < minOrder;

  if (bag.lines.length === 0 || !restaurant) {
    return (
      <EmptyState
        icon="cart"
        title="Seu carrinho está vazio"
        description="Escolha uma loja e adicione itens. Eles ficam aqui enquanto você navega."
        action={
          <LinkButton href="/comida" variant="ghost" size="sm">
            Ver lojas
          </LinkButton>
        }
        compact
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="min-w-0">
          <p className="text-[13px] text-secondary-99">Pedido em</p>
          <p className="truncate text-[15px] font-bold">{restaurant.name}</p>
        </div>
        <LinkButton href={`/comida/${restaurant.slug}`} variant="text" size="sm">
          Mais
        </LinkButton>
      </div>

      {belowMin && (
        <p className="mb-3 rounded-xl bg-green-99-tint px-3 py-2 text-[13px] font-bold text-green-99-ink">
          Faltam {formatBRL(minOrder - subtotal)} para o valor mínimo de {formatBRL(minOrder)}.
        </p>
      )}

      <ul className="flex flex-1 flex-col divide-y divide-border-99 overflow-y-auto" role="list">
        <AnimatePresence initial={false}>
          {bag.lines.map((l) => (
            <motion.li
              key={l.lineId}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex gap-3 overflow-hidden py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold leading-snug">{l.name}</p>
                {l.selections.length > 0 && (
                  <p className="text-[13px] text-secondary-99">{l.selections.map((s) => s.choiceLabel).join(", ")}</p>
                )}
                {l.note && <p className="text-[13px] italic text-secondary-99">“{l.note}”</p>}
                <div className="mt-2 flex items-center justify-between gap-3">
                  <Stepper
                    value={l.quantity}
                    min={1}
                    onChange={(n) => updateQuantity(l.lineId, n)}
                    size="sm"
                    variant="circle"
                    removeAtMin
                    label={`Quantidade de ${l.name}`}
                  />
                  <span className="text-[15px] font-bold tabular-nums">{formatBRL(l.unitPrice * l.quantity)}</span>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="flex flex-col gap-2 border-t border-border-99 pt-4 text-sm">
        <div className="flex justify-between text-secondary-99">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatBRL(subtotal)}</span>
        </div>
        <div className="flex justify-between text-secondary-99">
          <span>Taxa de entrega</span>
          <span className="tabular-nums">
            {feeFull && feeFull > fee && <span className="mr-2 text-muted-99 line-through">{formatBRL(feeFull)}</span>}
            <span className={fee === 0 || savings ? "font-bold text-green-99" : ""}>{fee === 0 ? "Grátis" : formatBRL(fee)}</span>
          </span>
        </div>
        <div className="flex items-end justify-between pt-1">
          <span className="text-[15px] font-bold">Total</span>
          <span className="flex flex-col items-end leading-tight">
            <span className="text-2xl font-bold tabular-nums">{formatBRL(total)}</span>
            {savings > 0 && <span className="text-[13px] font-bold text-green-99">Você economiza {formatBRL(savings)}</span>}
          </span>
        </div>
        <Button
          full
          size="lg"
          className="mt-2"
          count={count}
          disabled={belowMin}
          onClick={() => {
            onNavigate?.();
            router.push("/comida/checkout");
          }}
        >
          Continuar
        </Button>
        {belowMin && <BlockedHint items={[`${formatBRL(minOrder - subtotal)} para o pedido mínimo`]} />}
      </div>
    </div>
  );
}

/** Coluna fixa de 360px à direita, sempre visível a partir de lg. */
export function CartColumn() {
  return (
    <aside
      aria-label="Carrinho"
      className="sticky top-6 hidden h-[calc(100dvh-48px)] w-[360px] shrink-0 flex-col rounded-2xl border border-border-99 bg-white p-6 lg:flex"
    >
      <h2 className="mb-2 text-[20px] font-bold">Carrinho</h2>
      <div className="min-h-0 flex-1">
        <CartContent />
      </div>
    </aside>
  );
}

/** Abaixo de lg, botão fixo no rodapé com contador, abrindo o carrinho em folha. */
export function CartFloating() {
  const { bag } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const count = bagCount(bag);
  const subtotal = bagSubtotal(bag);
  if (count === 0) return null;
  return (
    <>
      {/* Na loja a pílula de serviços sai no celular; o botão fica logo acima da faixa do mínimo. */}
      <div className={cx("fixed inset-x-4 z-30 lg:hidden", isStoreRoute(pathname) ? "bottom-16 md:bottom-28" : "bottom-28")}>
        <Button full size="lg" onClick={() => setOpen(true)} className="shadow-high" aria-haspopup="dialog">
          <Icon name="cart" />
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-black-99 px-1.5 text-xs font-bold text-white">{count}</span>
          <span className="flex-1 text-left">Ver carrinho</span>
          <span className="tabular-nums">{formatBRL(subtotal)}</span>
        </Button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Carrinho" width="sm" bare>
        <CartScreen onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

/**
 * Carrinho como tela do app: nome da loja com "Limpar", itens com foto e
 * stepper de círculos vazados, faixa verde de cupons e rodapé com o total e
 * "Continuar" com o contador. No celular ocupa a tela toda.
 */
function CartScreen({ onClose }: { onClose: () => void }) {
  const { bag, updateQuantity, clearBag } = useApp();
  const router = useRouter();
  const restaurant = bag.restaurantSlug ? getRestaurant(bag.restaurantSlug) : undefined;
  const subtotal = bagSubtotal(bag);
  const count = bagCount(bag);
  if (!restaurant || bag.lines.length === 0) return null;

  const items = restaurant.menu.flatMap((s) => s.items);
  const fullOf = (itemId: string, unit: number) => {
    const it = items.find((i) => i.id === itemId);
    if (!it?.promoPrice) return null;
    return it.price + (unit - it.promoPrice);
  };
  const savings = bag.lines.reduce((sum, l) => {
    const full = fullOf(l.itemId, l.unitPrice);
    return full ? sum + (full - l.unitPrice) * l.quantity : sum;
  }, 0);
  const belowMin = subtotal < restaurant.minOrder;

  return (
    <>
      <div className="flex items-center gap-2 px-2 pb-2 pt-4 md:px-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Voltar"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-black-99 transition-colors hover:bg-offwhite-99"
        >
          <Icon name="chevronLeft" size={30} />
        </button>
        <p className="min-w-0 flex-1 truncate text-[20px] font-bold min-[400px]:text-[22px]">{restaurant.name}</p>
        <button
          type="button"
          onClick={() => {
            clearBag();
            onClose();
          }}
          className="shrink-0 rounded-xl px-3 py-2 text-[17px] text-black-99 transition-colors hover:bg-offwhite-99"
        >
          Limpar
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <ul className="flex flex-col px-4 md:px-6" role="list">
          {bag.lines.map((l) => {
            const it = items.find((i) => i.id === l.itemId);
            const full = fullOf(l.itemId, l.unitPrice);
            return (
              <li key={l.lineId} className="flex gap-4 py-4">
                {it && (
                  <FoodArt
                    kind={it.art}
                    src={it.photo}
                    seed={it.id}
                    index={menuVariantIndex(restaurant, it.id)}
                    tint={restaurant.tint}
                    className="h-16 w-16 shrink-0 rounded-xl"
                  />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-[17px] leading-snug">{l.name}</p>
                  {l.selections.length > 0 && (
                    <p className="text-[13px] text-secondary-99">{l.selections.map((s) => s.choiceLabel).join(", ")}</p>
                  )}
                  {l.note && <p className="text-[13px] italic text-secondary-99">“{l.note}”</p>}
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <p className="flex items-baseline gap-1.5 whitespace-nowrap tabular-nums">
                      <span className={cx("text-[17px] font-bold", full ? "text-green-99" : null)}>{formatBRL(l.unitPrice * l.quantity)}</span>
                      {full ? <span className="text-[14px] text-muted-99 line-through">{formatBRL(full * l.quantity)}</span> : null}
                    </p>
                    <Stepper
                      value={l.quantity}
                      min={1}
                      onChange={(n) => updateQuantity(l.lineId, n)}
                      size="sm"
                      variant="circle"
                      removeAtMin
                      label={`Quantidade de ${l.name}`}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-2 flex items-center gap-4 bg-green-99-tint px-4 py-5 md:px-6">
          <Icon name="couponFill" size={26} className="shrink-0 text-green-99" />
          <p className="min-w-0 flex-1 truncate text-[16px] min-[400px]:text-[17px]">Cupons de desconto</p>
          <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[14px] text-black-99">
            No checkout
            <Icon name="chevronRight" size={20} />
          </span>
        </div>

        {belowMin && (
          <p className="mx-4 mt-4 rounded-xl bg-yellow-99-light px-4 py-3 text-[14px] md:mx-6">
            Adicione {formatBRL(restaurant.minOrder - subtotal)} para atingir o valor mínimo de {formatBRL(restaurant.minOrder)}.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border-99 bg-white px-4 py-4 min-[400px]:gap-4 md:px-6">
        <div className="flex flex-col leading-tight">
          <span className="whitespace-nowrap text-[22px] font-bold tabular-nums min-[360px]:text-[24px] min-[400px]:text-[26px]">{formatBRL(subtotal)}</span>
          {savings > 0 && <span className="whitespace-nowrap text-[14px] text-green-99 min-[400px]:text-[15px]">Economizou {formatBRL(savings)}</span>}
        </div>
        <Button
          size="lg"
          count={count}
          disabled={belowMin}
          className="shrink-0 rounded-2xl max-[359px]:px-3 max-[399px]:px-4 max-[359px]:text-[15px] max-[399px]:text-[16px] min-[360px]:min-w-[150px] min-[400px]:min-w-[180px] min-[400px]:text-[18px]"
          onClick={() => {
            onClose();
            router.push("/comida/checkout");
          }}
        >
          Continuar
        </Button>
      </div>
    </>
  );
}
