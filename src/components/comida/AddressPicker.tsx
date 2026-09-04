"use client";

import { savedAddresses } from "@/data/addresses";
import { useApp } from "@/context/AppProvider";
import { Modal } from "@/components/ui/Modal";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Chip";
import { cx } from "@/lib/cx";

const icons: Record<string, IconName> = { casa: "home", trabalho: "briefcase", sitio: "tree" };

export function AddressPicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { address, setAddress } = useApp();
  return (
    <Modal open={open} onClose={onClose} title="Entregar em" width="sm">
      <ul className="flex flex-col gap-3" role="list">
        {savedAddresses.map((a) => {
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
                  "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors",
                  selected ? "border-black-99 bg-subtle-99" : "border-border-99 hover:bg-subtle-99",
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-offwhite-99">
                  <Icon name={icons[a.id] ?? "pin"} />
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
        Protótipo: os endereços são fixos. O último serve para demonstrar o aviso de endereço fora do raio de entrega.
      </p>
    </Modal>
  );
}
