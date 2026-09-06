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
import { ActionBar, TotalBlock } from "@/components/layout/ActionBar";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, BlockedHint, ErrorNote } from "@/components/ui/States";
import { AddressPicker } from "@/components/comida/AddressPicker";
import { PaymentPicker } from "@/components/payment/PaymentPicker";
import { CardForm, cardIsValid, demoCard, type CardData } from "@/components/payment/CardForm";
import { PaymentFlow } from "@/components/payment/PaymentFlow";
import { cx } from "@/lib/cx";

type DeliveryMode = FoodOrder["deliveryMode"];

const modes: { id: DeliveryMode; label: string; hint: (min: number, max: number) => string; extra: number }[] = [
  { id: "padrao", label: "Padrão", hint: (a, b) => `${a}–${b} min`, extra: 0 },
  { id: "rapida", label: "Rápida", hint: (a, b) => `${Math.max(10, a - 10)}–${Math.max(15, b - 10)} min`, extra: 4 },
  { id: "retirada", label: "Retirar na loja", hint: (a) => `Pronto em ${Math.max(10, a - 15)} min`, extra: 0 },
];

function Card({ title, children, id }: { title: string; children: React.ReactNode; id: string }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-5" aria-labelledby={id}>
      <h2 id={id} className="text-[17px] font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const router = useRouter();
  const { bag, address, clearBag, saveOrder } = useApp();
  const restaurant = bag.restaurantSlug ? getRestaurant(bag.restaurantSlug) : undefined;

  const [mode, setMode] = useState<DeliveryMode>("padrao");
  const [payment, setPayment] = useState<PaymentMethod | null>("cartao");
  const [card, setCard] = useState<CardData>(demoCard);
  const [cardTouched, setCardTouched] = useState<Partial<Record<keyof CardData, boolean>>>({});
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [orderId] = useState(() => newOrderId("comida"));

  const subtotal = bagSubtotal(bag);
  const baseFee = restaurant?.deliveryFee ?? 0;
  const feeFull = restaurant?.deliveryFeeFull;
  const modeExtra = modes.find((m) => m.id === mode)?.extra ?? 0;
  const fee = mode === "retirada" ? 0 : baseFee + modeExtra;

  const discount = useMemo(() => {
    if (!coupon) return 0;
    const c = coupons[coupon];
    if (!c) return 0;
    if (c.amount === -1) return fee;
    return Math.min(c.amount, subtotal);
  }, [coupon, fee, subtotal]);

  const feeSavings = mode !== "retirada" && feeFull && feeFull > baseFee ? feeFull - baseFee : 0;
  const savings = discount + feeSavings;
  const total = Math.max(0, subtotal + fee - discount);

  const missing: string[] = [];
  if (!payment) missing.push("escolher a forma de pagamento");
  if (payment === "cartao" && !cardIsValid(card)) missing.push("completar os dados do cartão");
  if (mode !== "retirada" && !address.covered) missing.push("um endereço dentro do raio de entrega");
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
      <Container className="py-16 pb-40">
        <EmptyState
          icon="cart"
          title="Seu carrinho está vazio"
          description="Adicione itens de uma loja para continuar."
          action={<LinkButton href="/comida">Ver lojas</LinkButton>}
        />
      </Container>
    );
  }

  if (paying && payment) {
    return (
      <Container className="py-16 pb-40">
        <PaymentFlow method={payment} amount={total} orderRef={orderId} noun="pedido" onConfirmed={confirm} onCancel={() => setPaying(false)} />
      </Container>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-subtle-99 lg:rounded-tl-[24px]">
      <Container className="flex flex-1 flex-col gap-5 py-6 pb-44 lg:pb-32">
        <nav aria-label="Navegação" className="text-[15px]">
          <Link href={`/comida/${restaurant.slug}`} className="inline-flex items-center gap-1 font-bold text-secondary-99 hover:text-black-99">
            <Icon name="arrowLeft" size={16} />
            Voltar ao cardápio
          </Link>
        </nav>
        <h1 className="text-[22px] font-bold">Detalhes da entrega</h1>

        <div className="grid gap-5 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="flex flex-col gap-5">
            <Card id="ck-endereco" title="Informações da entrega">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[17px] font-bold">{address.line1}</p>
                  <p className="text-[15px] text-secondary-99">
                    {address.line2} · {address.city}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
                  Mudar
                </Button>
              </div>
              {!address.covered && mode !== "retirada" && (
                <ErrorNote
                  title="Endereço fora do raio de entrega"
                  description={`A loja não entrega em ${address.line1}, ${address.city}. Troque o endereço ou escolha retirar na loja.`}
                />
              )}
              <div className="flex items-center gap-3 rounded-xl bg-yellow-99-light px-4 py-3">
                <Icon name="clock" size={20} className="shrink-0 text-black-99" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold">No Horário</p>
                  <p className="text-[13px] text-secondary-99">
                    Previsão de {modes.find((m) => m.id === mode)?.hint(restaurant.etaMin, restaurant.etaMax)}
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {modes.map((m) => {
                  const checked = mode === m.id;
                  const price = m.id === "retirada" ? 0 : baseFee + m.extra;
                  return (
                    <label
                      key={m.id}
                      className={cx(
                        "flex cursor-pointer flex-col gap-0.5 rounded-xl border border-border-99 px-4 py-3 transition-colors duration-150 ease-out",
                        checked ? "bg-offwhite-99" : "hover:bg-offwhite-99",
                      )}
                    >
                      <input type="radio" name="entrega" className="sr-only" checked={checked} onChange={() => setMode(m.id)} />
                      <span className="text-[15px] font-bold">{m.label}</span>
                      <span className="text-[13px] text-secondary-99">{m.hint(restaurant.etaMin, restaurant.etaMax)}</span>
                      <span className={cx("text-[15px] font-bold tabular-nums", price === 0 && "text-green-99")}>{price === 0 ? "Grátis" : formatBRL(price)}</span>
                    </label>
                  );
                })}
              </div>
            </Card>

            <Card id="ck-pagamento" title="Pagar">
              <PaymentPicker value={payment} onChange={setPayment} />
              {payment === "cartao" && (
                <CardForm value={card} onChange={setCard} touched={cardTouched} onTouch={(k) => setCardTouched((t) => ({ ...t, [k]: true }))} />
              )}
              {payment === "dinheiro" && <Input label="Troco para quanto?" placeholder="Ex.: R$ 100,00 (opcional)" inputMode="numeric" />}
            </Card>

            <section className="flex flex-col gap-3 rounded-2xl bg-green-99-tint p-5" aria-labelledby="ck-cupom">
              <h2 id="ck-cupom" className="flex items-center gap-2 text-[17px] font-bold text-green-99-ink">
                <Icon name="coupon" size={20} />
                Cupons de desconto
              </h2>
              {coupon ? (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                  <span className="flex items-center gap-2 text-[15px] font-bold text-green-99">
                    <Icon name="check" size={18} />
                    {coupon} · {coupons[coupon].label}
                  </span>
                  <button
                    type="button"
                    className="text-[15px] font-bold text-secondary-99 hover:underline"
                    onClick={() => {
                      setCoupon(null);
                      setCouponInput("");
                    }}
                  >
                    Limpar
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Input
                    variant="boxed"
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
                    hint="Economize hoje: PRIMEIRA10 ou FRETE99."
                    aria-label="Código do cupom"
                    wrapperClassName="flex-1"
                  />
                  <Button variant="secondary" onClick={applyCoupon} disabled={!couponInput.trim()}>
                    Adicionar
                  </Button>
                </div>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-5 lg:sticky lg:top-6">
            <Card id="ck-resumo" title="Resumo do pedido">
              <p className="text-[15px] text-secondary-99">{restaurant.name}</p>
              <ul className="flex flex-col gap-3 border-y border-border-99 py-4 text-[15px]" role="list">
                {bag.lines.map((l) => (
                  <li key={l.lineId} className="flex justify-between gap-3">
                    <span className="min-w-0">
                      <span className="font-bold">{l.quantity}×</span> {l.name}
                      {l.selections.length > 0 && (
                        <span className="block text-[13px] text-secondary-99">{l.selections.map((s) => s.choiceLabel).join(", ")}</span>
                      )}
                    </span>
                    <span className="shrink-0 tabular-nums">{formatBRL(l.unitPrice * l.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2 text-[15px]">
                <div className="flex justify-between text-secondary-99">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-secondary-99">
                  <span>Taxa de entrega</span>
                  <span className="tabular-nums">
                    {feeSavings > 0 && <span className="mr-2 text-muted-99 line-through">{formatBRL(feeFull! + modeExtra)}</span>}
                    <span className={cx(fee === 0 || feeSavings > 0 ? "font-bold text-green-99" : "")}>{fee === 0 ? "Grátis" : formatBRL(fee)}</span>
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-bold text-green-99">
                    <span>Cupom</span>
                    <span className="tabular-nums">- {formatBRL(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-[17px] font-bold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatBRL(total)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border-99 bg-white">
        <Container className="py-3">
          <ActionBar
            left={<TotalBlock total={formatBRL(total)} savings={savings > 0 ? `Você economiza ${formatBRL(savings)}` : undefined} label="Total" />}
            action={
              <Button size="lg" full disabled={blocked} onClick={() => setPaying(true)}>
                Pagar
              </Button>
            }
            hint={<BlockedHint items={missing} />}
          />
        </Container>
      </div>
      <AddressPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}
