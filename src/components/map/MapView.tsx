"use client";

import dynamic from "next/dynamic";
import type { LatLng } from "@/lib/geo";
import { cx } from "@/lib/cx";

export interface MapPoint extends LatLng {
  label?: string;
}

export interface MapViewProps {
  origin?: MapPoint | null;
  destination?: MapPoint | null;
  /** Polilinha do trajeto. Sem ela, liga origem e destino em linha reta. */
  route?: LatLng[] | null;
  /** 0 a 1: posição do veículo ao longo do trajeto. Undefined esconde o marcador. */
  progress?: number;
  vehicle?: "car" | "moto" | "bag";
  /** Cor do pino de destino. No app é laranja. */
  accent?: "yellow" | "orange";
  /** Pulso no ponto de origem enquanto procura motorista. */
  searching?: boolean;
  /** Ponto azul da localização atual do usuário. */
  userLocation?: LatLng | null;
  interactive?: boolean;
  /** Crédito do mapa sobre o canvas. Desligado onde a página já credita no rodapé. */
  attribution?: boolean;
  center?: LatLng;
  zoom?: number;
  className?: string;
}

const RealMap = dynamic(() => import("@/components/map/RealMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-skeleton bg-offwhite-99" aria-hidden="true" />,
});

/** Mapa real (OpenStreetMap via Leaflet), carregado só no cliente. */
export function MapView({ className, ...props }: MapViewProps) {
  return (
    <div
      className={cx("relative isolate z-0 h-full w-full overflow-hidden bg-offwhite-99", className)}
      role="region"
      aria-label={
        props.origin && props.destination
          ? `Mapa com trajeto de ${props.origin.label ?? "origem"} até ${props.destination.label ?? "destino"}`
          : "Mapa"
      }
    >
      <RealMap {...props} />
    </div>
  );
}
