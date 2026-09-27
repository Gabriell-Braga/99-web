"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { haversineKm, pointAlong, type LatLng } from "@/lib/geo";
import type { MapViewProps } from "@/components/map/MapView";
import { vehicleImage } from "@/components/ui/VehicleArt";

/** Estilo Positron servido pelo OpenFreeMap, sem chave. */
const STYLE = "https://tiles.openfreemap.org/styles/positron";

const ROUTE_SOURCE = "route";
const ROUTE_LAYER = "route-line";
const ENDS_SOURCE = "endpoints";
const ENDS_HALO_LAYER = "endpoint-halo";
const ENDS_DOT_LAYER = "endpoint-dot";

/** Camadas escondidas em todos os zooms: POIs, rótulos de edifício, números de endereço, transporte e comércio. */
const HIDDEN_LAYER = /poi|housenumber|house_number|transit|shop|building.*(label|name)|(label|name).*building/i;
/** Rótulos de rua só a partir do zoom 15. */
const ROAD_LABEL = /^highway-name|road.*(name|label)/i;

/** Mesma imagem do card da categoria; o entregador do Food vai de moto, sem caixa. */
const imageFor = (kind: NonNullable<MapViewProps["vehicle"]>) => (kind === "bag" ? vehicleImage.moto : vehicleImage[kind]);

/**
 * O MapLibre posiciona o marcador com `transform`; a animação de escala no mesmo
 * elemento apagava essa posição e o pulso ia parar no canto do mapa. Por isso o
 * pulso fica num filho, e o contêiner só recebe a posição.
 */
function pulse(): HTMLElement {
  const wrap = document.createElement("span");
  wrap.style.cssText = "display:block;width:24px;height:24px;pointer-events:none";
  const el = document.createElement("span");
  el.className = "map-pulse";
  el.style.setProperty("--pulse", "#FFDD00");
  wrap.appendChild(el);
  return wrap;
}

/** Círculo azul-claro em volta da origem enquanto os motoristas veem o pedido, como no app. */
function radar(): HTMLElement {
  const wrap = document.createElement("span");
  wrap.style.cssText = "display:block;width:220px;height:220px;pointer-events:none";
  const el = document.createElement("span");
  el.className = "map-radar";
  wrap.appendChild(el);
  return wrap;
}

/**
 * Veículo parado por perto, visto de cima como no app, girado na direção da rua.
 * A foto lateral da categoria não gira bem, por isso aqui é um desenho simples.
 */
function nearbyCar(kind: NonNullable<MapViewProps["vehicle"]>, angleDeg: number): HTMLElement {
  const moto = kind === "moto" || kind === "entrega-moto" || kind === "bag";
  const taxi = kind === "taxi";
  const wrap = document.createElement("span");
  wrap.style.cssText = "display:block;width:40px;height:40px;pointer-events:none";
  const inner = document.createElement("span");
  inner.className = "map-nearby";
  inner.style.cssText = `display:flex;width:40px;height:40px;align-items:center;justify-content:center;--turn:${angleDeg}deg`;
  const body = taxi ? "#F1C400" : "#2B2D31";
  inner.innerHTML = moto
    ? `<svg width="14" height="30" viewBox="0 0 14 30" aria-hidden="true"><rect x="4" y="0.5" width="6" height="7" rx="3" fill="#1b1b1b"/><rect x="2" y="7" width="10" height="15" rx="5" fill="${body}"/><circle cx="7" cy="12" r="3.2" fill="#E8EAED"/><rect x="4" y="22" width="6" height="7.5" rx="3" fill="#1b1b1b"/></svg>`
    : `<svg width="20" height="36" viewBox="0 0 20 36" aria-hidden="true" style="filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.35))"><rect x="1" y="1" width="18" height="34" rx="6" fill="${body}"/><rect x="3.5" y="7" width="13" height="7" rx="2.5" fill="#C9D3DE"/><rect x="3.5" y="24" width="13" height="5" rx="2" fill="#C9D3DE"/><rect x="4" y="15.5" width="12" height="7" rx="1.5" fill="${body}" opacity=".85"/><rect x="2.5" y="1.5" width="4" height="2.4" rx="1" fill="#FFF6C8"/><rect x="13.5" y="1.5" width="4" height="2.4" rx="1" fill="#FFF6C8"/></svg>`;
  wrap.appendChild(inner);
  return wrap;
}

/** Classes de via onde carro circula, no esquema OpenMapTiles do estilo. */
const DRIVABLE = new Set(["motorway", "trunk", "primary", "secondary", "tertiary", "minor"]);

/**
 * Três pontos sobre ruas desenhadas perto da origem, entre 120 e 420 m dela, em
 * direções bem separadas, com o ângulo da rua na tela. Lê as vias do próprio mapa,
 * então os carros caem na rua e alinhados com ela.
 */
function roadSpots(map: MLMap, origin: LatLng): { at: LatLng; angle: number }[] {
  const c = map.project([origin.lng, origin.lat]);
  const box: [[number, number], [number, number]] = [
    [c.x - 220, c.y - 220],
    [c.x + 220, c.y + 220],
  ];
  const candidates: { at: LatLng; angle: number; around: number }[] = [];
  for (const f of map.queryRenderedFeatures(box)) {
    if (f.sourceLayer !== "transportation" || !DRIVABLE.has(String(f.properties?.class))) continue;
    const g = f.geometry;
    const lines = g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : [];
    for (const line of lines) {
      for (let i = 1; i < line.length; i++) {
        const a = { lng: line[i - 1][0], lat: line[i - 1][1] };
        const b = { lng: line[i][0], lat: line[i][1] };
        const segKm = haversineKm(a, b);
        if (segKm < 0.03) continue;
        const mid = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
        const d = haversineKm(origin, mid);
        if (d < 0.12 || d > 0.42) continue;
        const pa = map.project([a.lng, a.lat]);
        const pb = map.project([b.lng, b.lat]);
        const pm = map.project([mid.lng, mid.lat]);
        // O desenho aponta para cima; soma 90° ao ângulo da rua na tela.
        const angle = (Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180) / Math.PI + 90;
        const around = (Math.atan2(pm.y - c.y, pm.x - c.x) * 180) / Math.PI;
        candidates.push({ at: mid, angle, around });
      }
    }
  }
  // Direções em volta da origem separadas por pelo menos 80°.
  const picked: typeof candidates = [];
  for (const cand of candidates.sort((x, y) => x.around - y.around)) {
    const far = picked.every((p) => {
      const diff = Math.abs(((cand.around - p.around + 540) % 360) - 180);
      return diff >= 80;
    });
    if (far) picked.push(cand);
    if (picked.length === 3) break;
  }
  // Metade dos carros vai no sentido contrário da rua.
  return picked.map((p, i) => ({ at: p.at, angle: i % 2 ? p.angle + 180 : p.angle }));
}


function userDot(): HTMLElement {
  const el = document.createElement("span");
  el.style.cssText =
    "display:block;width:14px;height:14px;border-radius:50%;background:#2E7BFF;box-shadow:0 0 0 3px #fff,0 0 0 9px rgba(46,123,255,.2);pointer-events:none";
  return el;
}

function vehicleEl(kind: NonNullable<MapViewProps["vehicle"]>): HTMLElement {
  const img = document.createElement("img");
  img.src = imageFor(kind);
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

/**
 * Origem e destino como pontos do próprio mapa, no mesmo espaço da linha da
 * rota. Assim o círculo cai exatamente na ponta do traçado em qualquer zoom.
 */
function endpointsData(origin?: LatLng | null, destination?: LatLng | null): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  const add = (p: LatLng, role: "origin" | "destination") =>
    features.push({ type: "Feature", properties: { role }, geometry: { type: "Point", coordinates: [p.lng, p.lat] } });
  if (origin) add(origin, "origin");
  if (destination) add(destination, "destination");
  return { type: "FeatureCollection", features };
}

export default function RealMap({
  origin,
  destination,
  route,
  progress,
  vehicle = "pop",
  searching,
  routeMuted,
  lookingAround,
  userLocation,
  interactive = true,
  attribution = true,
  center,
  zoom = 14,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const readyRef = useRef(false);
  const markersRef = useRef<Marker[]>([]);
  const vehicleRef = useRef<Marker | null>(null);
  const carsTokenRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const drawRef = useRef<number | null>(null);
  const currentRef = useRef(0);
  const pendingRef = useRef<(() => void) | null>(null);
  // Últimos pontos enquadrados: quando o painel entra, o mapa encolhe e o
  // enquadramento precisa ser refeito, senão a origem some atrás do painel.
  const fitRef = useRef<LatLng[]>([]);

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
    if (attribution) map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

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

      map.addSource(ENDS_SOURCE, { type: "geojson", data: endpointsData() });
      map.addLayer({
        id: ENDS_HALO_LAYER,
        type: "circle",
        source: ENDS_SOURCE,
        filter: ["==", ["get", "role"], "origin"],
        paint: { "circle-radius": 16, "circle-color": "#00C853", "circle-opacity": 0.2 },
      });
      map.addLayer({
        id: ENDS_DOT_LAYER,
        type: "circle",
        source: ENDS_SOURCE,
        paint: {
          "circle-radius": 8,
          "circle-color": ["match", ["get", "role"], "origin", "#00C853", "#FC4C02"],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      readyRef.current = true;
      containerRef.current?.setAttribute("data-map-ready", "true");
      pendingRef.current?.();
      pendingRef.current = null;
    });

    mapRef.current = map;
    const enquadrar = () => {
      const pts = fitRef.current;
      if (pts.length >= 2) {
        const b = new maplibregl.LngLatBounds();
        pts.forEach((p) => b.extend([p.lng, p.lat]));
        map.fitBounds(b, { padding: 80, duration: 0, maxZoom: 16 });
      } else if (pts.length === 1) {
        map.easeTo({ center: [pts[0].lng, pts[0].lat], zoom: 15, duration: 0 });
      }
    };
    const ro = new ResizeObserver(() => {
      map.resize();
      enquadrar();
    });
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

  // Pontas, rota e enquadramento.
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

      // Só geometria real de rota. Reta entre dois pontos nunca é desenhada.
      const line: LatLng[] = route && route.length > 1 ? route : [];
      // A rota começa e termina onde a rua permite parar, alguns metros do endereço.
      // Os círculos seguem a ponta da linha, senão a bolinha fica solta longe dela.
      const startPoint = line.length > 1 ? line[0] : origin;
      const endPoint = line.length > 1 ? line[line.length - 1] : destination;

      // O ponto azul some quando a origem é o mesmo lugar, para não cobrir o
      // círculo verde. A rota começa na rua mais próxima, então a folga é maior.
      const userIsOrigin = Boolean(userLocation && startPoint && haversineKm(userLocation, startPoint) < 0.15);
      if (userLocation && !userIsOrigin) add(userDot(), userLocation);
      // Cada aplicação invalida os carros que ainda esperavam a câmera parar.
      const token = ++carsTokenRef.current;
      if (startPoint && lookingAround) {
        add(radar(), startPoint);
        // Só depois da câmera fechar na origem as ruas certas estão desenhadas.
        const sp = startPoint;
        map.once("idle", () => {
          if (token !== carsTokenRef.current) return;
          roadSpots(map, sp).forEach((s) => add(nearbyCar(vehicle, s.angle), s.at));
        });
      } else if (startPoint && searching) add(pulse(), startPoint);

      const ends = map.getSource(ENDS_SOURCE) as maplibregl.GeoJSONSource | undefined;
      ends?.setData(endpointsData(startPoint, endPoint));
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

      // Com os motoristas vendo o pedido, a câmera fecha na origem.
      const pts: LatLng[] = lookingAround && startPoint ? [startPoint] : [...line];
      if (!(lookingAround && startPoint)) {
        if (origin) pts.push(origin);
        if (destination) pts.push(destination);
      }
      if (pts.length === 0 && userLocation) pts.push(userLocation);
      fitRef.current = pts;
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
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, routeKey, searching, lookingAround, vehicle, userLocation?.lat, userLocation?.lng]);

  // Rota cinza enquanto confirma o destino; verde depois, com transição suave.
  useEffect(() => {
    const paint = () => mapRef.current?.setPaintProperty(ROUTE_LAYER, "line-color", routeMuted ? "#B7BCC4" : "#00C853");
    if (readyRef.current) paint();
    else {
      const prev = pendingRef.current;
      pendingRef.current = () => {
        prev?.();
        paint();
      };
    }
  }, [routeMuted]);

  // Veículo percorrendo o trajeto.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Só geometria real de rota. Reta entre dois pontos nunca é desenhada.
    const line: LatLng[] = route && route.length > 1 ? route : [];
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
    // Trocou a categoria com o marcador já no mapa: só troca a imagem.
    const img = marker.getElement() as HTMLImageElement;
    if (!img.src.endsWith(imageFor(vehicle))) img.src = imageFor(vehicle);
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
