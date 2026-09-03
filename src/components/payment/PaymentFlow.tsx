"use client";

import { useEffect } from "react";
import type { PaymentMethod } from "@/lib/types";
import { PixScreen } from "@/components/payment/PixScreen";
import { paymentLabel } from "@/components/payment/PaymentPicker";
import { formatBRL } from "@/lib/format";

interface PaymentFlowProps {
  method: PaymentMethod;
  amount: number;
  orderRef: string;
  /** Texto do que está sendo confirmado: "pedido", "corrida", "entrega". */
  noun: string;
  onConfirmed: () => void;
  onCancel: () => void;
}

/**
 * Etapa de pagamento simulada. Pix mostra QR Code e contador; as outras formas
 * exibem um estado de confirmação por cerca de dois segundos e seguem.
 */
export function PaymentFlow({ method, amount, orderRef, noun, onConfirmed, onCancel }: PaymentFlowProps) {
  if (method === "pix") {
    return <PixScreen amount={amount} orderRef={orderRef} onPaid={onConfirmed} onCancel={onCancel} />;
  }
  return <Processing method={method} amount={amount} noun={noun} onDone={onConfirmed} />;
}

function Processing({
  method,
  amount,
  noun,
  onDone,
}: {
  method: PaymentMethod;
  amount: number;
  noun: string;
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
    </div>
  );
}
