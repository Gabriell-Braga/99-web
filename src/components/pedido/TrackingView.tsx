"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Order } from "@/lib/types";
import { STAGE_DURATION_MS } from "@/lib/stages";
import { fetchRoute, type LatLng } from "@/lib/geo";
import { formatBRL, formatKm, formatPhone } from "@/lib/format";
import { useApp } from "@/context/AppProvider";
import { MapPanelLayout } from "@/components/layout/MapPanelLayout";
import { MapView } from "@/components/map/MapView";
import { Timeline } from "@/components/pedido/Timeline";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/ui/States";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Chip";
import { paymentLabel } from "@/components/payment/PaymentPicker";
import { packageSizes } from "@/lib/pricing";

const verticalName = { comida: "Pedido", corrida: "Corrida", entrega: "Entrega" } as const;

export function TrackingView({ id }: { id: string }) {
  const { getOrder } = useApp();
  const order = getOrder(id);

  if (!order) {
    return (
      <Container className="py-16">
        <EmptyState
          icon="clock"
          title="Pedido não encontrado"
          description="Este protótipo guarda pedidos só em memória. Ao recarregar a página, o histórico some. Comece um novo pedido ou veja uma demonstração."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <LinkButton href="/">Começar um pedido</LinkButton>
              <LinkButton href="/pedido/demo-entrega" variant="ghost">
                Ver demonstração
              </LinkButton>
            </div>
          }
        />
      </Container>
    );
  }

  return <Tracking key={order.id} order={order} />;
}

function Tracking({ order }: { order: Order }) {
  const [stage, setStage] = useState(0);
  const [fetchedRoute, setFetchedRoute] = useState<{ id: string; points: LatLng[] } | null>(null);
  const last = order.stages.length - 1;
  const finished = stage >= last;
  const current = order.stages[stage];
  const route = order.route ?? (fetchedRoute?.id === order.id ? fetchedRoute.points : undefined);

  // Pedidos de demonstração não guardam o trajeto: busca no OSRM.
  useEffect(() => {
    if (order.route) return;
    const controller = new AbortController();
    fetchRoute(order.origin, order.destination, controller.signal)
      .then((r) => setFetchedRoute({ id: order.id, points: r.points }))
      .catch(() => {});
    return () => controller.abort();
  }, [order.id, order.route, order.origin, order.destination]);

  useEffect(() => {
    if (finished) return;
    const t = setTimeout(() => setStage((s) => Math.min(s + 1, last)), STAGE_DURATION_MS);
    return () => clearTimeout(t);
  }, [stage, finished, last]);

  const vehicle = order.vertical === "corrida" ? (order.category === "moto" ? "moto" : "car") : order.vertical === "comida" ? "bag" : "moto";
  const showVehicle = order.vertical === "comida" ? true : stage >= 1;
  const searching = current.id === "procurando";

  return (
    <MapPanelLayout
      map={
        <MapView
          origin={order.origin}
          destination={order.destination}
          route={route}
          progress={showVehicle ? current.progress : undefined}
          vehicle={vehicle}
          searching={searching}
          accent="yellow"
        />
      }
      panel={
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge tone={finished ? "success" : "yellow"}>
                {verticalName[order.vertical]} {order.id}
              </Badge>
            </div>
            <h1 className="text-[28px] font-semibold leading-tight" aria-live="polite">
              {current.title}
            </h1>
            <p className="flex items-center gap-2 text-secondary-99">
              <Icon name="clock" size={18} />
              {current.etaLabel}
            </p>
          </div>

          <Timeline stages={order.stages} current={stage} vertical={order.vertical} />

          {finished && (
            <div className="flex flex-col gap-3 rounded-xl bg-success-99-bg p-4">
              <p className="font-semibold text-success-99-deep">
                {order.vertical === "comida" && "Pedido entregue. Bom apetite."}
                {order.vertical === "corrida" && "Corrida finalizada. Obrigado por viajar com a 99."}
                {order.vertical === "entrega" && "Pacote entregue e confirmado com o código."}
              </p>
              <div className="flex flex-wrap gap-2">
                <LinkButton href={`/${order.vertical}`} size="sm">
                  {order.vertical === "comida" ? "Pedir de novo" : order.vertical === "corrida" ? "Nova corrida" : "Nova entrega"}
                </LinkButton>
                <LinkButton href="/" size="sm" variant="ghost">
                  Início
                </LinkButton>
              </div>
            </div>
          )}

          {(order.vertical !== "comida" ? stage >= 1 : stage >= 2) && (
            <PersonCard order={order} />
          )}

          <Summary order={order} />

          <DemoControls
            stage={stage}
            last={last}
            onRestart={() => setStage(0)}
            onNext={() => setStage((s) => Math.min(s + 1, last))}
          />
        </div>
      }
    />
  );
}

function PersonCard({ order }: { order: Order }) {
  const person =
    order.vertical === "corrida"
      ? {
          name: order.driver.name,
          rating: order.driver.rating,
          line: `${order.driver.vehicle} ${order.driver.color}`,
          plate: order.driver.plate,
          meta: `${order.driver.trips.toLocaleString("pt-BR")} viagens`,
          role: "Motorista",
        }
      : order.vertical === "entrega"
        ? {
            name: order.courier.name,
            rating: order.courier.rating,
            line: order.courier.vehicle,
            plate: order.courier.plate,
            meta: "Entregador parceiro",
            role: "Entregador",
          }
        : {
            name: order.courier.name,
            rating: order.courier.rating,
            line: order.courier.vehicle,
            plate: undefined,
            meta: "Entregador parceiro",
            role: "Entregador",
          };

  return (
    <section className="flex items-center gap-4 rounded-2xl border border-border-99 p-4" aria-label={person.role}>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-offwhite-99 text-black-99">
        <Icon name="user" size={28} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-muted-99">{person.role}</p>
        <p className="truncate font-semibold">{person.name}</p>
        <p className="flex flex-wrap items-center gap-x-2 text-sm text-secondary-99">
          <span className="flex items-center gap-1 font-semibold text-black-99">
            <Icon name="star" size={14} className="fill-yellow-99-deep text-yellow-99-deep" />
            {person.rating.toFixed(2)}
          </span>
          <span>{person.line}</span>
        </p>
        <p className="text-[13px] text-muted-99">{person.meta}</p>
      </div>
      {person.plate && (
        <span className="rounded-lg border-2 border-black-99 px-2 py-1 font-mono text-sm font-bold tracking-wider">
          {person.plate}
        </span>
      )}
    </section>
  );
}

function Summary({ order }: { order: Order }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-subtle-99 p-5" aria-labelledby="sum-title">
      <h2 id="sum-title" className="text-lg font-semibold">
        Resumo
      </h2>
      {order.vertical === "comida" && (
        <>
          <p className="text-sm text-secondary-99">
            <Link href={`/comida/${order.restaurantSlug}`} className="font-semibold text-black-99 hover:underline">
              {order.restaurantName}
            </Link>{" "}
            · {order.deliveryMode === "retirada" ? "Retirada no restaurante" : order.addressLabel}
          </p>
          <ul className="flex flex-col gap-1 text-sm" role="list">
            {order.lines.map((l) => (
              <li key={l.lineId} className="flex justify-between gap-3">
                <span>
                  {l.quantity}× {l.name}
                </span>
                <span>{formatBRL(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <Row label="Frete" value={order.deliveryFee === 0 ? "Grátis" : formatBRL(order.deliveryFee)} />
          {order.discount > 0 && <Row label="Desconto" value={`- ${formatBRL(order.discount)}`} />}
        </>
      )}
      {order.vertical === "corrida" && (
        <>
          <Row label="De" value={order.origin.label} />
          <Row label="Para" value={order.destination.label} />
          <Row label="Categoria" value={order.categoryName} />
          <Row label="Trajeto" value={`${formatKm(order.distanceKm)} · ${order.durationMin} min`} />
          {order.note && <Row label="Observação" value={`“${order.note}”`} />}
        </>
      )}
      {order.vertical === "entrega" && (
        <>
          <Row label="Coleta" value={`${order.pickup.street}, ${order.pickup.number} · ${order.pickup.name}`} />
          <Row
            label="Entrega"
            value={`${order.dropoff.street}, ${order.dropoff.number}${order.dropoff.complement ? `, ${order.dropoff.complement}` : ""} · ${order.dropoff.name} · ${formatPhone(order.dropoff.phone)}`}
          />
          <Row label="Conteúdo" value={order.content} />
          <Row
            label="Pacote"
            value={`${packageSizes.find((s) => s.id === order.size)?.label ?? order.size}${order.declaredValue ? ` · valor declarado ${formatBRL(order.declaredValue)}` : ""}`}
          />
          <Row label="Distância" value={formatKm(order.distanceKm)} />
        </>
      )}
      <div className="mt-1 flex items-center justify-between border-t border-border-99 pt-3">
        <span className="text-sm text-secondary-99">{paymentLabel(order.payment)}</span>
        <span className="text-lg font-bold">{formatBRL(order.total)}</span>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-99">{label}</span>
      <span className="text-right">{value}</span>
    </p>
  );
}

function DemoControls({
  stage,
  last,
  onRestart,
  onNext,
}: {
  stage: number;
  last: number;
  onRestart: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border-99 pt-4 text-[13px] text-muted-99">
      <span>
        Demonstração · etapa {stage + 1} de {last + 1}
      </span>
      <div className="flex gap-1">
        <Button variant="text" size="sm" onClick={onRestart} className="h-8 px-3 text-[13px]" aria-label="Reiniciar acompanhamento">
          <Icon name="refresh" size={14} />
          Reiniciar
        </Button>
        <Button variant="text" size="sm" onClick={onNext} disabled={stage >= last} className="h-8 px-3 text-[13px]" aria-label="Avançar etapa">
          <Icon name="skipForward" size={14} />
          Avançar
        </Button>
      </div>
    </div>
  );
}
