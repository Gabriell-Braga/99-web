"use client";

import { useEffect, useState } from "react";
import { MapView } from "@/components/map/MapView";
import { fetchRoute, type LatLng } from "@/lib/geo";

/** Sede da 99 em São Paulo: Rua Fidêncio Ramos, 308, Vila Olímpia. */
const ORIGIN = { lat: -23.5952, lng: -46.6867, label: "Rua Fidêncio Ramos" };
/** Portão 3 do Parque Ibirapuera, cerca de 3 km de trajeto. */
const DESTINATION = { lat: -23.5874, lng: -46.6576, label: "Parque Ibirapuera" };

/**
 * Mapa da home: uma corrida fixa de demonstração saindo da sede da 99, para a
 * vitrine mostrar a rota como ela aparece nos fluxos. Não usa a localização do
 * visitante e não pede permissão. O crédito do mapa está no rodapé da página.
 */
export function HomeMap() {
  const [route, setRoute] = useState<LatLng[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchRoute(ORIGIN, DESTINATION, controller.signal)
      .then((r) => {
        if (r.points.length > 1) setRoute(r.points);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <MapView
      origin={ORIGIN}
      destination={DESTINATION}
      route={route}
      progress={route ? 0.38 : undefined}
      vehicle="car"
      interactive={false}
      attribution={false}
      center={ORIGIN}
      zoom={13}
    />
  );
}
