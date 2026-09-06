"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactPoint, DeliveryOrder, PackageSize, PaymentMethod } from "@/lib/types";
import { deliveryCategories } from "@/data/rides";
import { deliveryEtaMin, deliveryFare } from "@/lib/pricing";
import { formatBRL, formatKm, formatPhone } from "@/lib/format";
import { newOrderId, stagesFor } from "@/lib/stages";
import { fetchRoute, type GeoPlace, type RouteResult } from "@/lib/geo";
import { useCurrentLocation } from "@/lib/useGeolocation";
import { useApp } from "@/context/AppProvider";
import { MapPanelLayout } from "@/components/layout/MapPanelLayout";
import { ActionBar, PaymentBlock } from "@/components/layout/ActionBar";
import { MapView } from "@/components/map/MapView";
import { AddressSearch, type PastedExtras } from "@/components/map/AddressSearch";
import { RoutePair } from "@/components/map/RoutePair";
import { VehicleArt } from "@/components/ui/VehicleArt";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { BlockedHint, ErrorNote, InfoNote } from "@/components/ui/States";
import { PaymentPicker, paymentLabel } from "@/components/payment/PaymentPicker";
import { CardForm, cardIsValid, demoCard, type CardData } from "@/components/payment/CardForm";
import { usePriceSkeleton, PriceSkeleton } from "@/components/ui/PriceSkeleton";
import { PaymentFlow } from "@/components/payment/PaymentFlow";
import { cx } from "@/lib/cx";

interface PointState {
  place: GeoPlace | null;
  number: string;
  complement: string;
  name: string;
  phone: string;
}

const emptyPoint: PointState = { place: null, number: "", complement: "", name: "", phone: "" };

const paymentIcon: Record<PaymentMethod, "pix" | "card" | "cash" | "ticket"> = {
  pix: "pix",
  cartao: "card",
  dinheiro: "cash",
  vale: "ticket",
};

function toContact(p: PointState): ContactPoint {
  const place = p.place!;
  return {
    street: place.street,
    number: place.number || p.number,
    complement: p.complement,
    neighborhood: place.neighborhood,
    city: place.city,
    cep: place.cep,
    name: p.name,
    phone: p.phone.replace(/\D/g, ""),
  };
}

function pointLabel(p: PointState): string {
  const place = p.place!;
  return place.number || !p.number ? place.title : `${place.title}, ${p.number}`;
}

function contactLine(p: PointState): string | undefined {
  if (!p.name && !p.phone) return undefined;
  return [p.name, p.phone].filter(Boolean).join(" · ");
}

function pointMissing(p: PointState, label: string): string[] {
  const out: string[] = [];
  if (!p.place) out.push(`o endereço de ${label}`);
  else {
    if (!p.place.covered) out.push(`um endereço de ${label} dentro da área`);
    if (!p.place.number && !p.place.exact && !p.number.trim()) out.push(`o número na ${label}`);
    if (!p.name.trim()) out.push(`o nome de quem ${label === "coleta" ? "envia" : "recebe"}`);
    if (p.phone.replace(/\D/g, "").length < 10) out.push(`o telefone de quem ${label === "coleta" ? "envia" : "recebe"}`);
  }
  return out;
}

/** Fluxo da 99 Entrega: abas Enviar e Receber, par origem e destino, detalhes e categoria. */
export function DeliveryView() {
  const router = useRouter();
  const { saveOrder } = useApp();
  const current = useCurrentLocation();
  const [tab, setTab] = useState<"enviar" | "receber">("enviar");
  const [pickup, setPickup] = useState<PointState>(emptyPoint);
  const [pickupTouched, setPickupTouched] = useState(false);
  const [dropoff, setDropoff] = useState<PointState>(emptyPoint);
  const [editing, setEditing] = useState<"pickup" | "dropoff" | null>(null);
  const [routeState, setRouteState] = useState<{ key: string; route: RouteResult } | null>(null);
  const [content, setContent] = useState("");
  const [size, setSize] = useState<PackageSize>("moto");
  const [payment, setPayment] = useState<PaymentMethod>("cartao");
  const [payOpen, setPayOpen] = useState(false);
  const [card, setCard] = useState<CardData>(demoCard);
  const [cardTouched, setCardTouched] = useState<Partial<Record<keyof CardData, boolean>>>({});
  const [paying, setPaying] = useState(false);
  const [orderId] = useState(() => newOrderId("entrega"));

  // Em "Enviar", a coleta começa na localização atual. Em "Receber", é a entrega.
  const mine = tab === "enviar" ? pickup : dropoff;
  const setMine = tab === "enviar" ? setPickup : setDropoff;
  if (!pickupTouched && !mine.place && current.place) {
    setMine({ ...mine, place: { ...current.place, title: "Localização atual", subtitle: `${current.place.title} · ${current.place.subtitle}` } });
  }

  const a = pickup.place;
  const b = dropoff.place;
  const routeKey = a && b ? `${a.lat},${a.lng}>${b.lat},${b.lng}` : null;
  const route = routeKey && routeState?.key === routeKey ? routeState.route : null;

  useEffect(() => {
    if (!a || !b || !routeKey) return;
    const controller = new AbortController();
    fetchRoute(a, b, controller.signal)
      .then((r) => setRouteState({ key: routeKey, route: r }))
      .catch(() => {});
    return () => controller.abort();
  }, [a, b, routeKey]);

  const km = route?.distanceKm ?? 0;
  const pricing = usePriceSkeleton(routeKey, Boolean(route));
  const fare = deliveryFare(km, size);
  const eta = deliveryEtaMin(km, route?.durationMin);
  const notCovered = [pickup.place, dropoff.place].find((p) => p && !p.covered);

  const missing = [
    ...pointMissing(pickup, "coleta"),
    ...pointMissing(dropoff, "entrega"),
    ...(a && b && !route ? ["calcular o trajeto"] : []),
    ...(!content.trim() ? ["os detalhes do item"] : []),
    ...(payment === "cartao" && !cardIsValid(card) ? ["os dados do cartão"] : []),
  ];
  const blocked = missing.length > 0;

  const confirm = useCallback(() => {
    if (!a || !b || !route) return;
    const order: DeliveryOrder = {
      id: orderId,
      vertical: "entrega",
      createdAt: Date.now(),
      payment,
      total: fare,
      stages: stagesFor("entrega", `Chega em ${eta.min}–${eta.max} min`),
      origin: { label: pointLabel(pickup), lat: a.lat, lng: a.lng },
      destination: { label: pointLabel(dropoff), lat: b.lat, lng: b.lng },
      route: route.points,
      pickup: toContact(pickup),
      dropoff: toContact(dropoff),
      content: content.trim(),
      size,
      distanceKm: km,
      courier: size === "moto"
        ? { name: "Diego Nascimento", vehicle: "Honda CG 160", plate: "DKT-7F31", rating: 4.88 }
        : { name: "Carlos Henrique", vehicle: "Chevrolet Onix", plate: "FGH-2C47", rating: 4.92 },
    };
    saveOrder(order);
    router.push(`/pedido/${order.id}`);
  }, [a, b, route, orderId, payment, fare, eta, pickup, dropoff, content, size, km, saveOrder, router]);

  const map = useMemo(
    () => (
      <MapView
        origin={a ? { lat: a.lat, lng: a.lng, label: a.title } : null}
        destination={b ? { lat: b.lat, lng: b.lng, label: b.title } : null}
        route={route?.points}
        userLocation={current.status === "ready" ? current.position : null}
        center={current.position}
        vehicle={size === "moto" ? "moto" : "car"}
      />
    ),
    [a, b, route, current.status, current.position, size],
  );

  if (paying) {
    return (
      <MapPanelLayout
        map={map}
        panel={<PaymentFlow method={payment} amount={fare} orderRef={orderId} noun="entrega" onConfirmed={confirm} onCancel={() => setPaying(false)} />}
      />
    );
  }

  function applyPlace(which: "pickup" | "dropoff", place: GeoPlace | null, extras?: PastedExtras) {
    const setter = which === "pickup" ? setPickup : setDropoff;
    const prev = which === "pickup" ? pickup : dropoff;
    if (which === "pickup") setPickupTouched(true);
    if (!place) {
      setter({ ...prev, place: null });
      return;
    }
    setter({
      place,
      number: place.number || extras?.number || prev.number,
      complement: extras?.complement ?? prev.complement,
      name: extras?.name ?? prev.name,
      phone: extras?.phone ? formatPhone(extras.phone) : prev.phone,
    });
    setEditing(null);
  }

  const otherState = tab === "enviar" ? dropoff : pickup;
  const searching = editing !== null || !otherState.place;

  const panel = (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-bold">99 Entrega</h1>
        <div className="mt-3 flex gap-6 border-b border-border-99" role="tablist" aria-label="Enviar ou receber">
          {(["enviar", "receber"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t);
                setEditing(null);
              }}
              className={cx(
                "-mb-px border-b-2 pb-2 text-[15px] font-bold capitalize transition-colors",
                tab === t ? "border-orange-99 text-black-99" : "border-transparent text-secondary-99 hover:text-black-99",
              )}
            >
              {t === "enviar" ? "Enviar" : "Receber"}
            </button>
          ))}
        </div>
      </div>

      {searching ? (
        <>
          {editing === "pickup" || (editing === null && !pickup.place) ? (
            <AddressSearch
              key="pickup"
              placeholder={tab === "enviar" ? "Coletar em" : "Coletar de"}
              ariaLabel="Endereço de coleta"
              value={pickup.place}
              autoFocus
              currentLocation={current.place}
              currentLoading={current.status === "loading"}
              position={current.position}
              onChange={(p, extras) => applyPlace("pickup", p, extras)}
            />
          ) : (
            <AddressSearch
              key="dropoff"
              placeholder="Entregar para"
              ariaLabel="Endereço de entrega"
              value={dropoff.place}
              autoFocus
              currentLocation={tab === "receber" ? current.place : undefined}
              currentLoading={tab === "receber" && current.status === "loading"}
              position={current.position}
              onChange={(p, extras) => applyPlace("dropoff", p, extras)}
            />
          )}
          {mine.place && editing === null && (
            <button
              type="button"
              onClick={() => setEditing(tab === "enviar" ? "pickup" : "dropoff")}
              className="flex items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors duration-[120ms] hover:bg-offwhite-99"
            >
              <span
                className={cx("h-4 w-4 shrink-0 rounded-full border-[3px] bg-white", tab === "enviar" ? "border-success-99" : "border-orange-99")}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] text-secondary-99">{tab === "enviar" ? "Coleta" : "Entrega"}</span>
                <span className="block truncate text-[17px] font-bold">{mine.place.title}</span>
              </span>
              <span className="text-[13px] font-bold text-secondary-99">Mudar</span>
            </button>
          )}
          {current.status === "denied" && !pickupTouched && (
            <InfoNote>Sem acesso à sua localização. O ponto começa em Vila Madalena, São Paulo. Toque em Mudar para trocar.</InfoNote>
          )}
        </>
      ) : (
        <>
          <RoutePair
            origin={a && { title: pointLabel(pickup), contact: contactLine(pickup) }}
            destination={b && { title: pointLabel(dropoff), contact: contactLine(dropoff) }}
            onEditOrigin={() => setEditing("pickup")}
            onEditDestination={() => setEditing("dropoff")}
            onSwap={() => {
              setPickup(dropoff);
              setDropoff(pickup);
            }}
          />
          {notCovered && (
            <ErrorNote
              title="Endereço fora da área de cobertura"
              description={`Ainda não atendemos ${notCovered.city || notCovered.title}. A entrega precisa começar e terminar no Brasil.`}
            />
          )}

          <section aria-labelledby="info-title" className="flex flex-col">
            <h2 id="info-title" className="text-[17px] font-bold">
              Informações da entrega
            </h2>
            <div className="grid gap-x-6 md:grid-cols-2">
              <Input label="Quem envia" required value={pickup.name} onChange={(e) => setPickup({ ...pickup, name: e.target.value })} placeholder="Nome" autoComplete="off" />
              <Input label="Telefone de quem envia" required inputMode="tel" value={pickup.phone} onChange={(e) => setPickup({ ...pickup, phone: formatPhone(e.target.value) })} placeholder="(11) 90000-0000" autoComplete="off" />
              {a && !a.number && !a.exact && (
                <Input label="Número da coleta" required inputMode="numeric" value={pickup.number} onChange={(e) => setPickup({ ...pickup, number: e.target.value })} placeholder="Número" autoComplete="off" />
              )}
              <Input label="Complemento da coleta" value={pickup.complement} onChange={(e) => setPickup({ ...pickup, complement: e.target.value })} placeholder="Apto, bloco, loja" autoComplete="off" />
              <Input label="Quem recebe" required value={dropoff.name} onChange={(e) => setDropoff({ ...dropoff, name: e.target.value })} placeholder="Nome" autoComplete="off" />
              <Input label="Telefone de quem recebe" required inputMode="tel" value={dropoff.phone} onChange={(e) => setDropoff({ ...dropoff, phone: formatPhone(e.target.value) })} placeholder="(11) 90000-0000" autoComplete="off" />
              {b && !b.number && !b.exact && (
                <Input label="Número da entrega" required inputMode="numeric" value={dropoff.number} onChange={(e) => setDropoff({ ...dropoff, number: e.target.value })} placeholder="Número" autoComplete="off" />
              )}
              <Input label="Complemento da entrega" value={dropoff.complement} onChange={(e) => setDropoff({ ...dropoff, complement: e.target.value })} placeholder="Apto, bloco, loja" autoComplete="off" />
            </div>
          </section>

          <section aria-labelledby="item-title" className="flex flex-col">
            <h2 id="item-title" className="text-[17px] font-bold">
              Inserir detalhes do item
            </h2>
            <Input label="O que vai no pacote" required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Ex.: Pedido #4821, 2 lanches e 1 bebida" maxLength={80} autoComplete="off" />
          </section>

          <ul className="flex flex-col" role="list" aria-label="Categorias de entrega">
            {deliveryCategories.map((c) => {
              const checked = size === c.id;
              const price = route ? deliveryFare(km, c.id) : 0;
              return (
                <li key={c.id} className="border-b border-border-99 last:border-b-0">
                  <button
                    type="button"
                    aria-pressed={checked}
                    onClick={() => setSize(c.id)}
                    className={cx("flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors duration-150 ease-out hover:duration-[120ms]", checked ? "bg-offwhite-99" : "hover:bg-offwhite-99")}
                  >
                    <VehicleArt category={c.id} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex min-w-0 items-center gap-1.5 text-[17px] font-bold">
                        <span className="truncate">{c.name}</span>
                        <Icon name="info" size={14} className="text-secondary-99" />
                      </span>
                      <span className="whitespace-nowrap text-sm text-secondary-99">
                        {c.dims} · {c.weight}
                        {route ? ` · ${eta.min}–${eta.max} min` : ""}
                      </span>
                    </span>
                    <span className="flex w-[100px] shrink-0 items-center justify-end text-[17px] font-bold tabular-nums">
                      {pricing.loading ? <PriceSkeleton /> : route ? formatBRL(price) : "—"}
                    </span>
                    <span
                      className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2", checked ? "border-black-99" : "border-border-99")}
                      aria-hidden="true"
                    >
                      {checked && <span className="h-3 w-3 rounded-full bg-black-99" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );

  return (
    <MapPanelLayout
      map={map}
      panelWidth="lg"
      panel={panel}
      footer={
        !searching ? (
          <>
            <ActionBar
              left={
                <PaymentBlock
                  icon={paymentIcon[payment]}
                  label={paymentLabel(payment)}
                  detail={payment === "cartao" && card.number ? `•••• ${card.number.replace(/\s/g, "").slice(-4)}` : undefined}
                  onClick={() => setPayOpen(true)}
                />
              }
              action={
                <Button size="lg" full disabled={blocked || pricing.loading} price={route && !pricing.loading ? `${formatBRL(fare)} · ${formatKm(km)}` : undefined} onClick={() => setPaying(true)}>
                  Confirmar
                </Button>
              }
              hint={<BlockedHint items={missing.slice(0, 3).concat(missing.length > 3 ? [`mais ${missing.length - 3}`] : [])} />}
            />
            <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Métodos de pagamento" width="sm">
              <div className="flex flex-col gap-4">
                <PaymentPicker value={payment} onChange={setPayment} allowed={["pix", "cartao", "dinheiro"]} compact />
                {payment === "cartao" && (
                  <CardForm value={card} onChange={setCard} touched={cardTouched} onTouch={(k) => setCardTouched((t) => ({ ...t, [k]: true }))} />
                )}
                <Button full onClick={() => setPayOpen(false)}>
                  Confirmar
                </Button>
              </div>
            </Modal>
          </>
        ) : undefined
      }
    />
  );
}
