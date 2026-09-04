import type { PackageSize, RideCategory } from "@/lib/types";
import { deliveryCategories } from "@/data/rides";

export function rideFare(category: RideCategory, km: number): number {
  const raw = category.base + category.perKm * km;
  return Math.max(category.minFare, Math.round(raw * 100) / 100);
}

export function rideDurationMin(km: number, category: RideCategory["id"], routeMin?: number): number {
  if (routeMin) return category === "moto" ? Math.max(3, Math.round(routeMin * 0.8)) : routeMin;
  const speed = category === "moto" ? 28 : 21; // km/h no trânsito
  return Math.max(4, Math.round((km / speed) * 60));
}

export function deliveryFare(km: number, size: PackageSize): number {
  const c = deliveryCategories.find((d) => d.id === size) ?? deliveryCategories[0];
  return Math.max(c.minFare, Math.round((c.base + c.perKm * km) * 100) / 100);
}

export function deliveryEtaMin(km: number, routeMin?: number): { min: number; max: number } {
  const ride = routeMin ?? Math.round((km / 24) * 60);
  return { min: 15 + ride, max: 25 + ride };
}

export const coupons: Record<string, { label: string; amount: number; minSubtotal: number }> = {
  PRIMEIRA10: { label: "R$ 10 de desconto na primeira compra", amount: 10, minSubtotal: 30 },
  FRETE99: { label: "Frete grátis", amount: -1, minSubtotal: 0 },
};
