"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { drivers, rideCategories } from "@/data/rides";
import { rideDurationMin, rideFare } from "@/lib/pricing";
import { formatBRL, formatKm } from "@/lib/format";
import { newOrderId, stagesFor } from "@/lib/stages";
import { fetchRoute, type GeoPlace, type RouteResult } from "@/lib/geo";
import { useCurrentLocation } from "@/lib/useGeolocation";
import type { PaymentMethod, RideCategory, RideOrder } from "@/lib/types";
import { useApp } from "@/context/AppProvider";
import { MapPanelLayout } from "@/components/layout/MapPanelLayout";
import { MapView } from "@/components/map/MapView";
import { AddressSearch } from "@/components/map/AddressSearch";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { BlockedHint, ErrorNote, InfoNote } from "@/components/ui/States";
import { PaymentPicker } from "@/components/payment/PaymentPicker";
import { CardForm, cardIsValid, emptyCard, type CardData } from "@/components/payment/CardForm";
import { PaymentFlow } from "@/components/payment/PaymentFlow";
import { cx } from "@/lib/cx";

const categoryIcon: Record<RideCategory["id"], IconName> = {
  pop: "car",
  comfort: "car",
  moto: "moto",
  taxi: "car",
};

type Phase = "form" | "searching" | "no-driver" | "paying";

/** Acima desta distância a primeira busca falha, para demonstrar o erro de "nenhum motorista". */
const LOW_SUPPLY_KM = 25;

export function RideView() {
  const router = useRouter();
  const { saveOrder } = useApp();
  const current = useCurrentLocation();
  const [origin, setOrigin] = useState<GeoPlace | null>(null);
  const [originTouched, setOriginTouched] = useState(false);
  const [destination, setDestination] = useState<GeoPlace | null>(null);
  const [routeState, setRouteState] = useState<{ key: string; route: RouteResult } | null>(null);
  const [category, setCategory] = useState<RideCategory["id"] | null>(null);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [card, setCard] = useState<CardData>(emptyCard);
  const [cardTouched, setCardTouched] = useState<Partial<Record<keyof CardData, boolean>>>({});
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [attempts, setAttempts] = useState(0);
  const [orderId] = useState(() => newOrderId("corrida"));

  // Origem começa na localização atual, como no aplicativo.
  if (!originTouched && !origin && current.place) {
    setOrigin({ ...current.place, title: "Localização atual", subtitle: `${current.place.title} · ${current.place.subtitle}` });
  }

  const routeReady = Boolean(origin && destination && origin.covered && destination.covered);

  const routeKey = origin && destination ? `${origin.lat},${origin.lng}>${destination.lat},${destination.lng}` : null;
  const route = routeKey && routeState?.key === routeKey ? routeState.route : null;

  useEffect(() => {
    if (!origin || !destination || !routeKey) return;
    const controller = new AbortController();
    fetchRoute(origin, destination, controller.signal)
      .then((r) => setRouteState({ key: routeKey, route: r }))
      .catch(() => {});
    return () => controller.abort();
  }, [origin, destination, routeKey]);

  const km = route?.distanceKm ?? 0;
  const notCovered = [origin, destination].find((p) => p && !p.covered);
  const selected = rideCategories.find((c) => c.id === category) ?? null;
  const fare = selected ? rideFare(selected, km) : 0;
  const duration = selected ? rideDurationMin(km, selected.id, route?.durationMin) : 0;

  const missing: string[] = [];
  if (!origin) missing.push("informar a origem");
  if (!destination) missing.push("informar o destino");
  if (routeReady && !route) missing.push("calcular o trajeto");
  if (routeReady && !category) missing.push("escolher a categoria");
  if (routeReady && category && !payment) missing.push("escolher o pagamento");
  if (payment === "cartao" && !cardIsValid(card)) missing.push("completar os dados do cartão");
  const blocked = missing.length > 0 || Boolean(notCovered);

  useEffect(() => {
    if (phase !== "searching") return;
    const lowSupply = km > LOW_SUPPLY_KM && attempts === 0;
    const t = setTimeout(() => {
      setAttempts((a) => a + 1);
      setPhase(lowSupply ? "no-driver" : "paying");
    }, 2600);
    return () => clearTimeout(t);
  }, [phase, km, attempts]);

  const confirm = useCallback(() => {
    if (!origin || !destination || !selected || !payment) return;
    const order: RideOrder = {
      id: orderId,
      vertical: "corrida",
      createdAt: Date.now(),
      payment,
      total: fare,
      stages: stagesFor("corrida", `Chega em ${duration} min`),
      origin: { label: origin.title, lat: origin.lat, lng: origin.lng },
      destination: { label: destination.title, lat: destination.lat, lng: destination.lng },
      route: route?.points,
      category: selected.id,
      categoryName: selected.name,
      distanceKm: km,
      durationMin: duration,
      note: note.trim() || undefined,
      driver: drivers[selected.id],
    };
    saveOrder(order);
    router.push(`/pedido/${order.id}`);
  }, [origin, destination, selected, payment, orderId, fare, duration, route, km, note, saveOrder, router]);

  const map = useMemo(
    () => (
      <MapView
        origin={origin ? { lat: origin.lat, lng: origin.lng, label: origin.title } : null}
        destination={destination ? { lat: destination.lat, lng: destination.lng, label: destination.title } : null}
        route={route?.points}
        userLocation={current.status === "ready" ? current.position : null}
        center={current.position}
        vehicle={selected?.id === "moto" ? "moto" : "car"}
        searching={phase === "searching"}
      />
    ),
    [origin, destination, route, current.status, current.position, selected?.id, phase],
  );

  if (phase === "paying" && payment) {
    return (
      <MapPanelLayout
        map={map}
        panel={
          <PaymentFlow
            method={payment}
            amount={fare}
            orderRef={orderId}
            noun="corrida"
            onConfirmed={confirm}
            onCancel={() => setPhase("form")}
          />
        }
      />
    );
  }

  if (phase === "searching" || phase === "no-driver") {
    return (
      <MapPanelLayout
        map={map}
        panel={
          <div className="flex flex-col gap-6">
            <h1 className="text-[28px] font-semibold">{selected?.name}</h1>
            {phase === "searching" ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center" aria-live="polite">
                <span className="h-12 w-12 animate-spin rounded-full border-4 border-offwhite-99 border-t-yellow-99-deep" aria-hidden="true" />
                <p className="text-lg font-semibold">Procurando motorista</p>
                <p className="text-sm text-secondary-99">Buscando o motorista mais próximo de {origin?.title}.</p>
              </div>
            ) : (
              <ErrorNote
                title="Nenhum motorista encontrado"
                description={`Não há motoristas de ${selected?.name} disponíveis para ${destination?.title} agora. Tente de novo em instantes ou mude a categoria.`}
                action={
                  <>
                    <Button size="sm" onClick={() => setPhase("searching")}>
                      Tentar de novo
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPhase("form")}>
                      Mudar categoria
                    </Button>
                  </>
                }
              />
            )}
            <div className="rounded-xl bg-subtle-99 p-4 text-sm text-secondary-99">
              <p>
                <strong className="text-black-99">{origin?.title}</strong> até{" "}
                <strong className="text-black-99">{destination?.title}</strong>
              </p>
              <p>
                {formatKm(km)} · {duration} min · {formatBRL(fare)}
              </p>
            </div>
            {phase === "searching" && (
              <Button variant="ghost" full onClick={() => setPhase("form")}>
                Cancelar
              </Button>
            )}
          </div>
        }
      />
    );
  }

  return (
    <MapPanelLayout
      map={map}
      panel={
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-[28px] font-semibold">Para onde vamos?</h1>
            <p className="text-sm text-secondary-99">Escolha origem, destino e categoria. O preço é estimado.</p>
          </div>

          <div className="flex flex-col gap-4">
            <AddressSearch
              label="Origem"
              icon="target"
              placeholder="De onde você sai?"
              value={origin}
              onChange={(p) => {
                setOriginTouched(true);
                setOrigin(p);
              }}
              currentLocation={current.place}
              currentLoading={current.status === "loading"}
            />
            <AddressSearch
              label="Destino"
              icon="flag"
              placeholder="Para onde você vai?"
              value={destination}
              onChange={(p) => {
                setDestination(p);
                setAttempts(0);
              }}
            />
            {current.status === "denied" && !originTouched && (
              <InfoNote>
                Sem acesso à sua localização. A origem começa em Vila Madalena, São Paulo. Você pode
                mudar no campo acima.
              </InfoNote>
            )}
            {notCovered && (
              <ErrorNote
                title="Endereço fora da área de cobertura"
                description={`Ainda não operamos em ${notCovered.city || notCovered.title}. Escolha um endereço no Brasil.`}
              />
            )}
          </div>

          {routeReady && (
            <section className="flex flex-col gap-3" aria-labelledby="cat-title">
              <div className="flex items-baseline justify-between">
                <h2 id="cat-title" className="text-[22px] font-semibold">
                  Escolha a categoria
                </h2>
                <span className="text-[13px] text-muted-99" aria-live="polite">
                  {route ? formatKm(km) : "Calculando trajeto…"}
                </span>
              </div>
              <ul className="flex flex-col gap-2" role="list">
                {rideCategories.map((c) => {
                  const checked = category === c.id;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        aria-pressed={checked}
                        onClick={() => setCategory(c.id)}
                        className={cx(
                          "flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors",
                          checked ? "border-black-99 bg-subtle-99" : "border-border-99 hover:bg-subtle-99",
                        )}
                      >
                        <span
                          className={cx(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                            checked ? "bg-yellow-99 text-black-99" : "bg-offwhite-99 text-black-99",
                          )}
                        >
                          <Icon name={categoryIcon[c.id]} size={24} />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="flex items-center gap-2 font-semibold">
                            {c.name}
                            <span className="flex items-center gap-1 text-[13px] font-medium text-muted-99">
                              <Icon name="user" size={12} />
                              {c.seats}
                            </span>
                          </span>
                          <span className="truncate text-[13px] text-muted-99">
                            {c.description} · chega em {c.etaMin} min
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block font-bold">{route ? formatBRL(rideFare(c, km)) : "—"}</span>
                          <span className="block text-[13px] text-muted-99">
                            {route ? `${rideDurationMin(km, c.id, route.durationMin)} min` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {routeReady && category && (
            <section className="flex flex-col gap-4" aria-labelledby="pay-title">
              <h2 id="pay-title" className="text-[22px] font-semibold">
                Pagamento
              </h2>
              <PaymentPicker value={payment} onChange={setPayment} allowed={["pix", "cartao", "dinheiro"]} compact />
              {payment === "cartao" && (
                <CardForm
                  value={card}
                  onChange={setCard}
                  touched={cardTouched}
                  onTouch={(k) => setCardTouched((t) => ({ ...t, [k]: true }))}
                />
              )}
              <Textarea
                label="Observação para o motorista"
                placeholder="Ex.: estou no portão lateral, de camisa azul"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={120}
                hint={`${note.length}/120 · opcional`}
                className="min-h-20"
              />
            </section>
          )}
        </div>
      }
      footer={
        <div className="flex flex-col gap-2">
          {selected && routeReady && route && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary-99">
                {selected.name} · {duration} min
              </span>
              <span className="text-lg font-bold">{formatBRL(fare)}</span>
            </div>
          )}
          <Button size="lg" full disabled={blocked} onClick={() => setPhase("searching")}>
            Confirmar corrida
          </Button>
          {!notCovered && <BlockedHint items={missing} />}
        </div>
      }
    />
  );
}
