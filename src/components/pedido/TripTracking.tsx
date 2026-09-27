"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { DeliveryOrder, FoodOrder, RideOrder } from "@/lib/types";
import { STAGE_DURATION_MS } from "@/lib/stages";
import type { LatLng } from "@/lib/geo";
import { formatBRL } from "@/lib/format";
import { deliveryCategories } from "@/data/rides";
import { MapPanelLayout } from "@/components/layout/MapPanelLayout";
import { MapView } from "@/components/map/MapView";
import { VehicleArt, type VehicleCategory } from "@/components/ui/VehicleArt";
import { Button, LinkButton } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { PaymentIcon } from "@/components/payment/PaymentIcon";
import { paymentLabel } from "@/components/payment/PaymentPicker";
import { cx } from "@/lib/cx";

type TripOrder = RideOrder | DeliveryOrder | FoodOrder;

/** A busca ocupa o primeiro estágio, dividida nas três telas do app. */
const SEARCH_STEPS = 3;
/** Janela sem taxa de cancelamento depois que o motorista aceita. */
const FREE_CANCEL_S = 120;

const searchCopy = {
  corrida: [
    { title: "Confirmando seu destino", sub: "Solicitando sua corrida" },
    { title: "Sua corrida foi solicitada", sub: "Solicitando sua corrida" },
    { title: "2 motoristas visualizando a solicitação", sub: "Encontrando um motorista para você" },
  ],
  entrega: [
    { title: "Confirmando sua entrega", sub: "Solicitando sua entrega" },
    { title: "Sua entrega foi solicitada", sub: "Solicitando sua entrega" },
    { title: "2 entregadores visualizando a solicitação", sub: "Encontrando um entregador para você" },
  ],
} as const;

const reasons = {
  corrida: [
    { icon: "moodFill" as IconName, title: "Motivos pessoais", items: ["Outro carro chegou mais rápido", "Mudei o embarque/desembarque", "Preciso alterar meu método de pagamento"] },
    { icon: "sadFill" as IconName, title: "Motorista", items: ["Motorista pediu para cancelar", "Motorista está demorando", "Motorista está indo na direção oposta"] },
  ],
  entrega: [
    { icon: "moodFill" as IconName, title: "Motivos pessoais", items: ["Não preciso mais enviar", "Mudei o endereço de coleta ou entrega", "Preciso alterar meu método de pagamento"] },
    { icon: "sadFill" as IconName, title: "Entregador", items: ["Entregador pediu para cancelar", "Entregador está demorando", "Entregador está indo na direção oposta"] },
  ],
  comida: [
    { icon: "moodFill" as IconName, title: "Motivos pessoais", items: ["Pedi por engano", "Quero mudar os itens do pedido", "Quero mudar o endereço de entrega"] },
    { icon: "sadFill" as IconName, title: "Loja", items: ["A loja está demorando para confirmar", "O prazo de entrega aumentou"] },
  ],
};

/** PIN de 4 dígitos estável para o pedido, derivado do id. */
function pinFor(id: string): string {
  let h = 7;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9000;
  return String(1000 + h);
}

function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function Avatar({ name, size = 48, className, tint = "#F2F3F5" }: { name: string; size?: number; className?: string; tint?: string }) {
  return (
    <span
      className={cx("flex shrink-0 items-center justify-center rounded-full font-bold text-black-99 ring-2 ring-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.34, background: tint }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/** Ícone do app para "confirmando o destino": origem e destino ligados por uma rota. */
function RouteBadge() {
  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-offwhite-99" aria-hidden="true">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M9 22h6v8h12V14" stroke="#9FB0C4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="22" r="4" fill="#fff" stroke="#F1B500" strokeWidth="3" />
        <path d="M27 4a7 7 0 0 1 7 7c0 5-7 11-7 11s-7-6-7-11a7 7 0 0 1 7-7Z" fill="#FC7A2C" />
        <circle cx="27" cy="11" r="2.6" fill="#fff" />
      </svg>
    </span>
  );
}

function Card({ children, className, tone = "white" }: { children: ReactNode; className?: string; tone?: "white" | "success" }) {
  return <section className={cx("rounded-3xl p-5", tone === "success" ? "bg-success-99-bg" : "bg-white", className)}>{children}</section>;
}

export function TripTracking({ order, route }: { order: TripOrder; route?: LatLng[] }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const isRide = order.vertical === "corrida";
  const isFood = order.vertical === "comida";
  // Corrida e entrega começam procurando quem aceite; no Food a loja confirma direto.
  const hasSearch = !isFood;
  // Estágio em que o motorista ou o entregador aparece.
  const courierStage = isFood ? 2 : 1;
  const [stage, setStage] = useState(0);
  const [step, setStep] = useState(0);
  const [cancel, setCancel] = useState<null | "retain" | "reasons" | "done">(null);
  const [freeLeft, setFreeLeft] = useState(FREE_CANCEL_S);
  const [toast, setToast] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const last = order.stages.length - 1;
  const cancelled = cancel === "done";
  const finished = stage >= last && !cancelled;
  const current = order.stages[stage];
  const searching = hasSearch && stage === 0 && !cancelled;

  // Estágios avançam sozinhos; a busca troca de tela a cada terço do primeiro.
  useEffect(() => {
    if (finished || cancelled || cancel) return;
    if (hasSearch && stage === 0 && step < SEARCH_STEPS - 1) {
      const t = setTimeout(() => setStep((s) => s + 1), STAGE_DURATION_MS / SEARCH_STEPS);
      return () => clearTimeout(t);
    }
    const wait = hasSearch && stage === 0 ? STAGE_DURATION_MS / SEARCH_STEPS : STAGE_DURATION_MS;
    const t = setTimeout(() => setStage((s) => Math.min(s + 1, last)), wait);
    return () => clearTimeout(t);
  }, [stage, step, finished, cancelled, cancel, last, hasSearch]);

  // Motorista ou entregador a caminho: aviso no topo do mapa e começa a contagem sem taxa.
  const [announced, setAnnounced] = useState(false);
  if (stage === courierStage && !announced) {
    setAnnounced(true);
    setFreeLeft(FREE_CANCEL_S);
    setToast(
      isFood
        ? `${order.courier.name.split(" ")[0]} saiu com o seu pedido`
        : isRide
          ? "O motorista está a cerca de 500 m do ponto de embarque"
          : "O entregador está a cerca de 500 m do ponto de coleta",
    );
  }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (isFood || stage !== 1 || cancelled || freeLeft <= 0) return;
    const t = setTimeout(() => setFreeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, cancelled, freeLeft, isFood]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  const person =
    order.vertical === "corrida"
      ? { name: order.driver.name, rating: order.driver.rating, model: `${order.driver.vehicle} · ${order.driver.color}`, plate: order.driver.plate, meta: `${order.driver.trips.toLocaleString("pt-BR")}+ corridas` }
      : order.vertical === "entrega"
        ? { name: order.courier.name, rating: order.courier.rating, model: order.courier.vehicle, plate: order.courier.plate, meta: "Entregador parceiro" }
        : { name: order.courier.name, rating: order.courier.rating, model: order.courier.vehicle, plate: undefined, meta: "Entregador parceiro" };
  const firstName = person.name.split(" ")[0];
  const categoryLabel =
    order.vertical === "corrida"
      ? order.categoryName
      : order.vertical === "entrega"
        ? (deliveryCategories.find((c) => c.id === order.size)?.name ?? "Entrega")
        : "Entregador 99";
  const vehicle: VehicleCategory =
    order.vertical === "corrida" ? order.category : order.vertical === "entrega" ? (order.size === "carro" ? "entrega-carro" : "entrega-moto") : "moto";
  const pin = useMemo(() => pinFor(order.id), [order.id]);
  const copy = order.vertical === "comida" ? searchCopy.corrida[0] : searchCopy[order.vertical][step];
  const noun = isRide ? "corrida" : isFood ? "pedido" : "entrega";

  function restart() {
    setStage(0);
    setStep(0);
    setCancel(null);
    setAnnounced(false);
    setFreeLeft(FREE_CANCEL_S);
  }

  async function shareRoute() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Acompanhe minha ${noun}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setNotice("Link da rota copiado");
    } catch {
      // Compartilhamento cancelado.
    }
  }

  const priceBox = (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-offwhite-99 px-5 py-4">
      <span className="text-[18px] font-bold tabular-nums">{formatBRL(order.total)}</span>
      <span className="flex items-center gap-2 text-[15px] font-semibold">
        <PaymentIcon name={order.payment === "pix" ? "pix" : order.payment === "dinheiro" ? "cash" : order.payment === "vale" ? "ticket" : "card"} size={22} />
        {order.payment === "cartao" ? "4321" : paymentLabel(order.payment)}
      </span>
    </div>
  );

  const routeRows = (
    <div className="relative mt-4 flex flex-col gap-4 pl-1">
      <span aria-hidden="true" className="absolute bottom-3 left-[9px] top-3 w-0.5 bg-border-99" />
      {[
        { color: "bg-success-99 ring-success-99/25", label: order.origin.label },
        { color: "bg-orange-99 ring-orange-99/20", label: order.destination.label },
      ].map((p) => (
        <p key={p.label} className="relative flex items-center gap-3 text-[16px]">
          <span className={cx("h-3 w-3 shrink-0 rounded-full ring-4", p.color)} aria-hidden="true" />
          <span className="truncate">{p.label}</span>
        </p>
      ))}
    </div>
  );

  const searchPanel = (
    <div className="flex flex-col gap-4">
      <Card className="p-0">
        {/* Quatro traços no topo: cada tela da busca preenche um, o atual enche devagar. */}
        <div className="flex gap-2 px-5 pt-5" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-offwhite-99">
              {i < step ? (
                <span className="block h-full w-full bg-[#9AA3AE]" />
              ) : i === step ? (
                <motion.span
                  key={`${step}-${i}`}
                  className="block h-full bg-[#9AA3AE]"
                  initial={{ width: reduce ? "100%" : "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: reduce ? 0 : STAGE_DURATION_MS / SEARCH_STEPS / 1000, ease: "linear" }}
                />
              ) : null}
            </span>
          ))}
        </div>
        <div className="flex items-start gap-4 px-5 pb-5 pt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="min-w-0 flex-1"
              aria-live="polite"
            >
              <h1 className="text-[22px] font-bold leading-tight min-[400px]:text-[24px]">{copy.title}</h1>
              <p className="mt-1 text-[15px]">{copy.sub}</p>
            </motion.div>
          </AnimatePresence>
          {step < 2 ? (
            <RouteBadge />
          ) : (
            <span className="flex shrink-0 -space-x-4">
              {/* O primeiro fica na frente, como as fotos empilhadas do app. */}
              <Avatar name={isRide ? "Rafael Souza" : "Bruno Lima"} size={56} className="relative z-10" tint="#F3E3CF" />
              <Avatar name={isRide ? "Jorge Alves" : "Tiago Reis"} size={56} tint="#DCE7F3" />
            </span>
          )}
        </div>
        <div className="border-t border-border-99 px-5 py-5">
          <p className="text-[16px] text-secondary-99">
            {isRide ? "Encontraremos o motorista mais indicado dos tipos de corrida abaixo" : "Encontraremos o entregador mais indicado para o veículo abaixo"}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-offwhite-99">
              <VehicleArt category={vehicle} width={36} />
            </span>
            <span className="flex-1 text-[17px]">{categoryLabel}</span>
            <span className="text-[17px] tabular-nums">{formatBRL(order.total)}</span>
          </div>
        </div>
      </Card>
      <Card>
        {priceBox}
        {routeRows}
      </Card>
      <Button variant="ghost" size="lg" full className="rounded-3xl border-0 text-alert-99" onClick={() => setCancel("done")}>
        Cancelar solicitação
      </Button>
    </div>
  );

  const heading =
    stage === 1 && !isFood ? (isRide ? "Embarque em 4 min" : "Coleta em 4 min") : `${current.title} · ${current.etaLabel}`;
  const optionsTitle = isFood ? "Opções do pedido" : `Opções da ${noun}`;

  // Food: janela de entrega como o cartão do app, "22:52-23:07", fixa na previsão inicial.
  const etaWindow = useMemo(() => {
    const m = order.stages[0].etaLabel.match(/(\d+)\D+(\d+)/);
    const [a, b] = m ? [Number(m[1]), Number(m[2])] : [30, 40];
    const at = (min: number) => new Date(order.createdAt + min * 60_000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${at(a)}-${at(b)}`;
  }, [order.createdAt, order.stages]);

  const foodStatus = isFood && (
    <Card>
      <p className="text-[16px] text-secondary-99">Previsão de entrega</p>
      <p className="mt-1 text-[30px] font-extrabold leading-tight tabular-nums">{etaWindow}</p>
      <p className="mt-2 text-[17px]" aria-live="polite">
        {stage === 0 ? "A loja confirmou seu pedido" : stage === 1 ? "Preparando seu pedido" : current.title}
      </p>
      {/* Três traços amarelos: confirmado, em preparo, a caminho. O atual enche devagar. */}
      <div className="mt-5 flex gap-2" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-offwhite-99">
            {i < stage ? (
              <span className="block h-full w-full bg-yellow-99" />
            ) : i === stage ? (
              <motion.span
                key={`${stage}-${i}`}
                className="block h-full bg-yellow-99"
                initial={{ width: reduce ? "60%" : "8%" }}
                animate={{ width: "60%" }}
                transition={{ duration: reduce ? 0 : STAGE_DURATION_MS / 1000, ease: "linear" }}
              />
            ) : null}
          </span>
        ))}
      </div>
      {order.vertical === "comida" && (
        <div className="mt-5 flex items-center gap-3">
          <Avatar name={order.restaurantName} size={36} tint="#FFF3C4" className="ring-0" />
          <span className="min-w-0 flex-1 truncate text-[17px]">{order.restaurantName}</span>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-offwhite-99 px-3 py-1 text-[17px] font-bold tabular-nums" title="Código do pedido">
            <Icon name="boxLine" size={16} />
            {pin}
          </span>
        </div>
      )}
    </Card>
  );

  const personCard = (
    <Card className="p-0">
      {person.plate ? (
        <div className="flex items-center gap-3 px-5 pt-5">
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-offwhite-99 px-3 py-0.5 text-[14px] font-bold">{categoryLabel}</span>
            <p className="mt-2 text-[28px] font-extrabold tracking-wide">{person.plate}</p>
            <p className="truncate text-[16px]">{person.model}</p>
          </div>
          <VehicleArt category={vehicle} width={112} />
        </div>
      ) : (
        <div className="flex items-center gap-3 px-5 pt-5">
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-offwhite-99 px-3 py-0.5 text-[14px] font-bold">{categoryLabel}</span>
            <p className="mt-2 truncate text-[20px] font-bold">{person.model}</p>
          </div>
          <VehicleArt category={vehicle} width={88} />
        </div>
      )}
      <div className="mt-4 flex items-center gap-3 border-t border-border-99 px-5 py-4">
        <Avatar name={person.name} size={52} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[18px] font-bold">
            <span className="truncate">{firstName}</span>
            <Icon name="chevronRight" size={20} className="shrink-0" />
          </p>
          <p className="flex min-w-0 items-center gap-1 text-[14px] min-[400px]:text-[15px]">
            <Icon name="starFill" size={15} className="shrink-0" />
            <span className="truncate">
              {person.rating.toFixed(1).replace(".", ",")} · {person.meta}
            </span>
          </p>
        </div>
        <button
          type="button"
          aria-label={`Mensagem para ${firstName}`}
          onClick={() => setNotice("Chat indisponível na demonstração")}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-offwhite-99 transition-colors hover:bg-border-99"
        >
          <Icon name="chatFill" size={22} />
          <span aria-hidden="true" className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-alert-99 ring-2 ring-white" />
        </button>
        <button
          type="button"
          aria-label={`Ligar para ${firstName}`}
          onClick={() => setNotice("Ligação indisponível na demonstração")}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-offwhite-99 transition-colors hover:bg-border-99"
        >
          <Icon name="phoneFill" size={22} />
        </button>
      </div>
    </Card>
  );

  const codeCard = (
    <Card className="flex items-center justify-between gap-4 py-6">
      <p className="flex items-center gap-2 text-[18px] font-bold">
        {isRide ? "PIN desta corrida" : isFood ? "Código de entrega" : "Código da coleta"}
        <Icon name="info" size={18} className="text-placeholder-99" />
      </p>
      <span className="text-[40px] font-bold leading-none tracking-wider text-info-99 tabular-nums">{pin}</span>
    </Card>
  );

  const summaryCard = (
    <Card>
      {priceBox}
      {order.vertical === "comida" && (
        <ul className="mt-4 flex flex-col gap-1.5 text-[15px]" role="list">
          {order.lines.map((l) => (
            <li key={l.lineId} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">
                {l.quantity}× {l.name}
              </span>
              <span className="shrink-0 tabular-nums text-secondary-99">{formatBRL(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">{routeRows}</div>
        {/* Encerrado não se edita mais: o lápis some. */}
        {!finished && !cancelled && (
          <button
            type="button"
            aria-label="Alterar endereço"
            onClick={() => setNotice(`Para mudar o endereço, cancele e faça ${isFood ? "o pedido" : `a ${noun}`} de novo`)}
            className="mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-offwhite-99 transition-colors hover:bg-border-99"
          >
            <Icon name="editFill" size={20} />
          </button>
        )}
      </div>
    </Card>
  );

  const optionsCard = (
    <Card className="pb-2">
      <h2 className="text-[20px] font-bold">{optionsTitle}</h2>
      <ul className="mt-2" role="list">
        {[
          { icon: "navigateFill" as IconName, tint: "bg-[#35B6F5]", label: isFood ? "Compartilhar pedido" : "Compartilhar rota", onClick: shareRoute },
          { icon: "helpFill" as IconName, tint: "bg-[#1B2A7A]", label: "Ir para Central de Ajuda", onClick: () => setHelpOpen(true) },
          ...(isFood ? [] : [{ icon: "phoneFill" as IconName, tint: "bg-[#F4456B]", label: "Ligar 190", href: "tel:190" }]),
        ].map((o) => {
          const inner = (
            <>
              <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white", o.tint)}>
                <Icon name={o.icon} size={22} />
              </span>
              <span className="flex-1 text-[17px] font-semibold">{o.label}</span>
              <Icon name="chevronRight" size={20} className="text-placeholder-99" />
            </>
          );
          const cls = "flex w-full items-center gap-4 py-3 text-left";
          return (
            <li key={o.label} className="border-b border-border-99 last:border-b-0">
              {"href" in o ? (
                <a href={o.href} className={cls}>
                  {inner}
                </a>
              ) : (
                <button type="button" onClick={o.onClick} className={cls}>
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );

  const cancelButton = (
    <button
      type="button"
      // No Food ainda não há entregador para segurar o pedido: vai direto aos motivos.
      onClick={() => setCancel(isFood ? "reasons" : "retain")}
      className="rounded-3xl bg-white py-5 text-[17px] font-semibold text-alert-99 transition-colors hover:bg-offwhite-99"
    >
      Cancelar {noun}
    </button>
  );

  const foundPanel = (
    <div className="flex flex-col gap-4">
      {stage === 1 && !isFood && (
        <p className="text-center text-[15px]">
          Taxa de Cancelamento será aplicada se cancelar após
          <br />
          <span className="font-semibold tabular-nums text-orange-99">
            {String(Math.floor(freeLeft / 60)).padStart(2, "0")}:{String(freeLeft % 60).padStart(2, "0")}
          </span>
        </p>
      )}
      {isFood ? (
        foodStatus
      ) : (
        <h1 className="text-center text-[20px] font-bold" aria-live="polite">
          {heading}
        </h1>
      )}
      {stage >= courierStage && personCard}
      {((!isFood && stage === 1) || (isFood && stage >= courierStage)) && codeCard}
      {summaryCard}
      {optionsCard}
      {((!isFood && stage === 1) || (isFood && stage === 0)) && cancelButton}
    </div>
  );

  const endPanel = (
    <div className="flex flex-col gap-4">
      <Card tone={cancelled ? "white" : "success"}>
        <h1 className="text-[22px] font-bold">
          {cancelled
            ? `${isRide ? "Corrida cancelada" : isFood ? "Pedido cancelado" : "Entrega cancelada"}`
            : isRide
              ? "Corrida finalizada"
              : isFood
                ? "Pedido entregue"
                : "Pacote entregue"}
        </h1>
        <p className="mt-1 text-[15px] text-secondary-99">
          {cancelled
            ? !isFood && stage === 1 && freeLeft <= 0
              ? "Passou do prazo gratuito: no app seria cobrada a taxa de cancelamento. Aqui nada é cobrado."
              : "Nenhum valor foi cobrado."
            : isRide
              ? "Obrigado por viajar com a 99. O valor foi cobrado na forma escolhida."
              : isFood
                ? "Bom apetite. Obrigado por pedir pelo 99Food."
                : "O destinatário confirmou o recebimento com o código."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={`/${order.vertical}`} size="sm">
            {isRide ? "Nova corrida" : isFood ? "Pedir de novo" : "Nova entrega"}
          </LinkButton>
          <LinkButton href="/" size="sm" variant="ghost">
            Início
          </LinkButton>
        </div>
      </Card>
      {summaryCard}
    </div>
  );

  const panel = (
    <div className="flex flex-col gap-4">
      {cancelled || finished ? endPanel : searching ? searchPanel : foundPanel}
      <div className="flex items-center justify-between gap-3 px-1 pt-2 text-[13px] text-muted-99">
        <span>
          Demonstração · etapa {stage + 1} de {last + 1}
        </span>
        <div className="flex gap-1">
          <Button variant="text" size="sm" onClick={restart} className="h-8 px-3 text-[13px]" aria-label="Reiniciar acompanhamento">
            <Icon name="refresh" size={14} />
            Reiniciar
          </Button>
          <Button
            variant="text"
            size="sm"
            onClick={() => {
              if (hasSearch && stage === 0 && step < SEARCH_STEPS - 1) setStep((s) => s + 1);
              else setStage((s) => Math.min(s + 1, last));
            }}
            disabled={finished || cancelled || Boolean(cancel)}
            className="h-8 px-3 text-[13px]"
            aria-label="Avançar etapa"
          >
            <Icon name="skipForward" size={14} />
            Avançar
          </Button>
        </div>
      </div>
    </div>
  );

  const map = (
    <div className="relative h-full w-full">
      <MapView
        origin={order.origin}
        destination={order.destination}
        route={route}
        progress={!searching && !cancelled ? current.progress : undefined}
        vehicle={vehicle}
        searching={searching && step < 2}
        routeMuted={searching && step === 0}
        lookingAround={searching && step === 2}
        accent="orange"
      />
      {/* Aviso escuro no topo quando o motorista aceita, como a notificação do app. */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={reduce ? false : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-x-4 top-20 z-[5] flex items-center gap-3 rounded-[28px] bg-[#3A3B3E] px-4 py-3 text-white shadow-high lg:left-1/2 lg:right-auto lg:top-6 lg:w-[420px] lg:-translate-x-1/2"
          >
            <Avatar name={person.name} size={44} className="ring-0" />
            <span className="min-w-0">
              <span className="block text-[13px] text-white/60">Aviso</span>
              <span className="block truncate text-[15px]">{toast}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <MapPanelLayout onBack={() => router.push("/")} map={map} panel={panel} tone="subtle" />

      {/* Motivo do cancelamento, com a folha que tenta segurar a corrida por cima. */}
      <Modal open={cancel === "retain" || cancel === "reasons"} onClose={() => setCancel(null)} title="Informe o motivo do cancelamento" width="sm" bare>
        <div className="relative flex min-h-0 flex-1 flex-col md:min-h-[640px]">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4 md:px-6">
            <button
              type="button"
              onClick={() => setCancel(null)}
              aria-label="Voltar"
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-offwhite-99"
            >
              <Icon name="arrowLeft" size={26} />
            </button>
            <p className="mt-4 text-[28px] font-bold leading-tight">Informe o motivo do cancelamento</p>
            <div className="mt-5 flex flex-col gap-3">
              {reasons[order.vertical].map((g) => (
                <div key={g.title} className="rounded-3xl bg-offwhite-99 px-5 py-4">
                  <p className="flex items-center gap-3 text-[18px] font-bold">
                    <Icon name={g.icon} size={24} />
                    {g.title}
                  </p>
                  <ul className="mt-2" role="list">
                    {g.items.map((r) => (
                      <li key={r} className="border-b border-border-99 last:border-b-0">
                        <button type="button" onClick={() => setCancel("done")} className="w-full py-3 text-left text-[16px] hover:underline">
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {cancel === "retain" && (
              <>
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 bg-black/45"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.div
                  className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-5 pb-6 pt-7"
                  initial={reduce ? false : { y: "100%" }}
                  animate={{ y: 0 }}
                  exit={reduce ? { opacity: 0 } : { y: "100%" }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  <p className="text-[26px] font-bold leading-tight">
                    {firstName} está a apenas <span className="text-orange-99">0,4 km</span> e deve chegar em{" "}
                    <span className="text-orange-99">1 min</span>
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <Avatar name={person.name} size={56} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[19px] font-bold">{firstName}</p>
                      <p className="flex items-center gap-1 text-[15px]">
                        {person.rating.toFixed(2)} <Icon name="starFill" size={15} />
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Ligar para ${firstName}`}
                      onClick={() => setNotice("Ligação indisponível na demonstração")}
                      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-offwhite-99"
                    >
                      <Icon name="phone" size={26} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotice(`Para mudar o endereço, cancele e peça a ${noun} de novo`)}
                    className="mt-6 flex w-full items-center justify-between py-2 text-[17px] text-secondary-99"
                  >
                    Não é aqui?
                    <span className="flex items-center gap-1">
                      Modificar <Icon name="chevronRight" size={20} />
                    </span>
                  </button>
                  <Button size="lg" full className="mt-5 rounded-2xl text-[19px]" onClick={() => setCancel(null)}>
                    Esperar
                  </Button>
                  <Button variant="icon" size="lg" className="mt-3 h-14 w-full rounded-2xl text-[19px] font-bold" onClick={() => setCancel("reasons")}>
                    Cancelar
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Central de Ajuda" width="sm">
        <p className="text-[15px] text-secondary-99">
          No app, aqui abre o atendimento da {noun}, com perguntas frequentes e contato com o suporte. Neste conceito não há
          atendimento real.
        </p>
      </Modal>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-8 z-[60] flex justify-center px-4">
        <AnimatePresence>
          {notice && (
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="rounded-full bg-black-99 px-4 py-2 text-sm font-bold text-white shadow-high"
            >
              {notice}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
