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
import { ActionBar, PaymentBlock } from "@/components/layout/ActionBar";
import { MapView } from "@/components/map/MapView";
import { AddressSearch } from "@/components/map/AddressSearch";
import { RoutePair } from "@/components/map/RoutePair";
import { VehicleArt } from "@/components/ui/VehicleArt";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { BlockedHint, ErrorNote, InfoNote } from "@/components/ui/States";
import { PaymentPicker, paymentLabel } from "@/components/payment/PaymentPicker";
import { CardForm, cardIsValid, demoCard, type CardData } from "@/components/payment/CardForm";
import { usePriceSkeleton, PriceSkeleton } from "@/components/ui/PriceSkeleton";
import { PaymentFlow } from "@/components/payment/PaymentFlow";
import { cx } from "@/lib/cx";

type Phase = "form" | "searching" | "no-driver" | "paying";

/** Acima desta distância a primeira busca falha, para demonstrar o erro de "nenhum motorista". */
const LOW_SUPPLY_KM = 25;

const paymentIcon: Record<PaymentMethod, "pix" | "card" | "cash" | "ticket"> = {
  pix: "pix",
  cartao: "card",
  dinheiro: "cash",
  vale: "ticket",
};

function arrivalLabel(minutes: number): string {
  const d = new Date(Date.now() + minutes * 60_000);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function RideView() {
  const router = useRouter();
  const { saveOrder } = useApp();
  const current = useCurrentLocation();
  const [origin, setOrigin] = useState<GeoPlace | null>(null);
  const [originTouched, setOriginTouched] = useState(false);
  const [destination, setDestination] = useState<GeoPlace | null>(null);
  const [editing, setEditing] = useState<"origin" | "destination" | null>(null);
  const [routeState, setRouteState] = useState<{ key: string; route: RouteResult } | null>(null);
  const [category, setCategory] = useState<RideCategory["id"]>("pop");
  const [negotiated, setNegotiated] = useState<number | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>("cartao");
  const [payOpen, setPayOpen] = useState(false);
  const [card, setCard] = useState<CardData>(demoCard);
  const [cardTouched, setCardTouched] = useState<Partial<Record<keyof CardData, boolean>>>({});
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [attempts, setAttempts] = useState(0);
  const [orderId] = useState(() => newOrderId("corrida"));

  // Origem começa na localização atual, como no app.
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
  const pricing = usePriceSkeleton(routeKey, Boolean(route));
  const notCovered = [origin, destination].find((p) => p && !p.covered);
  const selected = rideCategories.find((c) => c.id === category)!;
  const suggested = route ? rideFare(selected, km) : 0;
  const fare = selected.negotiable && negotiated !== null ? negotiated : suggested;
  const duration = route ? rideDurationMin(km, selected.id, route.durationMin) : 0;

  const missing: string[] = [];
  if (!destination) missing.push("informar o destino");
  if (routeReady && !route) missing.push("calcular o trajeto");
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
    if (!origin || !destination) return;
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
  }, [origin, destination, orderId, payment, fare, duration, route, selected, km, note, saveOrder, router]);

  const map = useMemo(
    () => (
      <MapView
        origin={origin ? { lat: origin.lat, lng: origin.lng, label: origin.title } : null}
        destination={destination ? { lat: destination.lat, lng: destination.lng, label: destination.title } : null}
        route={route?.points}
        userLocation={current.status === "ready" ? current.position : null}
        center={current.position}
        vehicle={selected.art === "moto" ? "moto" : "car"}
        searching={phase === "searching"}
      />
    ),
    [origin, destination, route, current.status, current.position, selected.art, phase],
  );

  if (phase === "paying") {
    return (
      <MapPanelLayout
        map={map}
        panel={<PaymentFlow method={payment} amount={fare} orderRef={orderId} noun="corrida" onConfirmed={confirm} onCancel={() => setPhase("form")} />}
      />
    );
  }

  if (phase === "searching" || phase === "no-driver") {
    return (
      <MapPanelLayout
        map={map}
        panel={
          <div className="flex flex-col gap-6">
            <h1 className="text-[22px] font-bold">{selected.name}</h1>
            {phase === "searching" ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center" aria-live="polite">
                <span className="h-12 w-12 animate-spin rounded-full border-4 border-offwhite-99 border-t-yellow-99-deep" aria-hidden="true" />
                <p className="text-[17px] font-bold">Procurando motorista</p>
                <p className="text-[15px] text-secondary-99">Buscando o motorista mais próximo de {origin?.title}.</p>
              </div>
            ) : (
              <ErrorNote
                title="Nenhum motorista encontrado"
                description={`Não há motoristas de ${selected.name} disponíveis para ${destination?.title} agora. Tente de novo em instantes ou mude a categoria.`}
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
            <RoutePair origin={origin && { title: origin.title }} destination={destination && { title: destination.title }} />
            <p className="text-[15px] text-secondary-99">
              {formatKm(km)} · {duration} min · <span className="font-bold text-black-99">{formatBRL(fare)}</span>
            </p>
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

  const searching = editing !== null || !destination;

  return (
    <MapPanelLayout
      map={map}
      panel={
        <div className="flex flex-col gap-6">
          {searching ? (
            <>
              <h1 className="sr-only">Corrida</h1>
              {editing === "origin" ? (
                <AddressSearch
                  key="origin"
                  placeholder="De onde você sai?"
                  ariaLabel="Origem"
                  value={origin}
                  autoFocus
                  currentLocation={current.place}
                  currentLoading={current.status === "loading"}
                  position={current.position}
                  onChange={(p) => {
                    setOriginTouched(true);
                    setOrigin(p);
                    if (p) setEditing(null);
                  }}
                />
              ) : (
                <AddressSearch
                  key="destination"
                  placeholder="Para onde vamos?"
                  ariaLabel="Destino"
                  value={destination}
                  autoFocus={editing === "destination"}
                  position={current.position}
                  onChange={(p) => {
                    setDestination(p);
                    setAttempts(0);
                    if (p) setEditing(null);
                  }}
                />
              )}
              {origin && editing !== "origin" && (
                <button
                  type="button"
                  onClick={() => setEditing("origin")}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors duration-[120ms] hover:bg-offwhite-99"
                >
                  <span className="h-4 w-4 shrink-0 rounded-full border-[3px] border-success-99 bg-white" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-secondary-99">Origem</span>
                    <span className="block truncate text-[17px] font-bold">{origin.title}</span>
                  </span>
                  <Icon name="chevronRight" size={20} className="text-muted-99" />
                </button>
              )}
              {current.status === "denied" && !originTouched && (
                <InfoNote>Sem acesso à sua localização. A origem começa em Vila Madalena, São Paulo. Toque em Origem para mudar.</InfoNote>
              )}
              {notCovered && (
                <ErrorNote
                  title="Endereço fora da área de cobertura"
                  description={`Ainda não operamos em ${notCovered.city || notCovered.title}. Escolha um endereço no Brasil.`}
                />
              )}
            </>
          ) : (
            <>
              <h1 className="sr-only">Corrida</h1>
              <RoutePair
                origin={origin && { title: origin.title }}
                destination={destination && { title: destination.title }}
                onEditOrigin={() => setEditing("origin")}
                onEditDestination={() => setEditing("destination")}
              />

              {notCovered ? (
                <ErrorNote
                  title="Endereço fora da área de cobertura"
                  description={`Ainda não operamos em ${notCovered.city || notCovered.title}. Escolha um endereço no Brasil.`}
                />
              ) : (
                <ul className="flex flex-col" role="list" aria-label="Categorias">
                  {rideCategories.map((c) => {
                    const checked = category === c.id;
                    const price = route ? rideFare(c, km) : 0;
                    const mins = route ? rideDurationMin(km, c.id, route.durationMin) : 0;
                    return (
                      <li key={c.id} className="border-b border-border-99 last:border-b-0">
                        <div
                          role="button"
                          tabIndex={0}
                          aria-pressed={checked}
                          onClick={() => setCategory(c.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setCategory(c.id);
                            }
                          }}
                          className={cx(
                            "flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors duration-150 ease-out hover:duration-[120ms]",
                            checked ? "bg-offwhite-99" : "hover:bg-offwhite-99",
                          )}
                        >
                          <VehicleArt category={c.id} />
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="flex min-w-0 items-center gap-1.5 text-[17px] font-bold">
                              <span className="truncate">{c.name}</span>
                              {c.seats > 0 ? (
                                <span className="flex items-center gap-0.5 text-[13px] font-medium text-secondary-99">
                                  <Icon name="user" size={13} />
                                  {c.seats}
                                </span>
                              ) : (
                                <Icon name="info" size={14} className="text-secondary-99" />
                              )}
                            </span>
                            <span className={cx("text-sm text-secondary-99", route ? "whitespace-nowrap" : "truncate")}>
                              {route ? `${arrivalLabel(c.etaMin + mins)} · ${mins} min` : c.description}
                            </span>
                          </span>
                          <span className="flex w-[128px] shrink-0 items-center justify-end">
                          {pricing.loading ? (
                            <PriceSkeleton />
                          ) : c.negotiable ? (
                            <span className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                aria-label="Diminuir valor"
                                disabled={!route}
                                onClick={() => setNegotiated(Math.max(Math.round((rideFare(c, km) * 0.7) * 100) / 100, (negotiated ?? price) - 1))}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-border-99 text-black-99 transition-colors duration-[120ms] hover:bg-offwhite-99 disabled:text-disabled-99"
                              >
                                <Icon name="minus" size={16} />
                              </button>
                              <span className="min-w-[64px] text-center text-[17px] font-bold tabular-nums">
                                {route ? formatBRL(negotiated ?? price) : "—"}
                              </span>
                              <button
                                type="button"
                                aria-label="Aumentar valor"
                                disabled={!route}
                                onClick={() => setNegotiated((negotiated ?? price) + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-border-99 text-black-99 transition-colors duration-[120ms] hover:bg-offwhite-99 disabled:text-disabled-99"
                              >
                                <Icon name="plus" size={16} />
                              </button>
                            </span>
                          ) : (
                            <span className="shrink-0 text-[17px] font-bold tabular-nums">{route ? formatBRL(price) : "—"}</span>
                          )}
                          </span>
                          <span
                            className={cx(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2",
                              checked ? "border-black-99 bg-black-99 text-white" : "border-border-99 bg-white text-transparent",
                            )}
                            aria-hidden="true"
                          >
                            <Icon name="check" size={14} />
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Textarea
                label="Observação para o motorista"
                placeholder="Ex.: estou no portão lateral, de camisa azul"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={120}
                className="min-h-10"
              />
            </>
          )}
        </div>
      }
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
                <Button size="lg" full disabled={blocked || pricing.loading} price={route && !pricing.loading ? formatBRL(fare) : undefined} onClick={() => setPhase("searching")}>
                  Solicitar {selected.name}
                </Button>
              }
              hint={!notCovered ? <BlockedHint items={missing} /> : null}
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
