"use client";

import { useEffect, useState } from "react";
import { reverseGeocode, type LatLng } from "@/lib/geo";
import type { RecentAddress } from "@/data/addresses";

/** Deslocamentos de 3 a 6 km em volta da posição atual, e o contato salvo em dois deles. */
const OFFSETS: { bearing: number; km: number; name?: string; phone?: string }[] = [
  { bearing: 70, km: 4.2 },
  { bearing: 160, km: 3.4, name: "Maria Souza", phone: "11987654321" },
  { bearing: 250, km: 5.6 },
  { bearing: 330, km: 3.9, name: "Braseiro Burger", phone: "11912345678" },
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

const cache = new Map<string, RecentAddress[]>();

/**
 * Endereços recentes gerados a 3–6 km da localização atual, com nome real via
 * geocodificação reversa, para o trajeto inicial ser sempre urbano.
 */
export function useRecents(position: LatLng | null): RecentAddress[] {
  const key = position ? `${position.lat.toFixed(3)},${position.lng.toFixed(3)}` : null;
  const [fetched, setFetched] = useState<{ key: string | null; list: RecentAddress[] }>({ key: null, list: [] });
  const cached = key ? cache.get(key) : undefined;

  useEffect(() => {
    if (!position || !key || cache.get(key)) return;
    let cancelled = false;
    const controller = new AbortController();
    const out: RecentAddress[] = [];
    (async () => {
      for (const [i, o] of OFFSETS.entries()) {
        const pt = offset(position, o.bearing, o.km);
        try {
          const place = await reverseGeocode(pt, controller.signal);
          if (cancelled) return;
          if (place && place.street) {
            out.push({
              id: `rec-${i}`,
              title: place.number ? `${place.street}, ${place.number}` : place.street,
              subtitle: [place.neighborhood, place.city ? `${place.city}${place.state ? ` - ${place.state}` : ""}` : ""].filter(Boolean).join(" · "),
              lat: pt.lat,
              lng: pt.lng,
              street: place.street,
              number: place.number,
              neighborhood: place.neighborhood,
              city: place.city,
              cep: place.cep,
              name: o.name,
              phone: o.phone,
            });
            setFetched({ key, list: [...out] });
          }
        } catch {
          // segue para o próximo ponto
        }
        // Nominatim pede no máximo uma consulta por segundo.
        await new Promise((r) => setTimeout(r, 1100));
        if (cancelled) return;
      }
      cache.set(key, out);
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [key, position]);

  return cached ?? (fetched.key === key ? fetched.list : []);
}
