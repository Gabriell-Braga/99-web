"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";

const REGRAS: { atraso: string; cupom: string }[] = [
  { atraso: "15 a 30 minutos", cupom: "Cupom de R$ 10 OFF" },
  { atraso: "30 minutos ou mais", cupom: "Cupom de R$ 30 OFF" },
];

/**
 * Fileira montada na borda de cima da folha branca, metade sobre o amarelo,
 * como no app. "Entrega grátis" é só um selo; "No Horário" abre a explicação.
 */
export function FilterChips() {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <div className="scroll-rail flex items-center gap-2 overflow-x-auto rounded-full bg-white p-2 shadow-high">
        <span className="flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-black-99">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-99 text-black-99" aria-hidden="true">
            <Icon name="moto" size={22} />
          </span>
          Entrega grátis
        </span>

        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-haspopup="dialog"
          className="flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-semibold text-black-99 transition-colors duration-150 hover:bg-offwhite-99"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-99 text-black-99" aria-hidden="true">
            <Icon name="boltFill" size={18} />
          </span>
          No Horário
          <Icon name="chevronRight" size={20} className="shrink-0 text-muted-99" />
        </button>
      </div>

      <Modal open={aberto} onClose={() => setAberto(false)} title="No Horário" width="sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-2xl bg-yellow-99-light p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-99 text-black-99" aria-hidden="true">
              <Icon name="boltFill" size={26} />
            </span>
            <p className="text-[15px] font-semibold text-black-99">
              Ganhe cupons a partir de R$ 10 se o seu pedido atrasar.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[17px] font-bold">O que é</h3>
            <p className="text-[15px] text-secondary-99">
              Se o pedido entregue pela equipe parceira não chegar no horário previsto, você ganha um cupom de desconto
              proporcional ao atraso, contado depois que o pedido é concluído.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[17px] font-bold">Regras da recompensa</h3>
            <ul className="overflow-hidden rounded-2xl border border-border-99" role="list">
              <li className="flex bg-offwhite-99 text-[13px] font-bold text-secondary-99">
                <span className="flex-1 px-4 py-2">Tempo de atraso</span>
                <span className="flex-1 border-l border-border-99 px-4 py-2">Valor do cupom</span>
              </li>
              {REGRAS.map((r) => (
                <li key={r.atraso} className="flex border-t border-border-99 text-[15px]">
                  <span className="flex-1 px-4 py-3">{r.atraso}</span>
                  <span className="flex-1 border-l border-border-99 px-4 py-3 font-semibold">{r.cupom}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[13px] text-muted-99">
            O atraso é a diferença entre a entrega e a primeira previsão. Vale só para pedidos finalizados: cancelamento não
            dá direito à compensação. Neste conceito nenhum cupom é real.
          </p>
        </div>
      </Modal>
    </>
  );
}
