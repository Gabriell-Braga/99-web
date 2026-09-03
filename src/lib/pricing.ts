import type { PackageSize, RideCategory } from "@/lib/types";

export function rideFare(category: RideCategory, km: number): number {
  const raw = category.base + category.perKm * km;
  return Math.max(category.minFare, Math.round(raw * 100) / 100);
}

export function rideDurationMin(km: number, category: RideCategory["id"], routeMin?: number): number {
  if (routeMin) return category === "moto" ? Math.max(3, Math.round(routeMin * 0.8)) : routeMin;
  const speed = category === "moto" ? 28 : 21; // km/h no trânsito
  return Math.max(4, Math.round((km / speed) * 60));
}

export const packageSizes: {
  id: PackageSize;
  label: string;
  hint: string;
  extra: number;
}[] = [
  { id: "envelope", label: "Envelope", hint: "Até 1 kg · documentos", extra: 0 },
  { id: "pequeno", label: "Pequeno", hint: "Até 5 kg · cabe na mochila", extra: 2 },
  { id: "medio", label: "Médio", hint: "Até 10 kg · caixa de sapato", extra: 5 },
  { id: "grande", label: "Grande", hint: "Até 20 kg · precisa de baú", extra: 12 },
];

export function deliveryFare(km: number, size: PackageSize, declaredValue: number): number {
  const base = 7.9;
  const perKm = 1.9;
  const sizeExtra = packageSizes.find((s) => s.id === size)?.extra ?? 0;
  const insurance = declaredValue > 0 ? Math.min(15, declaredValue * 0.01) : 0;
  return Math.round((base + perKm * km + sizeExtra + insurance) * 100) / 100;
}

export function deliveryEtaMin(km: number, routeMin?: number): { min: number; max: number } {
  const ride = routeMin ?? Math.round((km / 24) * 60);
  return { min: 15 + ride, max: 25 + ride };
}

export const coupons: Record<string, { label: string; amount: number; minSubtotal: number }> = {
  PRIMEIRA10: { label: "R$ 10 de desconto na primeira compra", amount: 10, minSubtotal: 30 },
  FRETE99: { label: "Frete grátis", amount: -1, minSubtotal: 0 },
};
