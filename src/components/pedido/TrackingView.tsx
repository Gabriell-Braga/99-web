"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/types";
import { fetchRoute, type LatLng } from "@/lib/geo";
import { useApp } from "@/context/AppProvider";
import { TripTracking } from "@/components/pedido/TripTracking";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/ui/States";
import { LinkButton } from "@/components/ui/Button";

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

/** Busca o trajeto quando o pedido não o traz e entrega o acompanhamento no formato do app. */
function Tracking({ order }: { order: Order }) {
  const [fetchedRoute, setFetchedRoute] = useState<{ id: string; points: LatLng[] } | null>(null);
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

  return <TripTracking order={order} route={route} />;
}
