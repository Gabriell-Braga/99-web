"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LOCATION, reverseGeocode, type GeoPlace, type LatLng } from "@/lib/geo";

export interface CurrentLocation {
  status: "loading" | "ready" | "denied" | "fallback";
  position: LatLng;
  place: GeoPlace | null;
}

/**
 * Localização atual do navegador com endereço reverso. Se o usuário negar
 * ou o navegador não suportar, usa um ponto padrão em São Paulo e informa.
 */
export function useCurrentLocation(enabled = true): CurrentLocation {
  const [state, setState] = useState<CurrentLocation>({
    status: "loading",
    position: DEFAULT_LOCATION,
    place: null,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const controller = new AbortController();

    async function resolve(pos: LatLng, status: CurrentLocation["status"]) {
      let place: GeoPlace | null = null;
      try {
        place = await reverseGeocode(pos, controller.signal);
      } catch {
        place = null;
      }
      if (cancelled) return;
      setState({ status, position: pos, place });
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(DEFAULT_LOCATION, "fallback");
    } else {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }, "ready"),
        () => resolve(DEFAULT_LOCATION, "denied"),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
      );
    }

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled]);

  return state;
}
