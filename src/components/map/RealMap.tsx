"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { haversineKm, pointAlong, type LatLng } from "@/lib/geo";
import type { MapViewProps } from "@/components/map/MapView";

/** Estilo Positron servido pelo OpenFreeMap, sem chave. */
const STYLE = "https://tiles.openfreemap.org/styles/positron";

const ROUTE_SOURCE = "route";
const ROUTE_LAYER = "route-line";

/** Camadas escondidas em todos os zooms: POIs, rótulos de edifício, números de endereço, transporte e comércio. */
const HIDDEN_LAYER = /poi|housenumber|house_number|transit|shop|building.*(label|name)|(label|name).*building/i;
/** Rótulos de rua só a partir do zoom 15. */
const ROAD_LABEL = /^highway-name|road.*(name|label)/i;

const vehicleImage: Record<NonNullable<MapViewProps["vehicle"]>, string> = {
  car: "/vehicles/car-white.png",
  moto: "/vehicles/moto-white.png",
  bag: "/vehicles/moto-box.png",
};

function dot(color: string, halo: boolean): HTMLElement {
  const el = document.createElement("span");
  el.style.cssText = "position:relative;display:block;width:32px;height:32px;pointer-events:none";
  if (halo) {
    const h = document.createElement("span");
    h.style.cssText = "position:absolute;inset:0;border-radius:50%;background:rgba(0,200,83,.2)";
    el.appendChild(h);
  }
  const c = document.createElement("span");
  c.style.cssText = `position:absolute;left:8px;top:8px;width:16px;height:16px;border-radius:50%;background:${color};box-shadow:0 0 0 3px #fff`;
  el.appendChild(c);
  return el;
}

function pulse(): HTMLElement {
  const el = document.createElement("span");
  el.className = "map-pulse";
  el.style.setProperty("--pulse", "#FFDD00");
  return el;
}

function userDot(): HTMLElement {
  const el = document.createElement("span");
  el.style.cssText =
    "display:block;width:14px;height:14px;border-radius:50%;background:#2E7BFF;box-shadow:0 0 0 3px #fff,0 0 0 9px rgba(46,123,255,.2);pointer-events:none";
  return el;
}

function vehicleEl(kind: NonNullable<MapViewProps["vehicle"]>): HTMLElement {
  const img = document.createElement("img");
  img.src = vehicleImage[kind];
  img.alt = "";
  img.width = 48;
  img.height = 48;
  img.style.cssText = "display:block;width:48px;height:48px;object-fit:contain;pointer-events:none";
  return img;
}

function lineFeature(points: LatLng[]): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates: points.map((p) => [p.lng, p.lat]) },
  };
}

export default function RealMap({
  origin,
  destination,
  route,
  progress,
  vehicle = "car",
  searching,
  userLocation,
  interactive = true,
  center,
  zoom = 14,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const readyRef = useRef(false);
  const markersRef = useRef<Marker[]>([]);
  const vehicleRef = useRef<Marker | null>(null);
  const animRef = useRef<number | null>(null);
  const drawRef = useRef<number | null>(null);
  const currentRef = useRef(0);
  const pendingRef = useRef<(() => void) | null>(null);

  // Cria o mapa uma vez.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [center?.lng ?? -46.6889, center?.lat ?? -23.5535],
      zoom,
      interactive,
      attributionControl: false,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.on("error", (e) => console.error("[mapa]", e.error?.message ?? e));

    map.on("load", () => {
      const style = map.getStyle();
      for (const layer of style.layers ?? []) {
        if (HIDDEN_LAYER.test(layer.id)) map.setLayoutProperty(layer.id, "visibility", "none");
        if (ROAD_LABEL.test(layer.id) && layer.type === "symbol") map.setLayerZoomRange(layer.id, 15, 24);
      }
      map.addSource(ROUTE_SOURCE, { type: "geojson", data: lineFeature([]) });
      map.addLayer({
        id: ROUTE_LAYER,
        type: "line",
        source: ROUTE_SOURCE,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#00C853", "line-width": 6 },
      });
      readyRef.current = true;
      containerRef.current?.setAttribute("data-map-ready", "true");
      pendingRef.current?.();
      pendingRef.current = null;
    });

    mapRef.current = map;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      if (drawRef.current) cancelAnimationFrame(drawRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
      markersRef.current = [];
      vehicleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Marcadores, rota e enquadramento.
  const routeKey = route ? `${route.length}:${route[0]?.lat},${route[0]?.lng}:${route[route.length - 1]?.lat}` : "";
  useEffect(() => {
    const apply = () => {
      const map = mapRef.current;
      if (!map) return;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      vehicleRef.current?.remove();
      vehicleRef.current = null;

      const add = (el: HTMLElement, p: LatLng) => {
        const m = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat([p.lng, p.lat]).addTo(map);
        markersRef.current.push(m);
      };

      if (userLocation) add(userDot(), userLocation);
      if (origin && searching) add(pulse(), origin);
      if (origin) add(dot("#00C853", true), origin);
      if (destination) add(dot("#FC4C02", false), destination);

      const line: LatLng[] = route && route.length > 1 ? route : origin && destination ? [origin, destination] : [];
      const source = map.getSource(ROUTE_SOURCE) as maplibregl.GeoJSONSource | undefined;
      if (drawRef.current) cancelAnimationFrame(drawRef.current);
      if (source) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (line.length < 2 || reduce) {
          source.setData(lineFeature(line));
        } else {
          // A linha desenha do início ao fim em 500ms, por distância percorrida.
          const cum: number[] = [0];
          for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + haversineKm(line[i - 1], line[i]));
          const total = cum[cum.length - 1] || 1;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / 500);
            const reach = total * t;
            const partial = line.filter((_, i) => cum[i] <= reach);
            if (t < 1) partial.push(pointAlong(line, t));
            source.setData(lineFeature(partial.length >= 2 ? partial : line.slice(0, 2)));
            if (t < 1) drawRef.current = requestAnimationFrame(tick);
          };
          drawRef.current = requestAnimationFrame(tick);
        }
      }

      const pts: LatLng[] = [...line];
      if (origin) pts.push(origin);
      if (destination) pts.push(destination);
      if (pts.length === 0 && userLocation) pts.push(userLocation);
      if (pts.length >= 2) {
        const b = new maplibregl.LngLatBounds();
        pts.forEach((p) => b.extend([p.lng, p.lat]));
        map.fitBounds(b, { padding: 80, duration: 600, maxZoom: 16 });
      } else if (pts.length === 1) {
        map.easeTo({ center: [pts[0].lng, pts[0].lat], zoom: 15, duration: 600 });
      }
    };
    if (readyRef.current) apply();
    else pendingRef.current = apply;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, routeKey, searching, userLocation?.lat, userLocation?.lng]);

  // Veículo percorrendo o trajeto.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const line: LatLng[] = route && route.length > 1 ? route : origin && destination ? [origin, destination] : [];
    if (progress === undefined || line.length === 0) {
      vehicleRef.current?.remove();
      vehicleRef.current = null;
      return;
    }
    if (!vehicleRef.current) {
      const start = pointAlong(line, currentRef.current);
      vehicleRef.current = new maplibregl.Marker({ element: vehicleEl(vehicle), anchor: "center" })
        .setLngLat([start.lng, start.lat])
        .addTo(map);
    }
    const marker = vehicleRef.current!;
    const target = Math.max(0, Math.min(1, progress));
    const from = currentRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || Math.abs(target - from) < 0.001) {
      currentRef.current = target;
      const p = pointAlong(line, target);
      marker.setLngLat([p.lng, p.lat]);
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
      marker.setLngLat([p.lng, p.lat]);
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
