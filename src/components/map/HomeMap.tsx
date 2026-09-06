"use client";

import { MapView } from "@/components/map/MapView";
import { useCurrentLocation } from "@/lib/useGeolocation";

/** Mapa ilustrativo da home: só o marcador de posição atual, sem origem, destino ou rota. */
export function HomeMap() {
  const current = useCurrentLocation();
  return <MapView userLocation={current.position} center={current.position} zoom={14} interactive={false} />;
}
