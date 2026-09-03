"use client";

import { Input } from "@/components/ui/Field";

export interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export const emptyCard: CardData = { number: "", name: "", expiry: "", cvv: "" };

export function cardErrors(c: CardData, touched: Partial<Record<keyof CardData, boolean>>) {
  const digits = c.number.replace(/\D/g, "");
  const errors: Partial<Record<keyof CardData, string>> = {};
  if (touched.number && digits.length !== 16) {
    errors.number = "O número precisa ter 16 dígitos. Confira o cartão.";
  }
  if (touched.name && c.name.trim().split(/\s+/).length < 2) {
    errors.name = "Digite o nome completo como está no cartão.";
  }
  if (touched.expiry) {
    const m = c.expiry.match(/^(\d{2})\/(\d{2})$/);
    const month = m ? Number(m[1]) : 0;
    const year = m ? 2000 + Number(m[2]) : 0;
    const now = new Date();
    const valid =
      Boolean(m) &&
      month >= 1 &&
      month <= 12 &&
      (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1));
    if (!valid) errors.expiry = "Use o formato MM/AA com uma data futura.";
  }
  if (touched.cvv && !/^\d{3,4}$/.test(c.cvv)) {
    errors.cvv = "O código de segurança tem 3 ou 4 dígitos.";
  }
  return errors;
}

export function cardIsValid(c: CardData): boolean {
  const all = { number: true, name: true, expiry: true, cvv: true };
  return Object.keys(cardErrors(c, all)).length === 0;
}

function maskNumber(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function maskExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

interface CardFormProps {
  value: CardData;
  onChange: (c: CardData) => void;
  touched: Partial<Record<keyof CardData, boolean>>;
  onTouch: (k: keyof CardData) => void;
}

export function CardForm({ value, onChange, touched, onTouch }: CardFormProps) {
  const errors = cardErrors(value, touched);
  return (
    <div className="grid grid-cols-2 gap-4 rounded-xl bg-subtle-99 p-4">
      <Input
        label="Número do cartão"
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="0000 0000 0000 0000"
        value={value.number}
        onChange={(e) => onChange({ ...value, number: maskNumber(e.target.value) })}
        onBlur={() => onTouch("number")}
        error={errors.number}
        wrapperClassName="col-span-2"
      />
      <Input
        label="Nome impresso"
        autoComplete="cc-name"
        placeholder="Como está no cartão"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        onBlur={() => onTouch("name")}
        error={errors.name}
        wrapperClassName="col-span-2"
      />
      <Input
        label="Validade"
        inputMode="numeric"
        autoComplete="cc-exp"
        placeholder="MM/AA"
        value={value.expiry}
        onChange={(e) => onChange({ ...value, expiry: maskExpiry(e.target.value) })}
        onBlur={() => onTouch("expiry")}
        error={errors.expiry}
      />
      <Input
        label="CVV"
        inputMode="numeric"
        autoComplete="cc-csc"
        placeholder="123"
        value={value.cvv}
        onChange={(e) => onChange({ ...value, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
        onBlur={() => onTouch("cvv")}
        error={errors.cvv}
      />
      <p className="col-span-2 text-[13px] text-muted-99">
        Simulação: só o formato é validado. Nenhum dado é enviado ou cobrado.
      </p>
    </div>
  );
}
