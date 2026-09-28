"use client";

import { useEffect } from "react";
import type { PaymentMethod } from "@/lib/types";
import { PixScreen } from "@/components/payment/PixScreen";
import { paymentLabel } from "@/components/payment/PaymentPicker";
import { formatBRL } from "@/lib/format";

/** Resumo do que está sendo pedido, repetido na espera como no app. */
export interface PaymentSummary {
  origem: string;
  destino: string;
  categoria: string;
  /** Linha pequena ao lado da categoria, como "3,4 km · 12 min". */
  detalhe?: string;
  imagem?: string;
}

interface PaymentFlowProps {
  method: PaymentMethod;
  amount: number;
  orderRef: string;
  /** Texto do que está sendo confirmado: "pedido", "corrida", "entrega". */
  noun: string;
  onConfirmed: () => void;
  onCancel: () => void;
  summary?: PaymentSummary;
}

/**
 * Etapa de pagamento simulada. Pix mostra QR Code e contador; as outras formas
 * exibem um estado de confirmação por cerca de dois segundos e seguem.
 */
export function PaymentFlow({ method, amount, orderRef, noun, onConfirmed, onCancel, summary }: PaymentFlowProps) {
  if (method === "pix") {
    return <PixScreen amount={amount} orderRef={orderRef} onPaid={onConfirmed} onCancel={onCancel} />;
  }
  return <Processing method={method} amount={amount} noun={noun} summary={summary} onDone={onConfirmed} />;
}

function Processing({
  method,
  amount,
  noun,
  summary,
  onDone,
}: {
  method: PaymentMethod;
  amount: number;
  noun: string;
  summary?: PaymentSummary;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 py-10 text-center" aria-live="polite">
      <span
        className="h-12 w-12 animate-spin rounded-full border-4 border-offwhite-99 border-t-yellow-99-deep"
        aria-hidden="true"
      />
      <h2 className="text-[22px] font-semibold">Confirmando {noun}</h2>
      <p className="text-secondary-99">
        {formatBRL(amount)} em {paymentLabel(method).toLowerCase()}.
      </p>
      <p className="text-[13px] text-muted-99">Simulação: nenhuma cobrança é feita.</p>
      {summary && <Resumo s={summary} amount={amount} />}
    </div>
  );
}

function Resumo({ s, amount }: { s: PaymentSummary; amount: number }) {
  return (
    <div className="mt-4 flex w-full flex-col gap-3 rounded-2xl bg-offwhite-99 p-4 text-left">
      <div className="flex items-center gap-3">
        {s.imagem && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.imagem} alt="" className="h-12 w-12 shrink-0 object-contain" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-bold">{s.categoria}</p>
          {s.detalhe && <p className="text-[14px] text-secondary-99">{s.detalhe}</p>}
        </div>
        <p className="text-[17px] font-bold tabular-nums">{formatBRL(amount)}</p>
      </div>
      <div className="flex flex-col gap-2 border-t border-border-99 pt-3 text-[15px]">
        <p className="flex items-center gap-3">
          <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full border-[3px] border-success-99 bg-white" />
          <span className="truncate">{s.origem}</span>
        </p>
        <p className="flex items-center gap-3">
          <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full border-[3px] border-orange-99 bg-white" />
          <span className="truncate">{s.destino}</span>
        </p>
      </div>
    </div>
  );
}
