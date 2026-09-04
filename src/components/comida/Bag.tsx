"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { bagCount, bagSubtotal, useApp } from "@/context/AppProvider";
import { getRestaurant } from "@/data/restaurants";
import { formatBRL } from "@/lib/format";
import { Button, LinkButton } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { EmptyState, BlockedHint } from "@/components/ui/States";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";

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
  const [open, setOpen] = useState(false);
  const count = bagCount(bag);
  const subtotal = bagSubtotal(bag);
  if (count === 0) return null;
  return (
    <>
      <div className="fixed inset-x-4 bottom-24 z-30 lg:hidden">
        <Button full size="lg" onClick={() => setOpen(true)} className="shadow-high" aria-haspopup="dialog">
          <Icon name="cart" strokeWidth={2.2} />
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-black-99 px-1.5 text-xs font-bold text-white">{count}</span>
          <span className="flex-1 text-left">Ver carrinho</span>
          <span className="tabular-nums">{formatBRL(subtotal)}</span>
        </Button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Carrinho" width="sm">
        <CartContent onNavigate={() => setOpen(false)} />
      </Modal>
    </>
  );
}
