"use client";

import { useEffect, useState } from "react";
import type { GeoPlace } from "@/lib/geo";
import { formatPhone } from "@/lib/format";
import { Input } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ErrorNote } from "@/components/ui/States";
import { AddressSearch, type PastedExtras } from "@/components/map/AddressSearch";
import { cx } from "@/lib/cx";

export interface PointState {
  place: GeoPlace | null;
  number: string;
  complement: string;
  name: string;
  phone: string;
}

export const emptyPointState: PointState = { place: null, number: "", complement: "", name: "", phone: "" };

interface PointCardProps {
  id: "coleta" | "entrega";
  title: string;
  icon: IconName;
  placeholder: string;
  value: PointState;
  onChange: (p: PointState) => void;
  currentLocation?: GeoPlace | null;
  currentLoading?: boolean;
}

/**
 * Ponto de coleta ou entrega no estilo do aplicativo: primeiro o endereço no
 * mapa, depois os detalhes de quem entrega ou recebe.
 */
export function PointCard({ id, title, icon, placeholder, value, onChange, currentLocation, currentLoading }: PointCardProps) {
  const [flash, setFlash] = useState<Set<keyof PointState>>(new Set());
  const [touched, setTouched] = useState<Partial<Record<keyof PointState, boolean>>>({});

  useEffect(() => {
    if (flash.size === 0) return;
    const t = setTimeout(() => setFlash(new Set()), 1400);
    return () => clearTimeout(t);
  }, [flash]);

  function handlePlace(place: GeoPlace | null, extras?: PastedExtras) {
    if (!place) {
      onChange({ ...value, place: null });
      return;
    }
    const next: PointState = {
      place,
      number: place.number || extras?.number || value.number,
      complement: extras?.complement ?? value.complement,
      name: extras?.name ?? value.name,
      phone: extras?.phone ? formatPhone(extras.phone) : value.phone,
    };
    onChange(next);
    if (extras) {
      const filled = new Set<keyof PointState>();
      (["number", "complement", "name", "phone"] as (keyof PointState)[]).forEach((k) => {
        if (next[k] && next[k] !== value[k]) filled.add(k);
      });
      setFlash(filled);
    }
  }

  const set = <K extends keyof PointState>(k: K, v: PointState[K]) => onChange({ ...value, [k]: v });
  const fieldClass = (k: keyof PointState) => cx("transition-colors duration-700", flash.has(k) && "bg-yellow-99-light");
  const needsNumber = Boolean(value.place && !value.place.number && !value.place.exact);
  const err = (k: "number" | "name" | "phone") => (touched[k] && !value[k].trim() ? "Campo obrigatório." : undefined);

  return (
    <section className="flex flex-col gap-4" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="flex items-center gap-2 text-[22px] font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-99 text-black-99">
          <Icon name={icon} size={18} />
        </span>
        {title}
      </h2>

      <AddressSearch
        label="Endereço"
        icon="pin"
        placeholder={placeholder}
        value={value.place}
        onChange={handlePlace}
        currentLocation={currentLocation}
        currentLoading={currentLoading}
        hint={value.place ? undefined : "Digite para buscar, ou cole o endereço completo vindo de outro sistema."}
      />

      {value.place && !value.place.covered && (
        <ErrorNote
          title="Endereço fora da área de cobertura"
          description={`Ainda não atendemos ${value.place.city || value.place.title}. A entrega precisa começar e terminar no Brasil.`}
        />
      )}

      {value.place && value.place.covered && (
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border-99 p-4">
          <p className="col-span-2 flex items-start gap-2 text-sm">
            <Icon name="pin" size={16} className="mt-0.5 shrink-0 text-muted-99" />
            <span>
              <span className="font-semibold">{value.place.title}</span>
              <span className="block text-[13px] text-muted-99">{value.place.subtitle}</span>
            </span>
          </p>
          {needsNumber && (
            <Input
              label="Número"
              value={value.number}
              onChange={(e) => set("number", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, number: true }))}
              error={err("number")}
              className={fieldClass("number")}
              inputMode="numeric"
              autoComplete="off"
            />
          )}
          <Input
            label="Complemento"
            placeholder="Apto, bloco, loja"
            value={value.complement}
            onChange={(e) => set("complement", e.target.value)}
            className={fieldClass("complement")}
            wrapperClassName={needsNumber ? "" : "col-span-2"}
            autoComplete="off"
          />
          <Input
            label={id === "coleta" ? "Quem entrega" : "Quem recebe"}
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            error={err("name")}
            className={fieldClass("name")}
            autoComplete="off"
          />
          <Input
            label="Telefone"
            inputMode="tel"
            placeholder="(11) 90000-0000"
            value={value.phone}
            onChange={(e) => set("phone", formatPhone(e.target.value))}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            error={err("phone")}
            className={fieldClass("phone")}
            autoComplete="off"
          />
        </div>
      )}
    </section>
  );
}

export function pointMissing(p: PointState, label: string): string[] {
  const out: string[] = [];
  if (!p.place) out.push(`o endereço de ${label}`);
  else {
    if (!p.place.covered) out.push(`um endereço de ${label} dentro da área`);
    if (!p.place.number && !p.place.exact && !p.number.trim()) out.push(`o número na ${label}`);
    if (!p.name.trim()) out.push(`o nome de contato na ${label}`);
    if (p.phone.replace(/\D/g, "").length < 10) out.push(`o telefone na ${label}`);
  }
  return out;
}

export function pointIsReady(p: PointState): boolean {
  return pointMissing(p, "x").length === 0;
}
