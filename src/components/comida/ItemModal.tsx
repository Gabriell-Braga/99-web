"use client";

import { useMemo, useState } from "react";
import type { BagLine, MenuItem, OptionGroup, Restaurant } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { cx } from "@/lib/cx";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { FoodArt } from "@/components/comida/FoodArt";
import { BlockedHint } from "@/components/ui/States";

interface ItemModalProps {
  item: MenuItem | null;
  restaurant: Restaurant;
  onClose: () => void;
  onAdd: (line: Omit<BagLine, "lineId">) => void;
}

type Selections = Record<string, string[]>;

function ruleText(g: OptionGroup): string {
  if (g.type === "single") return g.required ? "Selecione 1" : "Selecione até 1";
  return g.max ? `Selecione até ${g.max}` : "Selecione quantos quiser";
}

/** Grupo de opções do item: card panel, título bold, regra de seleção e linhas com seletor circular. */
function OptionGroupBlock({ group, value, onChange }: { group: OptionGroup; value: string[]; onChange: (ids: string[]) => void }) {
  const single = group.type === "single";
  const atMax = group.max ? value.length >= group.max : false;
  return (
    <fieldset className="rounded-xl bg-offwhite-99 p-4">
      <legend className="sr-only">{group.label}</legend>
      <p className="text-[15px] font-bold">{group.label}</p>
      <p className="text-[13px] text-secondary-99">
        {ruleText(group)}
        {group.required ? " · obrigatório" : ""}
      </p>
      <div className="mt-3 flex flex-col divide-y divide-border-99">
        {group.choices.map((c) => {
          const checked = value.includes(c.id);
          const disabled = !single && !checked && atMax;
          return (
            <label
              key={c.id}
              className={cx("flex cursor-pointer items-center gap-3 py-3", disabled && "cursor-not-allowed opacity-60")}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px]">{c.label}</span>
                {c.hot && (
                  <span className="mt-0.5 flex w-fit items-center gap-1 text-[12px] font-bold text-orange-99">
                    <Icon name="flameFill" size={12} />
                    Em alta
                  </span>
                )}
              </span>
              {c.price > 0 && <span className="text-[15px] font-bold tabular-nums">+ {formatBRL(c.price)}</span>}
              <input
                type={single ? "radio" : "checkbox"}
                name={group.id}
                value={c.id}
                checked={checked}
                disabled={disabled}
                onChange={() => {
                  if (single) onChange([c.id]);
                  else onChange(checked ? value.filter((v) => v !== c.id) : [...value, c.id]);
                }}
                className="sr-only"
              />
              <span
                className={cx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  checked ? "border-black-99" : "border-placeholder-99",
                )}
                aria-hidden="true"
              >
                {checked && <span className="h-3 w-3 rounded-full bg-black-99" />}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ItemModal({ item, restaurant, onClose, onAdd }: ItemModalProps) {
  return (
    <Modal open={item !== null} onClose={onClose} title={item?.name ?? ""} width="md">
      {item && <ItemBody key={item.id} item={item} restaurant={restaurant} onAdd={onAdd} />}
    </Modal>
  );
}

function ItemBody({ item, restaurant, onAdd }: { item: MenuItem; restaurant: Restaurant; onAdd: ItemModalProps["onAdd"] }) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [sel, setSel] = useState<Selections>({});

  const groups = useMemo(() => item.options ?? [], [item.options]);
  const missingRequired = groups.filter((g) => g.required && !sel[g.id]?.length);

  const extras = useMemo(() => {
    let sum = 0;
    for (const g of groups) for (const id of sel[g.id] ?? []) sum += g.choices.find((c) => c.id === id)?.price ?? 0;
    return sum;
  }, [groups, sel]);

  const base = item.promoPrice ?? item.price;
  const unit = base + extras;
  const total = unit * qty;
  const blocked = missingRequired.length > 0 || !item.available || !restaurant.open;

  function submit() {
    const selections = groups.flatMap((g) =>
      (sel[g.id] ?? []).map((id) => {
        const c = g.choices.find((x) => x.id === id)!;
        return { groupLabel: g.label, choiceLabel: c.label, price: c.price };
      }),
    );
    onAdd({ itemId: item.id, name: item.name, unitPrice: unit, quantity: qty, selections, note: note.trim() || undefined });
  }

  return (
    <div className="flex flex-col gap-5">
      <FoodArt kind={item.art} tint={restaurant.tint} className="aspect-[2/1] w-full rounded-xl" scale={0.8} />
      <div className="flex flex-col gap-1">
        <p className="text-[15px] text-secondary-99">{item.description}</p>
        <p className="flex items-baseline gap-2">
          <span className={cx("text-[20px] font-bold tabular-nums", item.promoPrice ? "text-green-99" : null)}>{formatBRL(base)}</span>
          {item.promoPrice && <span className="text-[15px] tabular-nums text-muted-99 line-through">{formatBRL(item.price)}</span>}
        </p>
      </div>

      {!item.available && (
        <p className="rounded-xl bg-orange-99-bg px-4 py-3 text-sm text-orange-99-text">Este item está indisponível agora. Escolha outro do cardápio.</p>
      )}

      {groups.map((g) => (
        <OptionGroupBlock key={g.id} group={g} value={sel[g.id] ?? []} onChange={(ids) => setSel((s) => ({ ...s, [g.id]: ids }))} />
      ))}

      <Textarea
        label="Alguma observação?"
        placeholder="Ex.: sem cebola, molho à parte"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={140}
        hint={`${note.length}/140`}
      />

      <div className="-mx-6 -mb-5 flex items-center justify-between gap-4 border-t border-border-99 bg-white px-6 py-4">
        <Stepper value={qty} onChange={setQty} variant="square" />
        <div className="flex flex-col items-end gap-1">
          <Button onClick={submit} disabled={blocked} size="lg" price={formatBRL(total)}>
            Adicionar
          </Button>
          {missingRequired.length > 0 && item.available && restaurant.open && (
            <BlockedHint items={missingRequired.map((g) => g.label.toLowerCase())} />
          )}
        </div>
      </div>
    </div>
  );
}
