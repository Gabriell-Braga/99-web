"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

const items: { href: string; label: string; icon: IconName; disabled?: boolean }[] = [
  { href: "/corrida", label: "Corrida", icon: "car" },
  { href: "/comida", label: "Food", icon: "utensils" },
  { href: "/entrega", label: "Entrega", icon: "box" },
  { href: "/pay", label: "Pay", icon: "wallet", disabled: true },
];

/** Telas de fluxo têm barra de ação própria no rodapé; no celular a pílula sai delas. */
const flowRoutes = ["/corrida", "/entrega"];
/** No checkout a barra de ação ocupa a largura toda e cobriria a pílula. */
const hiddenRoutes = ["/comida/checkout"];

/**
 * Pílula branca flutuante no rodapé, centralizada, em todas as larguras.
 * Corrida, Food, Entrega e Pay nesta ordem; o item ativo vira círculo amarelo
 * de 48px sem rótulo.
 */
export function BottomNav() {
  const pathname = usePathname();
  const inFlow = flowRoutes.some((r) => pathname.startsWith(r));
  if (hiddenRoutes.some((r) => pathname.startsWith(r))) return null;

  return (
    <nav
      aria-label="Serviços"
      className={cx(
        "pointer-events-none fixed inset-x-0 bottom-4 z-30 justify-center px-4 lg:bottom-6",
        inFlow ? "hidden lg:flex" : "flex",
      )}
    >
      <ul className="pointer-events-auto flex h-16 items-center gap-1 rounded-full bg-white px-2 shadow-high" role="list">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          const inner = active ? (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-99 text-black-99">
              <Icon name={it.icon} size={24} />
              <span className="sr-only">{it.label}</span>
            </span>
          ) : (
            <span className="flex h-12 w-16 flex-col items-center justify-center gap-0.5 text-black-99">
              <Icon name={it.icon} size={24} />
              <span className="text-[11px] font-medium leading-none">{it.label}</span>
            </span>
          );
          return (
            <li key={it.href}>
              {it.disabled ? (
                <span
                  className="block cursor-not-allowed rounded-full opacity-60"
                  title="Fora do escopo do conceito"
                  aria-disabled="true"
                >
                  {inner}
                </span>
              ) : (
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className="block rounded-full transition-colors hover:bg-subtle-99"
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
