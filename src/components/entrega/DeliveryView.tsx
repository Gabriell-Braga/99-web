"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import type { ContactPoint, DeliveryOrder, PackageSize, PaymentMethod } from "@/lib/types";
import { deliveryCategories } from "@/data/rides";
import { deliveryEtaMin, deliveryFare } from "@/lib/pricing";
import { formatBRL, formatKm, formatPhone } from "@/lib/format";
import { newOrderId, stagesFor } from "@/lib/stages";
import { fetchRoute, type GeoPlace, type RouteResult } from "@/lib/geo";
import { useCurrentLocation } from "@/lib/useGeolocation";
import { useApp } from "@/context/AppProvider";
import { MapPanelLayout } from "@/components/layout/MapPanelLayout";
import { PaymentBlock } from "@/components/layout/ActionBar";
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
  const reduceMotion = useReducedMotion();
  const [pickup, setPickup] = useState<PointState>(emptyPoint);
  const [pickupTouched, setPickupTouched] = useState(false);
  const [dropoff, setDropoff] = useState<PointState>(emptyPoint);
  const [editing, setEditing] = useState<"pickup" | "dropoff" | null>(null);
  const [contactFor, setContactFor] = useState<"pickup" | "dropoff" | null>(null);
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
        vehicle={size === "moto" ? "entrega-moto" : "entrega-carro"}
      />
    ),
    [a, b, route, current.status, current.position, size],
  );

  if (paying) {
    return (
      <MapPanelLayout
        map={map}
        onBack={() => setPaying(false)}
        panel={
          <PaymentFlow
            method={payment}
            amount={fare}
            orderRef={orderId}
            noun="entrega"
            onConfirmed={confirm}
            onCancel={() => setPaying(false)}
            summary={{
              origem: pointLabel(pickup),
              destino: pointLabel(dropoff),
              categoria: size === "moto" ? "Entrega Moto" : "Entrega Carro",
              detalhe: `${formatKm(km)} · chega em ${eta.min}–${eta.max} min`,
              imagem: size === "moto" ? "/vehicles/moto-box.png" : "/vehicles/car-box.png",
            }}
          />
        }
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
    const next = {
      place,
      number: place.number || extras?.number || prev.number,
      complement: extras?.complement ?? prev.complement,
      name: extras?.name ?? prev.name,
      phone: extras?.phone ? formatPhone(extras.phone) : prev.phone,
    };
    setter(next);
    setEditing(null);
    // Endereço novo sem contato: segue para a ficha de quem envia ou recebe, como no app.
    if (!contactFor && (!next.name.trim() || next.phone.replace(/\D/g, "").length < 10)) setContactFor(which);
  }

  const otherState = tab === "enviar" ? dropoff : pickup;
  const mineKey = tab === "enviar" ? "pickup" : "dropoff";
  const otherKey = tab === "enviar" ? "dropoff" : "pickup";
  // Qual tela do app está aberta: busca de endereço, ficha do contato, início ou detalhes.
  const screen: "search" | "contact" | "landing" | "details" = editing
    ? "search"
    : contactFor
      ? "contact"
      : !otherState.place
        ? "landing"
        : "details";

  const landingPanel = (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex flex-col items-center pt-6">
        {/* Bloco centralizado, mas as duas linhas começam juntas na borda da seta, como no app. */}
        <div className="flex flex-col items-start">
          <p className="text-[24px] font-medium uppercase leading-tight tracking-wide text-black-99">Você precisa,</p>
          <h1 className="mt-1 flex items-center gap-3 text-[40px] font-bold leading-none tracking-tight">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-99 text-black-99" aria-hidden="true">
              <Icon name="arrowRight" size={30} />
            </span>
            99 Entrega
          </h1>
        </div>
        <div className="mt-8 flex items-end justify-center gap-6" aria-hidden="true">
          <VehicleArt category="entrega-moto" width={132} />
          <VehicleArt category="entrega-carro" width={132} />
        </div>
      </div>

      <div className="rounded-3xl bg-offwhite-99 p-4">
        <div className="flex gap-10 px-4 pt-2" role="tablist" aria-label="Enviar ou receber">
          {(["enviar", "receber"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cx(
                "relative isolate pb-1 text-[24px] transition-colors duration-150",
                tab === t ? "font-bold text-black-99" : "text-secondary-99 hover:text-black-99",
              )}
            >
              {t === "enviar" ? "Enviar" : "Receber"}
              {tab === t && (
                <motion.span
                  layoutId={reduceMotion ? undefined : "aba-entrega-inicio"}
                  transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-x-0 bottom-1.5 -z-10 h-1.5 rounded-full bg-orange-99"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setContactFor(mineKey)}
          className="mt-3 flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors hover:bg-black-99/5"
        >
          <span
            className={cx("h-4 w-4 shrink-0 rounded-full border-[3px] bg-white", tab === "enviar" ? "border-success-99" : "border-orange-99")}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[18px]">{mine.place ? pointLabel(mine) : current.status === "loading" ? "Localizando você…" : "Onde está o pacote?"}</span>
            <span className="block truncate text-[15px] text-secondary-99">{contactLine(mine) ?? "Toque para adicionar nome e telefone"}</span>
          </span>
          <Icon name="chevronRight" size={22} className="shrink-0 text-muted-99" />
        </button>

        <button
          type="button"
          onClick={() => setEditing(otherKey)}
          className="mt-2 flex w-full items-center gap-4 rounded-2xl bg-white px-4 py-6 text-left transition-colors hover:bg-subtle-99"
        >
          <span
            className={cx("h-4 w-4 shrink-0 rounded-full border-[3px] bg-white", tab === "enviar" ? "border-orange-99" : "border-success-99")}
            aria-hidden="true"
          />
          <span className="text-[28px] font-bold leading-none">{tab === "enviar" ? "Entregar para" : "Coletar de"}</span>
        </button>
      </div>

      {current.status === "denied" && !pickupTouched && (
        <InfoNote>Sem acesso à sua localização. O ponto começa em Vila Madalena, São Paulo. Toque nele para trocar.</InfoNote>
      )}
    </div>
  );

  const searchPanel = editing && (
    <div className="flex flex-col gap-4">
      <AddressSearch
        key={editing}
        placeholder={editing === "pickup" ? "Coletar em" : "Entregar para"}
        ariaLabel={editing === "pickup" ? "Endereço de coleta" : "Endereço de entrega"}
        value={editing === "pickup" ? pickup.place : dropoff.place}
        autoFocus
        listaFixa
        currentLocation={editing === mineKey ? current.place : undefined}
        currentLoading={editing === mineKey && current.status === "loading"}
        position={current.position}
        onChange={(p, extras) => applyPlace(editing, p, extras)}
      />
    </div>
  );

  // Ficha de quem envia ou recebe, a "Informações do remetente" do app.
  const who = contactFor ?? "pickup";
  const contact = who === "pickup" ? pickup : dropoff;
  const setContact = who === "pickup" ? setPickup : setDropoff;
  const contactReady =
    Boolean(contact.place) &&
    (Boolean(contact.place?.number) || Boolean(contact.place?.exact) || contact.number.trim() !== "") &&
    contact.name.trim() !== "" &&
    contact.phone.replace(/\D/g, "").length >= 10;
  const contactTitle = who === "pickup" ? "Informações do remetente" : "Informações do destinatário";

  const contactPanel = (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setEditing(who)}
        className="flex w-full items-center gap-3 border-b border-border-99 py-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] text-secondary-99">
            Endereço<span className="text-alert-99">*</span>
          </span>
          <span className={cx("mt-1 block truncate text-[18px]", !contact.place && "text-placeholder-99")}>
            {contact.place ? contact.place.title : "Escolha o endereço"}
          </span>
        </span>
        <Icon name="chevronRight" size={24} className="shrink-0" />
      </button>
      {contact.place && !contact.place.number && !contact.place.exact && (
        <Input label="Número" required inputMode="numeric" value={contact.number} onChange={(e) => setContact({ ...contact, number: e.target.value })} placeholder="Número" autoComplete="off" />
      )}
      <Input
        label="Detalhes do endereço"
        value={contact.complement}
        onChange={(e) => setContact({ ...contact, complement: e.target.value })}
        placeholder="Ex.: bloco A, apartamento 201"
        autoComplete="off"
      />
      <Input
        label="Nome para contato"
        required
        value={contact.name}
        onChange={(e) => setContact({ ...contact, name: e.target.value })}
        placeholder="Nome"
        autoComplete="off"
      />
      <Input
        label="Número de telefone"
        required
        inputMode="tel"
        value={contact.phone}
        onChange={(e) => setContact({ ...contact, phone: formatPhone(e.target.value) })}
        placeholder="(11) 90000-0000"
        autoComplete="off"
        leading={<span className="text-[17px] text-black-99">+55</span>}
      />
      <Button size="lg" full className="mt-6 h-16 rounded-2xl text-[22px]" disabled={!contactReady} onClick={() => setContactFor(null)}>
        Confirmar
      </Button>
    </div>
  );

  const detailsPanel = (
    <div className="flex flex-col gap-3">
      <RoutePair
        bare
        origin={a && { title: pointLabel(pickup), contact: contactLine(pickup) ?? "Adicionar nome e telefone" }}
        destination={b && { title: pointLabel(dropoff), contact: contactLine(dropoff) ?? "Adicionar nome e telefone" }}
        onEditOrigin={() => setContactFor("pickup")}
        onEditDestination={() => setContactFor("dropoff")}
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

      <section aria-labelledby="item-title" className="rounded-3xl bg-white px-5 pb-3 pt-5">
        <div className="flex items-start gap-4">
          <Icon name="box" size={24} className="mt-0.5 shrink-0 text-secondary-99" />
          <div className="min-w-0 flex-1">
            <h2 id="item-title" className="text-[18px] font-bold">
              Inserir detalhes do item<span className="text-alert-99">*</span>
            </h2>
            <Input
              aria-label="O que vai no pacote"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Adicionar uma observação na entrega"
              maxLength={80}
              autoComplete="off"
              wrapperClassName="border-b-0"
            />
          </div>
        </div>
      </section>

      <ul className="rounded-3xl bg-white px-2 py-2" role="list" aria-label="Categorias de entrega">
        {deliveryCategories.map((c) => {
          const checked = size === c.id;
          const price = route ? deliveryFare(km, c.id) : 0;
          return (
            <li key={c.id} className="border-b border-border-99 last:border-b-0">
              <button
                type="button"
                aria-pressed={checked}
                onClick={() => setSize(c.id)}
                className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-4 text-left transition-colors duration-150 hover:bg-offwhite-99"
              >
                {/* No fluxo de entrega a moto também aparece com a caixa. */}
                <VehicleArt category={c.id === "moto" ? "entrega-moto" : "entrega-carro"} width={48} />
                {/* Nome e preço dividem a primeira linha: o nome encolhe com reticências, o preço nunca. */}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[16px] font-bold min-[400px]:text-[18px]">
                      <span className="truncate">{c.name}</span>
                      <Icon name="info" size={16} className="shrink-0 text-placeholder-99" />
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-[16px] font-extrabold tabular-nums min-[400px]:text-[19px]">
                      {pricing.loading ? <PriceSkeleton /> : route ? formatBRL(price) : "—"}
                    </span>
                    {/* Radio do app: anel preto grosso quando escolhido. */}
                    <span
                      className={cx("h-6 w-6 shrink-0 rounded-full", checked ? "border-[7px] border-black-99" : "border-2 border-border-99")}
                      aria-hidden="true"
                    />
                  </span>
                  {route && <span className="text-[15px] font-medium text-secondary-99">{`${eta.min}–${eta.max} min`}</span>}
                  <span className="text-[15px] font-medium text-secondary-99">
                    {c.dims} · {c.weight}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const panelFor = { landing: landingPanel, search: searchPanel, contact: contactPanel, details: detailsPanel }[screen];

  return (
    <MapPanelLayout
      map={map}
      panelWidth="lg"
      panel={panelFor}
      mapHiddenOnMobile
      tone={screen === "details" ? "subtle" : "white"}
      title={screen === "contact" ? contactTitle : screen === "details" ? "Detalhes da entrega" : undefined}
      onBack={
        screen === "landing"
          ? undefined
          : () => {
              if (screen === "search") setEditing(null);
              else if (screen === "contact") setContactFor(null);
              else setEditing(otherKey);
            }
      }
      footer={
        screen === "details" ? (
          <>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <PaymentBlock
                  icon={paymentIcon[payment]}
                  label={paymentLabel(payment)}
                  detail={payment === "cartao" && card.number ? `•••• ${card.number.replace(/\s/g, "").slice(-4)}` : undefined}
                  onClick={() => setPayOpen(true)}
                />
                {route && <span className="shrink-0 text-[15px] text-secondary-99">{formatKm(km)}</span>}
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="whitespace-nowrap text-[22px] font-bold tabular-nums min-[400px]:text-[26px]">{route && !pricing.loading ? formatBRL(fare) : "—"}</span>
                <Button size="lg" className="h-16 rounded-2xl max-[399px]:px-5 max-[399px]:text-[18px] min-[400px]:min-w-[180px] min-[400px]:text-[22px]" disabled={blocked || pricing.loading} onClick={() => setPaying(true)}>
                  Confirmar
                </Button>
              </div>
              <BlockedHint items={missing.slice(0, 3).concat(missing.length > 3 ? [`mais ${missing.length - 3}`] : [])} />
            </div>
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
