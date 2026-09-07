"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppProvider";
import { useCurrentLocation } from "@/lib/useGeolocation";
import { AddressSearch } from "@/components/map/AddressSearch";
import { HomeButton } from "@/components/home/HomeButton";
import { Icon } from "@/components/ui/Icon";
import type { GeoPlace } from "@/lib/geo";

/**
 * A corrida começa na home: origem na localização atual, destino com os mesmos
 * endereços recentes do fluxo e o botão que abre o painel já com os dois.
 * O card repete o par origem e destino das telas de corrida e entrega, e a
 * origem também pode ser trocada aqui.
 */
export function HeroRide() {
  const router = useRouter();
  const current = useCurrentLocation();
  const { setRideOrigin, setRideDestination } = useApp();
  const [origem, setOrigem] = useState<GeoPlace | null>(null);
  const [editandoOrigem, setEditandoOrigem] = useState(false);
  const [destino, setDestino] = useState<GeoPlace | null>(null);

  const origemEscolhida = origem ?? current.place;
  const cidade = current.place?.city
    ? `${current.place.city}${current.place.state ? ` - ${current.place.state}` : ""}`
    : current.status === "loading"
      ? "Localizando você…"
      : "São Paulo - SP";

  function seguir(place: GeoPlace | null) {
    setRideOrigin(origem);
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
          {/* Linha ligando os dois círculos, por baixo deles. */}
          <span
            className="pointer-events-none absolute bottom-[calc(25%+8px)] left-[31px] top-[calc(25%+8px)] w-0.5 bg-border-99"
            aria-hidden="true"
          />

          {editandoOrigem ? (
            <AddressSearch
              key="origem"
              placeholder="De onde você sai?"
              ariaLabel="Origem"
              value={origem}
              currentLocation={current.place}
              currentLoading={current.status === "loading"}
              position={current.position}
              variant="row"
              ponto="origem"
              autoFocus
              onChange={(p) => {
                setOrigem(p);
                if (p) setEditandoOrigem(false);
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditandoOrigem(true)}
              className="relative flex h-14 w-full items-center gap-4 rounded-xl px-4 text-left transition-colors duration-[120ms] hover:bg-offwhite-99"
            >
              <span
                className="relative z-10 h-4 w-4 shrink-0 rounded-full border-[3px] border-success-99 bg-white"
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate text-[17px] font-bold">
                {origemEscolhida ? origemEscolhida.title : "Localização atual"}
              </span>
              <Icon name="chevronRight" size={20} className="shrink-0 text-muted-99" />
            </button>
          )}

          <AddressSearch
            key="destino"
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
        <HomeButton tom="amarelo" onClick={() => seguir(destino)}>
          Ver preços
        </HomeButton>
        <span className="text-[15px] text-secondary-99">Rota e preço aparecem na hora, sem cadastro.</span>
      </div>
    </div>
  );
}
