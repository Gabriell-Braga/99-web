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

export function BagContent({ onNavigate }: { onNavigate?: () => void }) {
  const { bag, updateQuantity } = useApp();
  const router = useRouter();
  const reduce = useReducedMotion();
  const restaurant = bag.restaurantSlug ? getRestaurant(bag.restaurantSlug) : undefined;
  const subtotal = bagSubtotal(bag);
  const fee = restaurant?.deliveryFee ?? 0;
  const total = subtotal + fee;
  const minOrder = restaurant?.minOrder ?? 0;
  const belowMin = subtotal < minOrder;

  if (bag.lines.length === 0 || !restaurant) {
    return (
      <EmptyState
        icon="bag"
        title="Sua sacola está vazia"
        description="Escolha um restaurante e adicione itens. Eles ficam aqui enquanto você navega."
        action={
          <LinkButton href="/comida" variant="ghost" size="sm">
            Ver restaurantes
          </LinkButton>
        }
        compact
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 pb-4">
        <div className="min-w-0">
          <p className="text-[13px] text-muted-99">Pedido em</p>
          <p className="truncate font-semibold">{restaurant.name}</p>
        </div>
        <LinkButton href={`/comida/${restaurant.slug}`} variant="text" size="sm">
          Adicionar mais
        </LinkButton>
      </div>

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
                <p className="font-semibold leading-snug">{l.name}</p>
                {l.selections.length > 0 && (
                  <p className="text-[13px] text-muted-99">
                    {l.selections.map((s) => s.choiceLabel).join(", ")}
                  </p>
                )}
                {l.note && <p className="text-[13px] italic text-muted-99">“{l.note}”</p>}
                <div className="mt-2 flex items-center justify-between gap-3">
                  <Stepper
                    value={l.quantity}
                    min={1}
                    onChange={(n) => updateQuantity(l.lineId, n)}
                    size="sm"
                    removeAtMin
                    label={`Quantidade de ${l.name}`}
                  />
                  <span className="text-sm font-bold">{formatBRL(l.unitPrice * l.quantity)}</span>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="flex flex-col gap-2 border-t border-border-99 pt-4 text-sm">
        <div className="flex justify-between text-secondary-99">
          <span>Subtotal</span>
          <span>{formatBRL(subtotal)}</span>
        </div>
        <div className="flex justify-between text-secondary-99">
          <span>Frete</span>
          <span>{fee === 0 ? "Grátis" : formatBRL(fee)}</span>
        </div>
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatBRL(total)}</span>
        </div>
        <Button
          full
          size="lg"
          className="mt-2"
          disabled={belowMin}
          onClick={() => {
            onNavigate?.();
            router.push("/comida/checkout");
          }}
        >
          Fechar pedido
        </Button>
        {belowMin && (
          <BlockedHint items={[`${formatBRL(minOrder - subtotal)} para o pedido mínimo de ${formatBRL(minOrder)}`]} />
        )}
      </div>
    </div>
  );
}

/** Coluna persistente à direita, visível a partir de lg. */
export function BagColumn() {
  return (
    <aside
      aria-label="Sacola"
      className="sticky top-[96px] hidden h-[calc(100dvh-120px)] w-[360px] shrink-0 flex-col rounded-2xl bg-white p-6 shadow-mid lg:flex"
    >
      <h2 className="mb-2 text-[22px] font-semibold">Sacola</h2>
      <div className="min-h-0 flex-1">
        <BagContent />
      </div>
    </aside>
  );
}

/** Botão flutuante com contador, abaixo de lg, abrindo a sacola em gaveta. */
export function BagFloating() {
  const { bag } = useApp();
  const [open, setOpen] = useState(false);
  const count = bagCount(bag);
  const subtotal = bagSubtotal(bag);
  if (count === 0) return null;
  return (
    <>
      <div className="fixed inset-x-4 bottom-4 z-30 lg:hidden">
        <Button full size="lg" onClick={() => setOpen(true)} className="shadow-high" aria-haspopup="dialog">
          <Icon name="bag" />
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-black-99 px-1.5 text-xs font-bold text-white">
            {count}
          </span>
          <span className="flex-1 text-left">Ver sacola</span>
          <span>{formatBRL(subtotal)}</span>
        </Button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Sacola" width="sm">
        <BagContent onNavigate={() => setOpen(false)} />
      </Modal>
    </>
  );
}
