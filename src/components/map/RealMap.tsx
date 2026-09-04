"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { pointAlong, type LatLng } from "@/lib/geo";
import type { MapViewProps } from "@/components/map/MapView";

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

function originIcon() {
  return L.divIcon({
    className: "",
    html: '<svg width="24" height="24" viewBox="0 0 24 24" overflow="visible" style="display:block;filter:drop-shadow(0 1px 2px rgba(0,0,0,.2))"><circle cx="12" cy="12" r="8" fill="#fff" stroke="#00C853" stroke-width="3.5"/></svg>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function destinationIcon(accent: string) {
  return L.divIcon({
    className: "",
    // Pino com margem interna: traço e sombra nunca encostam na borda do SVG.
    html: `<svg width="40" height="48" viewBox="0 0 40 48" overflow="visible" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))"><path d="M20 44 C 9.5 31.5, 6 24, 6 18 A 14 14 0 0 1 34 18 C 34 24, 30.5 31.5, 20 44 Z" fill="${accent}" stroke="#212121" stroke-width="2.5" stroke-linejoin="round"/><circle cx="20" cy="18" r="5" fill="#212121"/></svg>`,
    iconSize: [40, 48],
    iconAnchor: [20, 44],
  });
}

function userIcon() {
  return L.divIcon({
    className: "",
    html: '<svg width="32" height="32" viewBox="0 0 32 32" overflow="visible" style="display:block"><circle cx="16" cy="16" r="14" fill="rgba(16,133,212,.2)"/><circle cx="16" cy="16" r="7" fill="#1085D4" stroke="#fff" stroke-width="3"/></svg>',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const vehiclePaths: Record<NonNullable<MapViewProps["vehicle"]>, string> = {
  car: '<path d="M4 15l1.5-5.5A2 2 0 0 1 7.4 8h9.2a2 2 0 0 1 1.9 1.5L20 15v4H4v-4Z"/><path d="M4 15h16"/><circle cx="8" cy="15.5" r="1"/><circle cx="16" cy="15.5" r="1"/>',
  moto: '<circle cx="5.5" cy="16.5" r="3"/><circle cx="18.5" cy="16.5" r="3"/><path d="M5.5 16.5 9 10h4l2.5 6.5M13 10l2-3h3M9 10H6.5"/>',
  bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
};

function vehicleIcon(kind: NonNullable<MapViewProps["vehicle"]>) {
  return L.divIcon({
    className: "",
    html: `<svg width="48" height="48" viewBox="0 0 48 48" overflow="visible" style="display:block;filter:drop-shadow(0 3px 6px rgba(0,0,0,.2))"><circle cx="24" cy="24" r="20" fill="#fff" stroke="#212121" stroke-width="2.5"/><g transform="translate(12 12)" fill="none" stroke="#212121" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${vehiclePaths[kind]}</g></svg>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

function searchingIcon(accent: string) {
  return L.divIcon({
    className: "",
    html: `<span class="map-pulse" style="--pulse:${accent}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function RealMap({
  origin,
  destination,
  route,
  progress,
  vehicle = "car",
  accent = "orange",
  searching,
  userLocation,
  interactive = true,
  center,
  zoom = 14,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const vehicleRef = useRef<L.Marker | null>(null);
  const animRef = useRef<number | null>(null);
  const currentRef = useRef(0);
  const accentHex = accent === "yellow" ? "#FFDD00" : "#FC4C02";

  // Cria o mapa uma vez.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      keyboard: interactive,
      attributionControl: true,
    }).setView([center?.lat ?? -23.5535, center?.lng ?? -46.6889], zoom);
    L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
    if (interactive) map.zoomControl.setPosition("bottomright");
    layersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
      vehicleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marcadores, rota e enquadramento.
  const routeKey = route ? `${route.length}:${route[0]?.lat},${route[0]?.lng}:${route[route.length - 1]?.lat}` : "";
  useEffect(() => {
    const map = mapRef.current;
    const group = layersRef.current;
    if (!map || !group) return;
    group.clearLayers();
    vehicleRef.current = null;

    const bounds: L.LatLngExpression[] = [];

    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon(), interactive: false, keyboard: false, zIndexOffset: -10 }).addTo(group);
      if (!origin && !destination) bounds.push([userLocation.lat, userLocation.lng]);
    }

    const line: LatLng[] = route && route.length > 1 ? route : origin && destination ? [origin, destination] : [];
    if (line.length > 1) {
      const latlngs = line.map((p) => [p.lat, p.lng] as L.LatLngExpression);
      L.polyline(latlngs, { color: "#ffffff", weight: 10, opacity: 0.9, lineCap: "round", lineJoin: "round" }).addTo(group);
      L.polyline(latlngs, { color: "#00C853", weight: 6, lineCap: "round", lineJoin: "round" }).addTo(group);
      bounds.push(...latlngs);
    }

    if (origin) {
      if (searching) {
        L.marker([origin.lat, origin.lng], { icon: searchingIcon("#FFDD00"), interactive: false, keyboard: false }).addTo(group);
      }
      L.marker([origin.lat, origin.lng], { icon: originIcon(), interactive: false, keyboard: false })
        .addTo(group)
        .bindTooltip(origin.label ?? "Origem", { direction: "top", offset: [0, -14], className: "map-tip" });
      bounds.push([origin.lat, origin.lng]);
    }
    if (destination) {
      L.marker([destination.lat, destination.lng], { icon: destinationIcon(accentHex), interactive: false, keyboard: false })
        .addTo(group)
        .bindTooltip(destination.label ?? "Destino", { direction: "top", offset: [0, -44], className: "map-tip" });
      bounds.push([destination.lat, destination.lng]);
    }

    if (bounds.length >= 2) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [56, 56], maxZoom: 16 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.lat, origin?.lng, origin?.label, destination?.lat, destination?.lng, destination?.label, routeKey, searching, userLocation?.lat, userLocation?.lng, accentHex]);

  // Veículo percorrendo o trajeto.
  useEffect(() => {
    const map = mapRef.current;
    const group = layersRef.current;
    if (!map || !group) return;
    const line: LatLng[] = route && route.length > 1 ? route : origin && destination ? [origin, destination] : [];
    if (progress === undefined || line.length === 0) {
      if (vehicleRef.current) {
        group.removeLayer(vehicleRef.current);
        vehicleRef.current = null;
      }
      return;
    }
    if (!vehicleRef.current) {
      const start = pointAlong(line, currentRef.current);
      vehicleRef.current = L.marker([start.lat, start.lng], { icon: vehicleIcon(vehicle), interactive: false, keyboard: false, zIndexOffset: 100 }).addTo(group);
    }
    const marker = vehicleRef.current;
    const target = Math.max(0, Math.min(1, progress));
    const from = currentRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || Math.abs(target - from) < 0.001) {
      currentRef.current = target;
      const p = pointAlong(line, target);
      marker.setLatLng([p.lat, p.lng]);
      return;
    }
    const duration = 1800;
    const startTime = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const v = from + (target - from) * ease(t);
      currentRef.current = v;
      const p = pointAlong(line, v);
      marker.setLatLng([p.lat, p.lng]);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, routeKey, vehicle, origin?.lat, destination?.lat]);

  return <div ref={containerRef} className="h-full w-full" />;
}
