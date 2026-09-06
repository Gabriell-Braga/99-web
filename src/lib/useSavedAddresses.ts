"use client";

import { useEffect, useState } from "react";
import { reverseGeocode, type LatLng } from "@/lib/geo";
import type { CurrentLocation } from "@/lib/useGeolocation";
import type { SavedAddress } from "@/lib/types";
import { savedAddresses } from "@/data/addresses";

/**
 * Endereços salvos do fluxo de comida, montados em volta da posição atual. O
 * primeiro é a própria localização, os dois seguintes ficam perto e o último
 * fica longe o bastante para cair fora do raio de entrega.
 */
const SPECS: { id: string; label: string; bearing: number; km: number; line2: string; covered: boolean }[] = [
  { id: "atual", label: "Localização atual", bearing: 0, km: 0, line2: "Onde você está agora", covered: true },
  { id: "casa", label: "Casa", bearing: 35, km: 1.4, line2: "Apto 62", covered: true },
  { id: "trabalho", label: "Trabalho", bearing: 125, km: 5.2, line2: "12º andar", covered: true },
  { id: "sitio", label: "Sítio", bearing: 250, km: 42, line2: "Zona rural", covered: false },
];

function offset(p: LatLng, bearingDeg: number, km: number): LatLng {
  const R = 6371;
  const b = (bearingDeg * Math.PI) / 180;
  const lat1 = (p.lat * Math.PI) / 180;
  const lng1 = (p.lng * Math.PI) / 180;
  const d = km / R;
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b));
  const lng2 = lng1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: (lat2 * 180) / Math.PI, lng: (lng2 * 180) / Math.PI };
}

const cache = new Map<string, SavedAddress[]>();

/** Lista pronta só quando os quatro endereços resolvem, para o cabeçalho não piscar. */
export function useSavedAddresses(current: CurrentLocation): SavedAddress[] {
  const key = current.status === "loading" ? null : `${current.position.lat.toFixed(3)},${current.position.lng.toFixed(3)}`;
  const [built, setBuilt] = useState<{ key: string | null; list: SavedAddress[] }>({ key: null, list: [] });
  const cached = key ? cache.get(key) : undefined;

  useEffect(() => {
    if (!key || cache.get(key)) return;
    let cancelled = false;
    const controller = new AbortController();
    const base = current.position;
    const first = current.place;
    (async () => {
      const out: SavedAddress[] = [];
      for (const [i, spec] of SPECS.entries()) {
        const point = spec.km === 0 ? base : offset(base, spec.bearing, spec.km);
        let place = spec.km === 0 ? first : null;
        if (!place) {
          try {
            place = await reverseGeocode(point, controller.signal);
          } catch {
            place = null;
          }
          // Nominatim pede no máximo uma consulta por segundo.
          await new Promise((r) => setTimeout(r, 1100));
        }
        if (cancelled) return;
        const fallback = savedAddresses[Math.min(i, savedAddresses.length - 1)];
        const rua = place?.street ? (place.number ? `${place.street}, ${place.number}` : place.street) : fallback.line1;
        out.push({
          id: spec.id,
          label: spec.label,
          line1: rua,
          line2: place?.neighborhood ? `${spec.line2} · ${place.neighborhood}` : spec.line2,
          city: place?.city ? `${place.city}${place.state ? ` - ${place.state}` : ""}` : fallback.city,
          covered: spec.covered,
          lat: point.lat,
          lng: point.lng,
        });
      }
      cache.set(key, out);
      if (!cancelled) setBuilt({ key, list: out });
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return cached ?? (built.key === key ? built.list : []);
}
