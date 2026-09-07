"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Restaurant } from "@/lib/types";
import { ratingSummary, weeklyHours, type Review } from "@/data/reviews";
import { formatBRL } from "@/lib/format";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { MapView } from "@/components/map/MapView";
import { PaymentIcon } from "@/components/payment/PaymentIcon";
import { cx } from "@/lib/cx";

export type Aba = "informacoes" | "avaliacoes";
type Filtro = "todas" | "recentes" | "fotos" | "positivas" | "negativas";

const ONLINE: { nome: string; icone: "pix" | "card" | "ticket" }[] = [
  { nome: "Pix", icone: "pix" },
  { nome: "Cartão de crédito", icone: "card" },
  { nome: "Cartão de débito", icone: "card" },
  { nome: "Vale-refeição", icone: "ticket" },
];

function Estrelas({ nota, size = 14 }: { nota: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${nota} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon
          key={i}
          name="starFill"
          size={size}
          className={i <= nota ? "text-black-99" : "text-border-99"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function Avaliacao({ a }: { a: Review }) {
  return (
    <li className="flex flex-col gap-2 border-t border-border-99 pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-offwhite-99 text-[15px] font-bold"
          aria-hidden="true"
        >
          {a.autor.charAt(0)}
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{a.autor}</span>
        <span className="shrink-0 text-[13px] text-muted-99">{a.data}</span>
      </div>
      <Estrelas nota={a.estrelas} size={16} />
      <p className="text-[15px] text-black-99">{a.texto}</p>
      {a.foto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.foto} alt="" className="h-40 w-40 rounded-xl object-cover" loading="lazy" decoding="async" />
      )}
    </li>
  );
}

/**
 * Ficha da loja, com as duas abas do app: informações de funcionamento,
 * pagamento, endereço e mínimo; e as avaliações, com resumo por nota e
 * filtros. Avaliações e formas de pagamento são de demonstração.
 */
export function StoreInfoModal({
  restaurant,
  aba,
  onAba,
  open,
  onClose,
}: {
  restaurant: Restaurant;
  aba: Aba;
  onAba: (a: Aba) => void;
  open: boolean;
  onClose: () => void;
}) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [horarios, setHorarios] = useState(false);
  const reduce = useReducedMotion();
  const semana = useMemo(() => weeklyHours(restaurant), [restaurant]);
  // O modal só monta depois do clique, então a data do navegador não conflita.
  const hoje = new Date().getDay();
  const resumo = useMemo(() => ratingSummary(restaurant), [restaurant]);

  const lista = useMemo(() => {
    const todas = resumo.avaliacoes;
    if (filtro === "fotos") return todas.filter((a) => a.foto);
    if (filtro === "positivas") return todas.filter((a) => a.estrelas >= 4);
    if (filtro === "negativas") return todas.filter((a) => a.estrelas <= 2);
    return todas;
  }, [filtro, resumo.avaliacoes]);

  const filtros: { id: Filtro; rotulo: string }[] = [
    { id: "todas", rotulo: "Todas" },
    { id: "recentes", rotulo: "Recentes" },
    { id: "fotos", rotulo: `Com fotos (${resumo.comFoto})` },
    { id: "positivas", rotulo: `Positivas (${resumo.positivas})` },
    { id: "negativas", rotulo: `Negativas (${resumo.negativas})` },
  ];

  return (
    <Modal open={open} onClose={onClose} title={restaurant.name} width="md">
      <div className="flex flex-col gap-5">
        <div className="flex gap-6 border-b border-border-99" role="tablist" aria-label="Informações ou avaliações">
          {(["informacoes", "avaliacoes"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={aba === t}
              onClick={() => onAba(t)}
              className={cx(
                "relative -mb-px pb-2 text-[17px] font-bold transition-colors duration-150",
                aba === t ? "text-black-99" : "text-secondary-99 hover:text-black-99",
              )}
            >
              {t === "informacoes" ? "Informações" : "Avaliações"}
              {aba === t && (
                <motion.span
                  layoutId={reduce ? undefined : "aba-loja"}
                  transition={{ duration: reduce ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-x-0 -bottom-px h-1 rounded-full bg-yellow-99"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>

        {aba === "informacoes" ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3">
              <Icon name="clock" size={22} className="mt-0.5 shrink-0 text-black-99" />
              <div className="flex min-w-0 flex-1 flex-col">
                <button
                  type="button"
                  onClick={() => setHorarios((v) => !v)}
                  aria-expanded={horarios}
                  className="flex w-full items-center gap-2 text-left"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[17px] font-bold">{restaurant.open ? "Aberta agora" : "Fechada"}</span>
                    <span className="text-[15px] text-secondary-99">
                      {restaurant.open
                        ? `Entrega em ${restaurant.etaMin}–${restaurant.etaMax} min`
                        : `Abre às ${restaurant.opensAt}`}
                    </span>
                  </span>
                  <Icon
                    name="chevronDown"
                    size={22}
                    className={cx(
                      "shrink-0 text-black-99 transition-[rotate] duration-200 ease-[cubic-bezier(0.33,0,0.2,1)]",
                      horarios && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {horarios && (
                    <motion.ul
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.24, ease: [0.33, 0, 0.2, 1] }}
                      className="overflow-hidden"
                      role="list"
                    >
                      {semana.map((d, i) => (
                        <li key={d.dia} className={cx("flex flex-col pt-3", i === hoje && "text-orange-99-text")}>
                          <span className="text-[15px] font-bold">
                            {d.dia}
                            {i === hoje ? " (hoje)" : ""}
                          </span>
                          <span className={cx("text-[15px]", i === hoje ? "" : "text-secondary-99")}>{d.janela}</span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="card" size={22} className="mt-0.5 shrink-0 text-black-99" />
              <div className="flex min-w-0 flex-col gap-2">
                <p className="text-[17px] font-bold">Formas de pagamento</p>
                <p className="text-[13px] text-secondary-99">Online pelo app</p>
                <ul className="flex flex-wrap gap-2" role="list">
                  {ONLINE.map((p) => (
                    <li
                      key={p.nome}
                      className="flex items-center gap-1.5 rounded-lg bg-offwhite-99 px-2.5 py-1.5 text-[13px] font-semibold"
                    >
                      <PaymentIcon name={p.icone} size={18} />
                      {p.nome}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-[13px] text-secondary-99">Na entrega</p>
                <ul className="flex flex-wrap gap-2" role="list">
                  <li className="flex items-center gap-1.5 rounded-lg bg-offwhite-99 px-2.5 py-1.5 text-[13px] font-semibold">
                    <PaymentIcon name="cash" size={18} />
                    Dinheiro
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="pin" size={22} className="mt-0.5 shrink-0 text-black-99" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <p className="text-[17px] font-bold">Endereço</p>
                <p className="text-[15px] text-secondary-99">{restaurant.address}</p>
                <div className="h-40 overflow-hidden rounded-xl border border-border-99">
                  <MapView
                    center={restaurant.location}
                    destination={{ ...restaurant.location, label: restaurant.name }}
                    zoom={15}
                    interactive={false}
                    attribution={false}
                  />
                </div>
                <p className="text-[13px] text-muted-99">{restaurant.distanceKm} km de você</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="moto" size={22} className="mt-0.5 shrink-0 text-black-99" />
              <div className="flex min-w-0 flex-col">
                <p className="text-[17px] font-bold">{restaurant.deliveredBy}</p>
                <p className="text-[15px] text-secondary-99">
                  {restaurant.deliveredBy === "Entrega pela loja"
                    ? "A entrega é feita pela própria loja, e o acompanhamento em tempo real não fica disponível."
                    : "Entrega feita por quem trabalha com a 99, com acompanhamento em tempo real."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Icon name="cash" size={22} className="mt-0.5 shrink-0 text-black-99" />
              <div className="flex min-w-0 flex-col">
                <p className="text-[17px] font-bold">Mínimo</p>
                <p className="text-[15px] text-secondary-99">
                  O valor mínimo desta loja é {formatBRL(restaurant.minOrder)}.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-6 rounded-2xl bg-offwhite-99 p-5">
              <div className="flex flex-col items-center gap-1">
                <p className="flex items-center gap-1 text-[40px] font-bold leading-none">
                  {resumo.media.toFixed(1)}
                  <Icon name="starFill" size={24} className="text-black-99" />
                </p>
                <p className="text-[13px] text-secondary-99">{resumo.total.toLocaleString("pt-BR")} avaliações</p>
              </div>
              <ul className="flex min-w-0 flex-1 flex-col gap-1.5" role="list">
                {resumo.barras.map((qtd, i) => {
                  const nota = 5 - i;
                  const pct = Math.round((qtd / resumo.total) * 100);
                  return (
                    <li key={nota} className="flex items-center gap-2">
                      <span className="flex w-16 shrink-0 justify-end">
                        <Estrelas nota={nota} size={10} />
                      </span>
                      <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-border-99">
                        <span className="block h-full rounded-full bg-black-99" style={{ width: `${pct}%` }} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="scroll-rail flex gap-2 overflow-x-auto pb-1">
              {filtros.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filtro === f.id}
                  onClick={() => setFiltro(f.id)}
                  className={cx(
                    "flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold transition-colors duration-150",
                    filtro === f.id ? "bg-yellow-99 text-black-99" : "bg-offwhite-99 text-black-99 hover:bg-border-99",
                  )}
                >
                  {f.id === "fotos" && <Icon name="camera" size={15} aria-hidden="true" />}
                  {f.rotulo}
                </button>
              ))}
            </div>

            {lista.length > 0 ? (
              <ul className="flex flex-col gap-4" role="list">
                {lista.map((a) => (
                  <Avaliacao key={a.id} a={a} />
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-offwhite-99 p-5 text-[15px] text-secondary-99">
                Nenhuma avaliação com esse filtro.
              </p>
            )}

            <p className="text-[13px] text-muted-99">
              Protótipo: as avaliações são de demonstração e não vêm de clientes reais.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
