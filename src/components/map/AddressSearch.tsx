"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { searchAddress, type GeoPlace } from "@/lib/geo";
import { parseAddress, type ParsedAddress } from "@/lib/parseAddress";
import type { RecentAddress } from "@/data/addresses";
import { useRecents } from "@/lib/useRecents";
import type { LatLng } from "@/lib/geo";
import { formatPhone } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

export interface PastedExtras {
  complement?: string;
  name?: string;
  phone?: string;
  number?: string;
}

interface AddressSearchProps {
  /** "Para onde vamos?" em corrida, "Entregar para" em entrega. */
  placeholder: string;
  ariaLabel: string;
  value: GeoPlace | null;
  onChange: (place: GeoPlace | null, extras?: PastedExtras) => void;
  /** Opção "Usar localização atual" no topo da lista. */
  currentLocation?: GeoPlace | null;
  currentLoading?: boolean;
  autoFocus?: boolean;
  /** Mostra os endereços recentes antes de digitar. */
  showRecents?: boolean;
  /** Posição atual: os recentes são gerados a 3–6 km dela. */
  position?: LatLng | null;
}

type Status = "idle" | "loading" | "error";

function recentToPlace(r: RecentAddress): GeoPlace {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    lat: r.lat,
    lng: r.lng,
    street: r.street,
    number: r.number,
    neighborhood: r.neighborhood,
    city: r.city,
    state: "SP",
    cep: r.cep,
    covered: true,
  };
}

/**
 * Campo de endereço com sugestões, o mesmo em corrida e em entrega. Campo
 * branco de raio total com lupa, texto em 20px bold. Antes de digitar mostra
 * os endereços recentes; ao digitar, resultados reais do OpenStreetMap.
 * Navegável por teclado, com aria-activedescendant no item em foco.
 */
export function AddressSearch({
  placeholder,
  ariaLabel,
  value,
  onChange,
  currentLocation,
  currentLoading,
  autoFocus,
  showRecents = true,
  position = null,
}: AddressSearchProps) {
  const recentAddresses = useRecents(position);
  const [text, setText] = useState(value ? value.title : "");
  const [prevValue, setPrevValue] = useState(value);
  // Com foco automático a lista já abre, para o painel mostrar as recomendações sem clique.
  const [open, setOpen] = useState(Boolean(autoFocus));
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [highlight, setHighlight] = useState(0);
  const reduceMotion = useReducedMotion();
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    if (value) setText(value.title);
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function runSearch(q: string) {
    abortRef.current?.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.trim().length < 3) {
      setResults([]);
      setStatus("idle");
      return;
    }
    setStatus("loading");
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const r = await searchAddress(q, controller.signal);
        if (controller.signal.aborted) return;
        setResults(r);
        setStatus("idle");
        setHighlight(0);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setStatus("error");
        setResults([]);
      }
    }, 450);
  }

  function pick(p: GeoPlace, extras?: PastedExtras) {
    onChange(p, extras);
    setText(p.title);
    setOpen(false);
    setResults([]);
  }

  async function handlePaste(raw: string) {
    const parsed = parseAddress(raw);
    if (parsed.empty || !parsed.fields.street) return false;
    const f: ParsedAddress = parsed.fields;
    const query = [f.street, f.number, f.neighborhood, f.city ?? "São Paulo", f.state ?? "SP"].filter(Boolean).join(", ");
    setText(query);
    setStatus("loading");
    setOpen(false);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      let r = await searchAddress(query, controller.signal);
      if (r.length === 0 && f.cep) r = await searchAddress(`${f.cep}, Brasil`, controller.signal);
      if (controller.signal.aborted) return true;
      if (r.length === 0) {
        setStatus("error");
        setResults([]);
        setOpen(true);
        return true;
      }
      const best = { ...r[0] };
      if (!best.number && f.number) {
        best.number = f.number;
        best.title = `${best.street}, ${f.number}`;
      }
      setStatus("idle");
      pick(best, { complement: f.complement, name: f.name, phone: f.phone, number: f.number });
    } catch (e) {
      if ((e as Error).name === "AbortError") return true;
      setStatus("error");
    }
    return true;
  }

  const typing = text.trim().length > 0 && text !== value?.title;
  const showCurrent = Boolean(currentLocation || currentLoading) && !typing;
  const recents = showRecents && !typing ? recentAddresses : [];
  const items: { id: string; kind: "current" | "recent" | "result"; place: GeoPlace | null; recent?: RecentAddress }[] = [
    ...(showCurrent ? [{ id: "current", kind: "current" as const, place: currentLocation ?? null }] : []),
    ...recents.map((r) => ({ id: r.id, kind: "recent" as const, place: recentToPlace(r), recent: r })),
    ...(typing ? results.map((p) => ({ id: p.id, kind: "result" as const, place: p })) : []),
  ];
  const optionId = (i: number) => `${listId}-opt-${i}`;

  function choose(i: number) {
    const it = items[i];
    if (!it || !it.place) return;
    if (it.kind === "recent" && it.recent) {
      pick(it.place, { name: it.recent.name, phone: it.recent.phone ? formatPhone(it.recent.phone) : undefined, number: it.recent.number });
    } else {
      pick(it.place);
    }
  }

  const listOpen = open && (items.length > 0 || status === "error" || (typing && text.trim().length >= 3 && status !== "loading"));

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Icon name="search" size={22} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-black-99" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={listOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={listOpen && items[highlight] ? optionId(highlight) : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={text}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            setOpen(true);
            setHighlight(0);
            if (value) onChange(null);
            runSearch(v);
          }}
          onPaste={(e) => {
            const raw = e.clipboardData.getData("text");
            if (raw.trim().length > 12 && /\d/.test(raw)) {
              e.preventDefault();
              void handlePaste(raw);
            }
          }}
          onKeyDown={(e) => {
            if (!listOpen) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlight((h) => Math.min(h + 1, items.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(highlight);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          className="h-14 w-full rounded-full border border-border-99 bg-white pl-14 pr-14 text-[20px] font-bold text-black-99 placeholder:font-bold placeholder:text-placeholder-99 focus:border-black-99 focus:outline-none"
        />
        {status === "loading" ? (
          <span className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin rounded-full border-2 border-border-99 border-t-black-99" aria-label="Buscando" />
        ) : text ? (
          <button
            type="button"
            aria-label="Limpar"
            onClick={() => {
              setText("");
              setResults([]);
              setStatus("idle");
              onChange(null);
              setOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-99 hover:bg-offwhite-99"
          >
            <Icon name="x" size={18} />
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {listOpen && (
        <motion.ul
          id={listId}
          role="listbox"
          aria-label={typing ? "Resultados" : "Endereços recentes"}
          initial={reduceMotion ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0.4, 0, 0.2, 1] }}
          className="panel-scroll absolute left-0 right-0 top-full z-20 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-border-99 bg-white py-2 shadow-high"
        >
          {!typing && recents.length > 0 && (
            <li className="px-6 pb-1 pt-2 text-[13px] text-secondary-99" role="presentation">
              Endereços recentes
            </li>
          )}
          {items.map((it, i) => {
            const active = i === highlight;
            const contact = it.recent && it.recent.name ? `${it.recent.name} · ${formatPhone(it.recent.phone ?? "")}` : null;
            return (
              <li
                key={it.id}
                id={optionId(i)}
                role="option"
                aria-selected={active}
                aria-disabled={it.kind === "current" && !it.place}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                onMouseEnter={() => setHighlight(i)}
                className={cx(
                  "mx-2 flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 transition-colors duration-[120ms]",
                  active && "bg-offwhite-99",
                  it.kind === "current" && !it.place && "cursor-default opacity-70",
                )}
              >
                <Icon
                  name={it.kind === "current" ? "target" : it.kind === "recent" ? "clock" : "pin"}
                  size={22}
                 
                  className={cx("mt-0.5 shrink-0", it.kind === "current" ? "text-info-99" : "text-black-99")}
                />
                <span className="min-w-0 flex-1">
                  {it.kind === "current" ? (
                    <>
                      <span className="block text-[15px] font-bold">Usar localização atual</span>
                      <span className="block truncate text-sm text-secondary-99">
                        {currentLoading ? "Obtendo sua posição…" : it.place ? `${it.place.title} · ${it.place.subtitle}` : "Não disponível"}
                      </span>
                    </>
                  ) : it.kind === "recent" ? (
                    <>
                      <span className={cx("block text-[15px]", contact ? "font-bold" : "font-normal")}>{it.place?.title}</span>
                      <span className="block truncate text-sm text-secondary-99">{contact ?? it.place?.subtitle}</span>
                    </>
                  ) : (
                    <>
                      <span className="block text-[15px] font-bold">{it.place?.title}</span>
                      <span className="block truncate text-sm text-secondary-99">
                        {it.place?.subtitle}
                        {it.place && !it.place.covered ? " · fora da área" : ""}
                      </span>
                    </>
                  )}
                </span>
                <Icon name="chevronRight" size={18} className="mt-1 shrink-0 text-muted-99" />
              </li>
            );
          })}
          {status === "error" && (
            <li className="px-4 py-3 text-sm text-orange-99-text" role="presentation">
              Não foi possível buscar agora. Confira a conexão e tente de novo.
            </li>
          )}
          {status === "idle" && typing && results.length === 0 && text.trim().length >= 3 && (
            <li className="px-4 py-3 text-sm text-muted-99" role="presentation">
              Nenhum endereço encontrado. Tente rua e número.
            </li>
          )}
        </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
