"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bagSubtotal, useApp } from "@/context/AppProvider";
import { getRestaurant } from "@/data/restaurants";
import { coupons } from "@/lib/pricing";
import { formatBRL } from "@/lib/format";
import { newOrderId, stagesFor } from "@/lib/stages";
import type { FoodOrder, PaymentMethod } from "@/lib/types";
import { Container } from "@/components/layout/Container";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, BlockedHint, ErrorNote } from "@/components/ui/States";
import { AddressPicker } from "@/components/comida/AddressPicker";
import { PaymentPicker } from "@/components/payment/PaymentPicker";
import { CardForm, cardIsValid, emptyCard, type CardData } from "@/components/payment/CardForm";
import { PaymentFlow } from "@/components/payment/PaymentFlow";
import { cx } from "@/lib/cx";

type DeliveryMode = FoodOrder["deliveryMode"];

const modes: { id: DeliveryMode; label: string; hint: (min: number, max: number) => string; extra: number }[] = [
  { id: "padrao", label: "Padrão", hint: (a, b) => `${a}–${b} min`, extra: 0 },
  { id: "rapida", label: "Rápida", hint: (a, b) => `${Math.max(10, a - 10)}–${Math.max(15, b - 10)} min`, extra: 4 },
  { id: "retirada", label: "Retirar no restaurante", hint: (a) => `Pronto em ${Math.max(10, a - 15)} min`, extra: 0 },
];

export function CheckoutView() {
  const router = useRouter();
  const { bag, address, clearBag, saveOrder } = useApp();
  const restaurant = bag.restaurantSlug ? getRestaurant(bag.restaurantSlug) : undefined;

  const [mode, setMode] = useState<DeliveryMode>("padrao");
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [card, setCard] = useState<CardData>(emptyCard);
  const [cardTouched, setCardTouched] = useState<Partial<Record<keyof CardData, boolean>>>({});
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [orderId] = useState(() => newOrderId("comida"));

  const subtotal = bagSubtotal(bag);
  const baseFee = restaurant?.deliveryFee ?? 0;
  const modeExtra = modes.find((m) => m.id === mode)?.extra ?? 0;
  const fee = mode === "retirada" ? 0 : baseFee + modeExtra;

  const discount = useMemo(() => {
    if (!coupon) return 0;
    const c = coupons[coupon];
    if (!c) return 0;
    if (c.amount === -1) return fee;
    return Math.min(c.amount, subtotal);
  }, [coupon, fee, subtotal]);

  const total = Math.max(0, subtotal + fee - discount);

  const missing: string[] = [];
  if (!payment) missing.push("escolher a forma de pagamento");
  if (payment === "cartao" && !cardIsValid(card)) missing.push("completar os dados do cartão");
  if (mode !== "retirada" && !address.covered) missing.push("um endereço dentro da área de entrega");
  const blocked = missing.length > 0;

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    const c = coupons[code];
    if (!c) {
      setCouponError("Cupom não encontrado. Confira o código ou tente PRIMEIRA10.");
      return;
    }
    if (subtotal < c.minSubtotal) {
      setCouponError(`Este cupom vale para pedidos acima de ${formatBRL(c.minSubtotal)}.`);
      return;
    }
    setCoupon(code);
    setCouponError(null);
  }

  const confirm = useCallback(() => {
    if (!restaurant || !payment) return;
    const eta =
      mode === "retirada"
        ? `Pronto em ${Math.max(10, restaurant.etaMin - 15)} min`
        : `Chega em ${modes.find((m) => m.id === mode)?.hint(restaurant.etaMin, restaurant.etaMax)}`;
    const order: FoodOrder = {
      id: orderId,
      vertical: "comida",
      createdAt: Date.now(),
      payment,
      total,
      stages: stagesFor("comida", eta),
      origin: { label: restaurant.name, lat: restaurant.location.lat, lng: restaurant.location.lng },
      destination: { label: address.line1, lat: address.lat, lng: address.lng },
      restaurantName: restaurant.name,
      restaurantSlug: restaurant.slug,
      lines: bag.lines,
      subtotal,
      deliveryFee: fee,
      discount,
      deliveryMode: mode,
      addressLabel: `${address.line1} · ${address.line2}`,
      courier: { name: "Wesley Santos", vehicle: "Moto", rating: 4.9 },
    };
    saveOrder(order);
    clearBag();
    router.push(`/pedido/${order.id}`);
  }, [restaurant, payment, mode, orderId, total, address, bag.lines, subtotal, fee, discount, saveOrder, clearBag, router]);

  if (!restaurant || bag.lines.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          icon="bag"
          title="Sua sacola está vazia"
          description="Adicione itens de um restaurante para fechar o pedido."
          action={<LinkButton href="/comida">Ver restaurantes</LinkButton>}
        />
      </Container>
    );
  }

  if (paying && payment) {
    return (
      <Container className="py-16">
        <PaymentFlow
          method={payment}
          amount={total}
          orderRef={orderId}
          noun="pedido"
          onConfirmed={confirm}
          onCancel={() => setPaying(false)}
        />
      </Container>
    );
  }

  return (
    <Container className="py-6 pb-28 lg:py-10">
      <nav aria-label="Navegação" className="mb-4 text-sm">
        <Link href={`/comida/${restaurant.slug}`} className="inline-flex items-center gap-1 font-semibold text-secondary-99 hover:text-black-99">
          <Icon name="arrowLeft" size={16} />
          Voltar ao cardápio
        </Link>
      </nav>
      <h1 className="mb-8 text-[28px] font-semibold md:text-[40px] md:font-bold">Fechar pedido</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4 rounded-2xl border border-border-99 p-6" aria-labelledby="ck-endereco">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="ck-endereco" className="text-[22px] font-semibold">
                  Endereço de entrega
                </h2>
                <p className="mt-1 font-semibold">{address.line1}</p>
                <p className="text-sm text-secondary-99">
                  {address.line2} · {address.city}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
                Trocar
              </Button>
            </div>
            {!address.covered && mode !== "retirada" && (
              <ErrorNote
                title="Endereço fora do raio de entrega"
                description={`O restaurante não entrega em ${address.line1}, ${address.city}. Troque o endereço ou escolha retirar no restaurante.`}
              />
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-border-99 p-6" aria-labelledby="ck-entrega">
            <h2 id="ck-entrega" className="text-[22px] font-semibold">
              Forma de entrega
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {modes.map((m) => {
                const checked = mode === m.id;
                const price = m.id === "retirada" ? 0 : baseFee + m.extra;
                return (
                  <label
                    key={m.id}
                    className={cx(
                      "flex cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3 transition-colors",
                      checked ? "border-black-99 bg-subtle-99" : "border-border-99 hover:bg-subtle-99",
                    )}
                  >
                    <input
                      type="radio"
                      name="entrega"
                      className="sr-only"
                      checked={checked}
                      onChange={() => setMode(m.id)}
                    />
                    <span className="font-semibold">{m.label}</span>
                    <span className="text-[13px] text-muted-99">{m.hint(restaurant.etaMin, restaurant.etaMax)}</span>
                    <span className="text-sm font-bold">{price === 0 ? "Grátis" : formatBRL(price)}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-border-99 p-6" aria-labelledby="ck-pagamento">
            <h2 id="ck-pagamento" className="text-[22px] font-semibold">
              Pagamento
            </h2>
            <PaymentPicker value={payment} onChange={setPayment} />
            {payment === "cartao" && (
              <CardForm
                value={card}
                onChange={setCard}
                touched={cardTouched}
                onTouch={(k) => setCardTouched((t) => ({ ...t, [k]: true }))}
              />
            )}
            {payment === "dinheiro" && (
              <Input label="Troco para quanto?" placeholder="Ex.: R$ 100,00 (opcional)" inputMode="numeric" />
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-2xl border border-border-99 p-6" aria-labelledby="ck-cupom">
            <h2 id="ck-cupom" className="text-[22px] font-semibold">
              Cupom
            </h2>
            {coupon ? (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-success-99-bg px-4 py-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-success-99-deep">
                  <Icon name="check" size={18} />
                  {coupon} aplicado: {coupons[coupon].label}
                </span>
                <button
                  type="button"
                  className="text-sm font-semibold text-secondary-99 hover:underline"
                  onClick={() => {
                    setCoupon(null);
                    setCouponInput("");
                  }}
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <Input
                  placeholder="Digite o código"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCoupon();
                    }
                  }}
                  error={couponError ?? undefined}
                  hint="Experimente PRIMEIRA10 ou FRETE99."
                  aria-label="Código do cupom"
                  wrapperClassName="flex-1"
                />
                <Button variant="ghost" onClick={applyCoupon} disabled={!couponInput.trim()}>
                  Aplicar
                </Button>
              </div>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-mid lg:sticky lg:top-24" aria-labelledby="ck-resumo">
          <h2 id="ck-resumo" className="text-[22px] font-semibold">
            Resumo
          </h2>
          <p className="text-sm text-secondary-99">{restaurant.name}</p>
          <ul className="flex flex-col gap-3 border-y border-border-99 py-4 text-sm" role="list">
            {bag.lines.map((l) => (
              <li key={l.lineId} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="font-semibold">{l.quantity}×</span> {l.name}
                  {l.selections.length > 0 && (
                    <span className="block text-[13px] text-muted-99">
                      {l.selections.map((s) => s.choiceLabel).join(", ")}
                    </span>
                  )}
                </span>
                <span className="shrink-0">{formatBRL(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-secondary-99">
              <span>Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-secondary-99">
              <span>Frete</span>
              <span>{fee === 0 ? "Grátis" : formatBRL(fee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success-99-deep">
                <span>Desconto</span>
                <span>- {formatBRL(discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 text-lg font-bold">
              <span>Total</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>
          <Button size="lg" full disabled={blocked} onClick={() => setPaying(true)}>
            Confirmar pedido
          </Button>
          <BlockedHint items={missing} />
          <p className="text-center text-[13px] text-muted-99">Simulação: nenhum pagamento é processado.</p>
        </aside>
      </div>
      <AddressPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </Container>
  );
}
