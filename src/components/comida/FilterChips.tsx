"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";

const REGRAS: { atraso: string; cupom: string }[] = [
  { atraso: "15 a 30 minutos", cupom: "Cupom de R$10 OFF" },
  { atraso: "30 minutos ou mais", cupom: "Cupom de R$30 OFF" },
];

/**
 * Fileira que sai da folha branca como uma aba, sobre o amarelo, como no app.
 * "Entrega grátis" é só um selo; "No Horário" abre a explicação.
 */
export function FilterChips() {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <div className="scroll-rail flex items-center gap-4 overflow-x-auto md:gap-2">
        <span className="flex h-10 shrink-0 items-center gap-2 rounded-full text-[15px] font-semibold md:h-11 md:px-4 text-black-99">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-99 text-black-99 md:h-8 md:w-8" aria-hidden="true">
            <Icon name="moto" size={22} />
          </span>
          Entrega grátis
        </span>

        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-haspopup="dialog"
          className="flex h-10 shrink-0 items-center gap-2 rounded-full text-[15px] font-semibold md:h-11 md:px-4 text-black-99 transition-colors duration-150 md:hover:bg-offwhite-99"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-99 text-black-99 md:h-8 md:w-8" aria-hidden="true">
            <Icon name="boltFill" size={18} />
          </span>
          No Horário
          <Icon name="chevronRight" size={20} className="shrink-0 text-muted-99" />
        </button>
      </div>

      <Modal open={aberto} onClose={() => setAberto(false)} title="No Horário" width="sm" bare>
        <div className="min-h-0 flex-1 overflow-y-auto bg-subtle-99">
          {/* Topo amarelo-claro com título e selo, como a tela do app; os cartões sobem por cima. */}
          <div className="bg-yellow-99-light px-4 pb-20 pt-4 md:px-6">
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Voltar"
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-black-99 transition-colors hover:bg-black-99/5"
            >
              <Icon name="chevronLeft" size={30} />
            </button>
            <div className="mt-4 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[30px] font-extrabold leading-tight text-black-99">No Horário</p>
                <p className="mt-2 text-[16px] text-black-99">Ganhe cupons a partir de R$ 10 se o seu pedido atrasar</p>
              </div>
              <span
                aria-hidden="true"
                className="flex h-24 w-20 shrink-0 rotate-6 items-center justify-center rounded-b-[40px] rounded-t-[18px] bg-yellow-99 text-black-99 shadow-[6px_6px_0_#E0B800]"
              >
                <Icon name="boltFill" size={48} />
              </span>
            </div>
          </div>

          <div className="-mt-14 flex flex-col gap-4 px-4 pb-8 md:px-6">
            <section className="rounded-3xl bg-white p-6">
              <h3 className="text-[22px] font-bold">O que é?</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-black-99">
                Se o pedido entregue pela equipe parceira não chegar no horário previsto, depois da conclusão você ganha um cupom de
                desconto de acordo com o atraso.
              </p>
            </section>

            <section className="rounded-3xl bg-white p-6">
              <h3 className="text-[22px] font-bold">Regras da recompensa</h3>
              <table className="mt-4 w-full overflow-hidden rounded-2xl border-separate border-spacing-0 border border-border-99 text-center text-[14px] min-[400px]:text-[15px]">
                <thead>
                  <tr className="bg-offwhite-99 text-secondary-99">
                    <th className="px-3 py-3 font-semibold">Tempo de atraso</th>
                    <th className="border-l border-border-99 px-3 py-3 font-semibold">Valor do cupom</th>
                  </tr>
                </thead>
                <tbody>
                  {REGRAS.map((r) => (
                    <tr key={r.atraso}>
                      <td className="border-t border-border-99 px-2 py-4">{r.atraso}</td>
                      <td className="border-l border-t border-border-99 px-2 py-4">{r.cupom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-[14px] leading-relaxed text-secondary-99">
                Como saber se vou ganhar um cupom?
                <br />
                Atraso = horário da entrega − primeira previsão de entrega.
                <br />
                *Cupom válido apenas para pedidos finalizados. Cancelamentos não dão direito a compensação. Neste conceito nenhum
                cupom é real.
              </p>
            </section>
          </div>
        </div>
      </Modal>
    </>
  );
}
