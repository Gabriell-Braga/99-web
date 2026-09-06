"use client";

import { useApp } from "@/context/AppProvider";
import { Modal } from "@/components/ui/Modal";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Chip";
import { cx } from "@/lib/cx";

const icons: Record<string, IconName> = { atual: "target", casa: "home", trabalho: "briefcase", sitio: "tree" };

export function AddressPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { address, addresses, setAddress } = useApp();
  // Enquanto a posição não chega, a lista é a de exemplo e a localização atual ainda não entrou.
  const localizando = !addresses.some((a) => a.id === "atual");

  return (
    <Modal open={open} onClose={onClose} title="Entregar em" width="sm">
      <ul className="flex flex-col gap-3" role="list">
        {localizando && (
          <li>
            <span className="flex w-full items-center gap-4 rounded-xl border border-border-99 p-4 opacity-70">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-offwhite-99">
                <Icon name="target" className="text-info-99" />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold">Localização atual</span>
                <span className="text-sm text-secondary-99">Obtendo sua posição…</span>
              </span>
            </span>
          </li>
        )}
        {addresses.map((a) => {
          const selected = a.id === address.id;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => {
                  setAddress(a);
                  onClose();
                }}
                aria-pressed={selected}
                className={cx(
                  "flex w-full items-start gap-4 rounded-xl border border-border-99 p-4 text-left transition-colors duration-150 ease-out",
                  selected ? "bg-offwhite-99" : "hover:bg-offwhite-99",
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-offwhite-99">
                  <Icon name={icons[a.id] ?? "pin"} className={a.id === "atual" ? "text-info-99" : undefined} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">{a.label}</span>
                    {!a.covered && <Badge tone="orange">Fora do raio</Badge>}
                  </span>
                  <span className="text-sm text-secondary-99">{a.line1}</span>
                  <span className="text-[13px] text-muted-99">
                    {a.line2} · {a.city}
                  </span>
                </span>
                {selected && <Icon name="check" className="mt-2 shrink-0 text-success-99-deep" />}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[13px] text-muted-99">
        Protótipo: os endereços saem da sua localização atual. O último fica longe para demonstrar o aviso de endereço
        fora do raio de entrega.
      </p>
    </Modal>
  );
}
