/**
 * Geocodificação, rota e distância com serviços abertos, sem chave de API:
 * Nominatim (OpenStreetMap) para busca de endereço e OSRM para o trajeto.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeoPlace extends LatLng {
  id: string;
  /** Linha principal: "Rua Augusta, 1500". */
  title: string;
  /** Linha secundária: "Consolação · São Paulo - SP". */
  subtitle: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  covered: boolean;
  /** Ponto exato (GPS): não precisa de número. */
  exact?: boolean;
}

/** Vila Madalena, São Paulo: ponto de partida quando a geolocalização não está disponível. */
export const DEFAULT_LOCATION: LatLng = { lat: -23.5535, lng: -46.6889 };

export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: Record<string, string>;
}

function toPlace(r: NominatimResult): GeoPlace {
  const a = r.address ?? {};
  const street = a.road ?? a.pedestrian ?? a.footway ?? a.residential ?? a.path ?? "";
  const number = a.house_number ?? "";
  const neighborhood = a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? "";
  const city = a.city ?? a.town ?? a.municipality ?? a.village ?? a.county ?? "";
  const state = a["ISO3166-2-lvl4"]?.replace("BR-", "") ?? "";
  const cep = a.postcode ?? "";
  const poi = r.name && r.name !== street && r.name !== number ? r.name : "";

  const title = poi || (street ? `${street}${number ? `, ${number}` : ""}` : r.display_name.split(",")[0]);
  const subtitleParts = [poi && street ? `${street}${number ? `, ${number}` : ""}` : "", neighborhood, city ? `${city}${state ? ` - ${state}` : ""}` : ""].filter(Boolean);

  return {
    id: String(r.place_id),
    lat: Number(r.lat),
    lng: Number(r.lon),
    title,
    subtitle: subtitleParts.join(" · "),
    street: street || poi,
    number,
    neighborhood,
    city,
    state,
    cep,
    // Teste: cobertura em todo o Brasil. Fora do país fica "fora da área".
    covered: (a.country_code ?? "").toLowerCase() === "br",
  };
}

const BASE = "https://nominatim.openstreetmap.org";
const SP_VIEWBOX = "-47.2,-23.2,-46.2,-24.1"; // Grande São Paulo, prioridade nos resultados.

export async function searchAddress(query: string, signal?: AbortSignal): Promise<GeoPlace[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const url = `${BASE}/search?format=jsonv2&addressdetails=1&limit=6&viewbox=${SP_VIEWBOX}&bounded=0&accept-language=pt-BR&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = (await res.json()) as NominatimResult[];
  const seen = new Set<string>();
  return data.map(toPlace).filter((p) => {
    const key = `${p.title}|${p.subtitle}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function reverseGeocode(pos: LatLng, signal?: AbortSignal): Promise<GeoPlace | null> {
  const url = `${BASE}/reverse?format=jsonv2&addressdetails=1&zoom=18&accept-language=pt-BR&lat=${pos.lat}&lon=${pos.lng}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as NominatimResult & { error?: string };
  if (data.error) return null;
  const p = toPlace(data);
  return { ...p, lat: pos.lat, lng: pos.lng, exact: true };
}

export interface RouteResult {
  points: LatLng[];
  distanceKm: number;
  durationMin: number;
}

export async function fetchRoute(a: LatLng, b: LatLng, signal?: AbortSignal): Promise<RouteResult> {
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = (await res.json()) as {
      code: string;
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
    };
    const r = data.routes?.[0];
    if (data.code !== "Ok" || !r) throw new Error("sem rota");
    return {
      points: r.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
      distanceKm: Math.round((r.distance / 1000) * 10) / 10,
      durationMin: Math.max(3, Math.round(r.duration / 60)),
    };
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    // Sem rota: linha reta com fator urbano, para a demonstração não travar.
    const km = Math.round(haversineKm(a, b) * 1.3 * 10) / 10;
    return { points: [a, b], distanceKm: km, durationMin: Math.max(3, Math.round((km / 22) * 60)) };
  }
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la = (a.lat * Math.PI) / 180;
  const lb = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Ponto ao longo de uma polilinha na fração t (0 a 1) do comprimento total. */
export function pointAlong(points: LatLng[], t: number): LatLng {
  if (points.length === 0) return DEFAULT_LOCATION;
  if (points.length === 1 || t <= 0) return points[0];
  if (t >= 1) return points[points.length - 1];
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const d = haversineKm(points[i - 1], points[i]);
    seg.push(d);
    total += d;
  }
  let target = total * t;
  for (let i = 0; i < seg.length; i++) {
    if (target <= seg[i]) {
      const f = seg[i] === 0 ? 0 : target / seg[i];
      const p = points[i];
      const q = points[i + 1];
      return { lat: p.lat + (q.lat - p.lat) * f, lng: p.lng + (q.lng - p.lng) * f };
    }
    target -= seg[i];
  }
  return points[points.length - 1];
}

export function placeLabel(p: GeoPlace): string {
  return p.title;
}
