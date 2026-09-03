"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactPoint, DeliveryOrder, PackageSize, PaymentMethod } from "@/lib/types";
import { deliveryEtaMin, deliveryFare, packageSizes } from "@/lib/pricing";
import { formatBRL, formatKm } from "@/lib/format";
import { newOrderId, stagesFor } from "@/lib/stages";
import { fetchRoute, type RouteResult } from "@/lib/geo";
import { useCurrentLocation } from "@/lib/useGeolocation";
import { useApp } from "@/context/AppProvider";
import { MapPanelLayout } from "@/components/layout/MapPanelLayout";
import { MapView } from "@/components/map/MapView";
import { PointCard, emptyPointState, pointIsReady, pointMissing, type PointState } from "@/components/entrega/PointCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { BlockedHint, InfoNote } from "@/components/ui/States";
import { PaymentPicker } from "@/components/payment/PaymentPicker";
import { CardForm, cardIsValid, emptyCard, type CardData } from "@/components/payment/CardForm";
import { PaymentFlow } from "@/components/payment/PaymentFlow";
import { cx } from "@/lib/cx";

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

export function DeliveryView() {
  const router = useRouter();
  const { saveOrder } = useApp();
  const current = useCurrentLocation();
  const [pickup, setPickup] = useState<PointState>(emptyPointState);
  const [pickupTouched, setPickupTouched] = useState(false);
  const [dropoff, setDropoff] = useState<PointState>(emptyPointState);
  const [routeState, setRouteState] = useState<{ key: string; route: RouteResult } | null>(null);
  const [content, setContent] = useState("");
  const [size, setSize] = useState<PackageSize | null>(null);
  const [declared, setDeclared] = useState("");
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [card, setCard] = useState<CardData>(emptyCard);
  const [cardTouched, setCardTouched] = useState<Partial<Record<keyof CardData, boolean>>>({});
  const [paying, setPaying] = useState(false);
  const [orderId] = useState(() => newOrderId("entrega"));

  // A coleta começa na localização atual, como no aplicativo.
  if (!pickupTouched && !pickup.place && current.place) {
    setPickup({ ...pickup, place: { ...current.place, title: "Localização atual", subtitle: `${current.place.title} · ${current.place.subtitle}` } });
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
  const declaredValue = Number(declared.replace(/\./g, "").replace(",", ".")) || 0;
  const fare = size ? deliveryFare(km, size, declaredValue) : 0;
  const eta = deliveryEtaMin(km, route?.durationMin);

  const missing = [
    ...pointMissing(pickup, "coleta"),
    ...pointMissing(dropoff, "entrega"),
    ...(pickup.place && dropoff.place && !route ? ["calcular o trajeto"] : []),
    ...(!content.trim() ? ["o que vai no pacote"] : []),
    ...(!size ? ["o tamanho do pacote"] : []),
    ...(!payment ? ["a forma de pagamento"] : []),
    ...(payment === "cartao" && !cardIsValid(card) ? ["os dados do cartão"] : []),
  ];
  const blocked = missing.length > 0;

  const confirm = useCallback(() => {
    if (!size || !payment || !pointIsReady(pickup) || !pointIsReady(dropoff) || !route) return;
    const order: DeliveryOrder = {
      id: orderId,
      vertical: "entrega",
      createdAt: Date.now(),
      payment,
      total: fare,
      stages: stagesFor("entrega", `Chega em ${eta.min}–${eta.max} min`),
      origin: { label: pointLabel(pickup), lat: pickup.place!.lat, lng: pickup.place!.lng },
      destination: { label: pointLabel(dropoff), lat: dropoff.place!.lat, lng: dropoff.place!.lng },
      route: route.points,
      pickup: toContact(pickup),
      dropoff: toContact(dropoff),
      content: content.trim(),
      size,
      declaredValue,
      distanceKm: km,
      courier: { name: "Diego Nascimento", vehicle: "Honda CG 160", plate: "DKT-7F31", rating: 4.88 },
    };
    saveOrder(order);
    router.push(`/pedido/${order.id}`);
  }, [size, payment, pickup, dropoff, route, orderId, fare, eta, content, declaredValue, km, saveOrder, router]);

  const map = useMemo(
    () => (
      <MapView
        origin={pickup.place ? { lat: pickup.place.lat, lng: pickup.place.lng, label: pickup.place.title } : null}
        destination={dropoff.place ? { lat: dropoff.place.lat, lng: dropoff.place.lng, label: dropoff.place.title } : null}
        route={route?.points}
        userLocation={current.status === "ready" ? current.position : null}
        center={current.position}
        vehicle="moto"
      />
    ),
    [pickup.place, dropoff.place, route, current.status, current.position],
  );

  if (paying && payment) {
    return (
      <MapPanelLayout
        map={map}
        panelWidth="lg"
        panel={
          <PaymentFlow
            method={payment}
            amount={fare}
            orderRef={orderId}
            noun="entrega"
            onConfirmed={confirm}
            onCancel={() => setPaying(false)}
          />
        }
      />
    );
  }

  return (
    <MapPanelLayout
      map={map}
      panelWidth="lg"
      panel={
        <div className="flex flex-col gap-10">
          <div>
            <h1 className="text-[28px] font-semibold">Enviar um pacote</h1>
            <p className="text-sm text-secondary-99">
              Diga onde o entregador retira e onde entrega. Se o endereço veio de outro sistema, é
              só colar no campo.
            </p>
          </div>

          {current.status === "denied" && !pickupTouched && (
            <InfoNote>
              Sem acesso à sua localização. A coleta começa em Vila Madalena, São Paulo. Você pode
              mudar no campo abaixo.
            </InfoNote>
          )}

          <div className="grid gap-10 md:grid-cols-2 md:gap-8">
            <PointCard
              id="coleta"
              title="Coleta"
              icon="package"
              placeholder="Onde o entregador retira?"
              value={pickup}
              onChange={(p) => {
                setPickupTouched(true);
                setPickup(p);
              }}
              currentLocation={current.place}
              currentLoading={current.status === "loading"}
            />
            <PointCard
              id="entrega"
              title="Entrega"
              icon="flag"
              placeholder="Para onde vai o pacote?"
              value={dropoff}
              onChange={setDropoff}
            />
          </div>

          <section className="flex flex-col gap-5" aria-labelledby="pkg-title">
            <div>
              <h2 id="pkg-title" className="text-[22px] font-semibold">
                Pacote
              </h2>
              <p className="text-sm text-secondary-99">O entregador confere o conteúdo na coleta.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="O que vai no pacote"
                placeholder="Ex.: Pedido #4821, 2 lanches e 1 bebida"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={80}
              />
              <Input
                label="Valor declarado"
                placeholder="0,00"
                inputMode="decimal"
                leading={<span className="text-sm font-semibold">R$</span>}
                value={declared}
                onChange={(e) => setDeclared(e.target.value.replace(/[^\d,.]/g, ""))}
                hint="Opcional. Cobre o conteúdo em caso de extravio, com seguro de 1%."
              />
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-secondary-99">Tamanho</legend>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {packageSizes.map((s) => {
                  const checked = size === s.id;
                  return (
                    <label
                      key={s.id}
                      className={cx(
                        "flex cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3 transition-colors",
                        checked ? "border-black-99 bg-subtle-99" : "border-border-99 hover:bg-subtle-99",
                      )}
                    >
                      <input type="radio" name="tamanho" className="sr-only" checked={checked} onChange={() => setSize(s.id)} />
                      <span className="flex items-center gap-2 font-semibold">
                        <Icon name="package" size={18} />
                        {s.label}
                      </span>
                      <span className="text-[13px] text-muted-99">{s.hint}</span>
                      <span className="text-[13px] font-semibold">{s.extra === 0 ? "Sem acréscimo" : `+ ${formatBRL(s.extra)}`}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </section>

          <section className="flex flex-col gap-4" aria-labelledby="pay-title">
            <h2 id="pay-title" className="text-[22px] font-semibold">
              Pagamento
            </h2>
            <PaymentPicker value={payment} onChange={setPayment} allowed={["pix", "cartao", "dinheiro"]} />
            {payment === "cartao" && (
              <CardForm
                value={card}
                onChange={setCard}
                touched={cardTouched}
                onTouch={(k) => setCardTouched((t) => ({ ...t, [k]: true }))}
              />
            )}
          </section>
        </div>
      }
      footer={
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-[13px] text-muted-99">Distância</p>
              <p className="font-semibold">{route ? formatKm(km) : "—"}</p>
            </div>
            <div>
              <p className="text-[13px] text-muted-99">Prazo</p>
              <p className="font-semibold">{route ? `${eta.min}–${eta.max} min` : "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-[13px] text-muted-99">Preço</p>
              <p className="text-lg font-bold">{size && route ? formatBRL(fare) : "—"}</p>
            </div>
          </div>
          <Button size="lg" full disabled={blocked} onClick={() => setPaying(true)}>
            Confirmar entrega
          </Button>
          <BlockedHint items={missing.slice(0, 3).concat(missing.length > 3 ? [`mais ${missing.length - 3}`] : [])} />
        </div>
      }
    />
  );
}
