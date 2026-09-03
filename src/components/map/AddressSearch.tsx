"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchAddress, type GeoPlace } from "@/lib/geo";
import { parseAddress, type ParsedAddress } from "@/lib/parseAddress";
import { Input } from "@/components/ui/Field";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

export interface PastedExtras {
  complement?: string;
  name?: string;
  phone?: string;
  number?: string;
}

interface AddressSearchProps {
  label: string;
  placeholder: string;
  icon: IconName;
  value: GeoPlace | null;
  onChange: (place: GeoPlace | null, extras?: PastedExtras) => void;
  /** Opção "Usar localização atual" no topo da lista. */
  currentLocation?: GeoPlace | null;
  currentLoading?: boolean;
  hint?: string;
  error?: string;
  autoFocus?: boolean;
}

type Status = "idle" | "loading" | "error" | "pasted";

/**
 * Campo de endereço no estilo do aplicativo: busca com sugestões reais
 * (OpenStreetMap). Colar um endereço completo, vindo de outro sistema,
 * reconhece rua, número, complemento, nome e telefone e resolve no mapa.
 */
export function AddressSearch({
  label,
  placeholder,
  icon,
  value,
  onChange,
  currentLocation,
  currentLoading,
  hint,
  error,
  autoFocus,
}: AddressSearchProps) {
  const [text, setText] = useState(value ? value.title : "");
  const [prevValue, setPrevValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [highlight, setHighlight] = useState(0);
  const [pasteNote, setPasteNote] = useState<string | null>(null);
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
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
        setPasteNote(null);
        return true;
      }
      const best = { ...r[0] };
      if (!best.number && f.number) {
        best.number = f.number;
        best.title = `${best.street}, ${f.number}`;
      }
      const extras: PastedExtras = { complement: f.complement, name: f.name, phone: f.phone, number: f.number };
      const got = ["endereço", f.complement && "complemento", f.name && "nome", f.phone && "telefone"].filter(Boolean);
      setPasteNote(`Reconhecemos ${got.join(", ")} do texto colado. Confira antes de continuar.`);
      setStatus("pasted");
      pick(best, extras);
    } catch (e) {
      if ((e as Error).name === "AbortError") return true;
      setStatus("error");
    }
    return true;
  }

  const showCurrent = Boolean(currentLocation || currentLoading) && (!text.trim() || text === value?.title);
  const items = results;

  return (
    <div ref={wrapRef} className="relative">
      <Input
        label={label}
        placeholder={placeholder}
        value={text}
        autoFocus={autoFocus}
        leading={<Icon name={icon} />}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        error={error}
        hint={
          status === "pasted" && pasteNote
            ? pasteNote
            : hint ?? (text.trim() && !value && !open ? "Escolha um endereço da lista." : undefined)
        }
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          const v = e.target.value;
          setText(v);
          setOpen(true);
          setPasteNote(null);
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
          if (!open) return;
          const total = items.length + (showCurrent && currentLocation ? 1 : 0);
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, total - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (showCurrent && currentLocation && highlight === 0) pick(currentLocation);
            else {
              const idx = highlight - (showCurrent && currentLocation ? 1 : 0);
              if (items[idx]) pick(items[idx]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        trailing={
          status === "loading" ? (
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-border-99 border-t-black-99" aria-label="Buscando" />
          ) : text ? (
            <button
              type="button"
              aria-label="Limpar endereço"
              onClick={() => {
                setText("");
                setResults([]);
                setPasteNote(null);
                setStatus("idle");
                onChange(null);
                setOpen(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-99 hover:bg-offwhite-99"
            >
              <Icon name="x" size={16} />
            </button>
          ) : undefined
        }
      />
      {open && (showCurrent || items.length > 0 || status === "error" || (text.trim().length >= 3 && status !== "loading")) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border border-border-99 bg-white py-2 shadow-mid"
        >
          {showCurrent && (
            <li
              role="option"
              aria-selected={highlight === 0}
              aria-disabled={!currentLocation}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => currentLocation && pick(currentLocation)}
              onMouseEnter={() => setHighlight(0)}
              className={cx(
                "flex cursor-pointer items-start gap-3 px-4 py-2.5",
                highlight === 0 && "bg-subtle-99",
                !currentLocation && "cursor-default opacity-70",
              )}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-info-99/10 text-info-99">
                <Icon name="target" size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Usar localização atual</span>
                <span className="block truncate text-[13px] text-muted-99">
                  {currentLoading ? "Obtendo sua posição…" : currentLocation ? `${currentLocation.title} · ${currentLocation.subtitle}` : "Não disponível"}
                </span>
              </span>
            </li>
          )}
          {items.map((p, i) => {
            const idx = i + (showCurrent ? 1 : 0);
            return (
              <li
                key={p.id}
                role="option"
                aria-selected={idx === highlight}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(p)}
                onMouseEnter={() => setHighlight(idx)}
                className={cx("flex cursor-pointer items-start gap-3 px-4 py-2.5", idx === highlight && "bg-subtle-99")}
              >
                <Icon name="pin" className="mt-0.5 shrink-0 text-muted-99" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{p.title}</span>
                  <span className="block truncate text-[13px] text-muted-99">
                    {p.subtitle}
                    {!p.covered ? " · fora da área" : ""}
                  </span>
                </span>
              </li>
            );
          })}
          {status === "error" && (
            <li className="px-4 py-3 text-sm text-orange-99-text">
              Não foi possível buscar agora. Confira a conexão e tente de novo.
            </li>
          )}
          {status === "idle" && items.length === 0 && text.trim().length >= 3 && !showCurrent && (
            <li className="px-4 py-3 text-sm text-muted-99">Nenhum endereço encontrado. Tente rua e número.</li>
          )}
        </ul>
      )}
    </div>
  );
}
