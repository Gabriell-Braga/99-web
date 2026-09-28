"use client";

import { useMemo, useState } from "react";
import type { BagLine, MenuItem, OptionGroup, Restaurant } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { cx } from "@/lib/cx";
import { Modal } from "@/components/ui/Modal";
import { Stepper } from "@/components/ui/Stepper";
import { Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { FoodArt } from "@/components/comida/FoodArt";
import { menuVariantIndex } from "@/data/foodPhotos";
import { BlockedHint } from "@/components/ui/States";
import { discountPercent } from "@/components/comida/OfferCard";

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
    <fieldset className="rounded-2xl bg-offwhite-99 px-4 pb-1 pt-4">
      <legend className="sr-only">{group.label}</legend>
      <p className="text-[17px] font-bold">{group.label}</p>
      <p className="text-[15px] text-secondary-99">
        {ruleText(group)}
        {group.required ? " · obrigatório" : ""}
      </p>
      <div className="mt-2 flex flex-col divide-y divide-border-99">
        {group.choices.map((c) => {
          const checked = value.includes(c.id);
          const disabled = !single && !checked && atMax;
          return (
            <label
              key={c.id}
              className={cx("flex cursor-pointer items-center gap-3 py-4", disabled && "cursor-not-allowed opacity-60")}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[16px]">{c.label}</span>
                {c.hot && (
                  <span className="mt-1 flex w-fit items-center gap-1 text-[14px] text-orange-99">
                    <Icon name="flameFill" size={14} />
                    Em alta
                  </span>
                )}
              </span>
              {c.price > 0 && <span className="text-[16px] tabular-nums">+{formatBRL(c.price)}</span>}
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
                  checked ? "border-black-99" : "border-border-99 bg-white",
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
    <Modal open={item !== null} onClose={onClose} title={item?.name ?? ""} width="md" bare>
      {item && <ItemBody key={item.id} item={item} restaurant={restaurant} onAdd={onAdd} onClose={onClose} />}
    </Modal>
  );
}

/** Botão branco de canto arredondado sobre a foto, como no app. */
const photoButton =
  "flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black-99 shadow-mid transition-colors duration-150 hover:bg-offwhite-99";

function ItemBody({
  item,
  restaurant,
  onAdd,
  onClose,
}: {
  item: MenuItem;
  restaurant: Restaurant;
  onAdd: ItemModalProps["onAdd"];
  onClose: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [sel, setSel] = useState<Selections>({});
  const [copiado, setCopiado] = useState(false);

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
  const totalFull = item.promoPrice ? (item.price + extras) * qty : null;
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

  async function compartilhar() {
    const url = `${window.location.origin}/comida/${restaurant.slug}?item=${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // Compartilhamento cancelado: nada a fazer.
    }
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Foto de ponta a ponta; a folha branca sobe por cima com raio de 24px. */}
        <div className="relative h-[300px] md:h-[280px]">
          <FoodArt kind={item.art} src={item.photo} seed={item.id} index={menuVariantIndex(restaurant, item.id)} tint={restaurant.tint} eager className="absolute inset-0" />
          <div className="absolute inset-x-4 top-4 flex justify-between">
            <button type="button" onClick={onClose} aria-label="Fechar" className={photoButton}>
              <Icon name="x" size={26} />
            </button>
            <button type="button" onClick={compartilhar} aria-label={copiado ? "Link copiado" : "Compartilhar prato"} className={photoButton}>
              <Icon name={copiado ? "check" : "share"} size={24} />
            </button>
          </div>
        </div>

        <div className="relative -mt-6 flex flex-col gap-6 rounded-t-[24px] bg-white px-4 pb-6 pt-6 md:px-6">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[21px] font-bold leading-tight">{item.name}</p>
              {item.promoPrice && groups.length > 0 && <p className="mt-2 text-[15px] text-green-99">a partir de</p>}
              <p className={cx("flex flex-wrap items-center gap-x-2 gap-y-1", !(item.promoPrice && groups.length > 0) && "mt-2")}>
                <span className={cx("text-[22px] font-bold tabular-nums", item.promoPrice ? "text-green-99" : null)}>{formatBRL(base)}</span>
                {item.promoPrice ? (
                  <>
                    <span className="text-[15px] tabular-nums text-muted-99 line-through">{formatBRL(item.price)}</span>
                    <span className="rounded-md bg-green-99-tint px-2 py-0.5 text-[14px] text-green-99">
                      -{discountPercent(item.price, item.promoPrice)}%
                    </span>
                  </>
                ) : null}
              </p>
            </div>
            <p className="text-[15px] leading-relaxed text-secondary-99">{item.description}</p>
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
        </div>
      </div>

      {/* Rodapé fixo: stepper quadrado à esquerda e "Adicionar" com o valor à direita. */}
      <div className="flex flex-col gap-2 border-t border-border-99 bg-white px-4 py-4 md:px-6">
        <div className="flex items-center gap-3 min-[400px]:gap-4">
          {/* Em telas estreitas o stepper encolhe para o botão caber com o preço. */}
          <div className="shrink-0 min-[400px]:hidden">
            <Stepper value={qty} onChange={setQty} variant="square" size="sm" />
          </div>
          <div className="hidden shrink-0 min-[400px]:block">
            <Stepper value={qty} onChange={setQty} variant="square" size="lg" />
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={blocked}
            className="flex h-14 min-w-0 flex-1 items-center justify-between gap-2 rounded-2xl bg-yellow-99 px-4 min-[400px]:gap-3 min-[400px]:px-5 text-black-99 transition-[background-color,scale] duration-150 hover:bg-yellow-99-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-offwhite-99 disabled:text-disabled-99 motion-reduce:active:scale-100"
          >
            <span className="text-[15px] font-bold min-[360px]:text-[16px] min-[400px]:text-[18px]">Adicionar</span>
            <span className="flex flex-col items-end leading-tight tabular-nums">
              <span className="whitespace-nowrap text-[14px] font-bold min-[360px]:text-[15px] min-[400px]:text-[16px]">{formatBRL(total)}</span>
              {totalFull && <span className="whitespace-nowrap text-[12px] line-through opacity-70 min-[400px]:text-[13px]">{formatBRL(totalFull)}</span>}
            </span>
          </button>
        </div>
        {missingRequired.length > 0 && item.available && restaurant.open && (
          <BlockedHint items={missingRequired.map((g) => g.label.toLowerCase())} />
        )}
      </div>
    </>
  );
}
