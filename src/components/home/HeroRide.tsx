"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppProvider";
import { useCurrentLocation } from "@/lib/useGeolocation";
import { AddressSearch } from "@/components/map/AddressSearch";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { GeoPlace } from "@/lib/geo";

/**
 * A corrida começa na home: origem na localização atual, destino com os mesmos
 * endereços recentes do fluxo e o botão que abre o painel já com o destino.
 * O card repete o par origem e destino das telas de corrida e entrega.
 */
export function HeroRide() {
  const router = useRouter();
  const current = useCurrentLocation();
  const { setRideDestination } = useApp();
  const [destino, setDestino] = useState<GeoPlace | null>(null);

  const cidade = current.place?.city
    ? `${current.place.city}${current.place.state ? ` - ${current.place.state}` : ""}`
    : current.status === "loading"
      ? "Localizando você…"
      : "São Paulo - SP";

  function seguir(place: GeoPlace | null) {
    setRideDestination(place);
    router.push("/corrida");
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <p className="flex items-center gap-1.5 text-[15px] font-medium text-secondary-99">
        <Icon name="pin" size={18} className="text-black-99" />
        {cidade}
      </p>

      <div className="rounded-2xl bg-offwhite-99 p-2">
        <div className="relative rounded-2xl bg-white p-2">
          {/* Linha ligando os dois círculos, no eixo deles. */}
          <span
            className="pointer-events-none absolute bottom-[calc(25%+8px)] left-[31px] top-[calc(25%+8px)] w-0.5 bg-border-99"
            aria-hidden="true"
          />
          <div className="flex h-14 items-center gap-4 rounded-xl px-4">
            <span className="h-4 w-4 shrink-0 rounded-full border-[3px] border-success-99 bg-white" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[17px] font-bold">
              {current.place ? current.place.title : "Localização atual"}
            </span>
          </div>
          <AddressSearch
            placeholder="Para onde vamos?"
            ariaLabel="Destino"
            value={destino}
            position={current.position}
            variant="row"
            onChange={(p) => {
              setDestino(p);
              if (p) seguir(p);
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg" onClick={() => seguir(destino)}>
          Ver preços
        </Button>
        <span className="text-[15px] text-secondary-99">Rota e preço aparecem na hora, sem cadastro.</span>
      </div>
    </div>
  );
}
