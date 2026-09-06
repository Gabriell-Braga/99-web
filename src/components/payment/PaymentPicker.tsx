"use client";

import type { PaymentMethod } from "@/lib/types";
import { cx } from "@/lib/cx";
import { Icon, type IconName } from "@/components/ui/Icon";
import { PaymentIcon } from "@/components/payment/PaymentIcon";

const methods: { id: PaymentMethod; label: string; hint: string; icon: IconName | "pix" }[] = [
  { id: "pix", label: "Pix", hint: "Aprovação na hora", icon: "pix" },
  { id: "cartao", label: "Cartão de crédito", hint: "Visa, Master, Elo", icon: "card" },
  { id: "dinheiro", label: "Dinheiro na entrega", hint: "Informe se precisa de troco", icon: "cash" },
  { id: "vale", label: "Vale-refeição", hint: "Alelo, Sodexo, VR", icon: "ticket" },
];

interface PaymentPickerProps {
  value: PaymentMethod | null;
  onChange: (m: PaymentMethod) => void;
  allowed?: PaymentMethod[];
  compact?: boolean;
}

export function PaymentPicker({ value, onChange, allowed, compact }: PaymentPickerProps) {
  const list = allowed ? methods.filter((m) => allowed.includes(m.id)) : methods;
  return (
    <fieldset>
      <legend className="sr-only">Forma de pagamento</legend>
      <div className={cx("grid gap-3", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
        {list.map((m) => {
          const checked = value === m.id;
          return (
            <label
              key={m.id}
              className={cx(
                "flex cursor-pointer items-center gap-3 rounded-xl border border-border-99 px-4 py-3 transition-colors duration-150 ease-out",
                checked ? "bg-offwhite-99" : "hover:bg-offwhite-99",
              )}
            >
              <input
                type="radio"
                name="pagamento"
                value={m.id}
                checked={checked}
                onChange={() => onChange(m.id)}
                className="sr-only"
              />
              <span
                className={cx(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  checked ? "bg-black-99 text-white" : "bg-offwhite-99 text-black-99",
                )}
              >
                <PaymentIcon name={m.icon} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-semibold">{m.label}</span>
                <span className="text-[13px] text-muted-99">{m.hint}</span>
              </span>
              {checked && <Icon name="check" className="ml-auto shrink-0 text-success-99-deep" />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function paymentLabel(m: PaymentMethod): string {
  return methods.find((x) => x.id === m)?.label ?? m;
}
