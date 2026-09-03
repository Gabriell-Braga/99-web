"use client";

import { useMemo, useState } from "react";
import type { BagLine, MenuItem, OptionGroup, Restaurant } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { cx } from "@/lib/cx";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { Textarea } from "@/components/ui/Field";
import { FoodArt } from "@/components/comida/FoodArt";
import { BlockedHint } from "@/components/ui/States";

interface ItemModalProps {
  item: MenuItem | null;
  restaurant: Restaurant;
  onClose: () => void;
  onAdd: (line: Omit<BagLine, "lineId">) => void;
}

type Selections = Record<string, string[]>;

function OptionGroupBlock({
  group,
  value,
  onChange,
}: {
  group: OptionGroup;
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const single = group.type === "single";
  const atMax = group.max ? value.length >= group.max : false;
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="flex w-full items-baseline justify-between gap-3">
        <span className="text-base font-semibold">{group.label}</span>
        <span className="text-[13px] text-muted-99">
          {group.required ? "Obrigatório" : group.max ? `Até ${group.max}` : "Opcional"}
        </span>
      </legend>
      <div className="flex flex-col gap-2">
        {group.choices.map((c) => {
          const checked = value.includes(c.id);
          const disabled = !single && !checked && atMax;
          return (
            <label
              key={c.id}
              className={cx(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
                checked ? "border-black-99 bg-subtle-99" : "border-border-99 hover:bg-subtle-99",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
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
                className="h-5 w-5 accent-black-99"
              />
              <span className="flex-1 text-sm font-medium">{c.label}</span>
              <span className="text-sm text-muted-99">{c.price > 0 ? `+ ${formatBRL(c.price)}` : ""}</span>
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

function ItemBody({
  item,
  restaurant,
  onAdd,
}: {
  item: MenuItem;
  restaurant: Restaurant;
  onAdd: ItemModalProps["onAdd"];
}) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [sel, setSel] = useState<Selections>({});

  const groups = useMemo(() => item.options ?? [], [item.options]);
  const missingRequired = groups.filter((g) => g.required && !(sel[g.id]?.length));

  const extras = useMemo(() => {
    let sum = 0;
    for (const g of groups) {
      for (const id of sel[g.id] ?? []) {
        sum += g.choices.find((c) => c.id === id)?.price ?? 0;
      }
    }
    return sum;
  }, [groups, sel]);

  const unit = item.price + extras;
  const total = unit * qty;
  const blocked = missingRequired.length > 0 || !item.available || !restaurant.open;

  function submit() {
    const selections = groups.flatMap((g) =>
      (sel[g.id] ?? []).map((id) => {
        const c = g.choices.find((x) => x.id === id)!;
        return { groupLabel: g.label, choiceLabel: c.label, price: c.price };
      }),
    );
    onAdd({
      itemId: item.id,
      name: item.name,
      unitPrice: unit,
      quantity: qty,
      selections,
      note: note.trim() || undefined,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4">
        <FoodArt kind={item.art} tint={restaurant.tint} className="h-24 w-24 shrink-0 rounded-xl" />
        <div className="flex flex-col gap-1">
          <p className="text-sm text-secondary-99">{item.description}</p>
          <p className="text-lg font-bold">{formatBRL(item.price)}</p>
        </div>
      </div>

      {!item.available && (
        <p className="rounded-xl bg-orange-99-bg px-4 py-3 text-sm text-orange-99-text">
          Este item está indisponível agora. Escolha outro do cardápio.
        </p>
      )}

      {groups.map((g) => (
        <OptionGroupBlock
          key={g.id}
          group={g}
          value={sel[g.id] ?? []}
          onChange={(ids) => setSel((s) => ({ ...s, [g.id]: ids }))}
        />
      ))}

      <Textarea
        label="Alguma observação?"
        placeholder="Ex.: sem cebola, molho à parte"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={140}
        hint={`${note.length}/140`}
        className="min-h-20"
      />

      <div className="-mx-6 -mb-5 flex items-center justify-between gap-4 border-t border-border-99 bg-white px-6 py-4">
        <Stepper value={qty} onChange={setQty} />
        <div className="flex flex-col items-end gap-1">
          <Button onClick={submit} disabled={blocked} size="md">
            Adicionar · {formatBRL(total)}
          </Button>
          {missingRequired.length > 0 && item.available && restaurant.open && (
            <BlockedHint items={missingRequired.map((g) => g.label.toLowerCase())} />
          )}
        </div>
      </div>
    </div>
  );
}
