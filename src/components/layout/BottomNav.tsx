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
/** No checkout a barra de ação ocupa a largura toda, como no app, e a pílula some. */
const hiddenRoutes = ["/comida/checkout"];

function NavItem({ it, active, vertical }: { it: (typeof items)[number]; active: boolean; vertical: boolean }) {
  const inner = active ? (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-99 text-black-99">
      <Icon name={it.icon} size={24} strokeWidth={2.2} />
      <span className="sr-only">{it.label}</span>
    </span>
  ) : (
    <span className={cx("flex flex-col items-center justify-center gap-0.5 text-black-99", vertical ? "h-14 w-14" : "h-12 w-16")}>
      <Icon name={it.icon} size={24} strokeWidth={2} />
      <span className="text-[11px] font-medium leading-none">{it.label}</span>
    </span>
  );
  if (it.disabled) {
    return (
      <span className="block cursor-not-allowed rounded-full opacity-60" title="Fora do escopo do conceito" aria-disabled="true">
        {inner}
      </span>
    );
  }
  return (
    <Link href={it.href} aria-current={active ? "page" : undefined} className="block rounded-full transition-colors hover:bg-subtle-99">
      {inner}
    </Link>
  );
}

/**
 * Navegação com Corrida, Food, Entrega e Pay, sempre nesta ordem. Abaixo de
 * 1024px é a pílula branca flutuante do app; a partir de 1024px vira uma barra
 * vertical fixa de 72px na borda esquerda, com o mesmo visual.
 */
export function BottomNav() {
  const pathname = usePathname();
  const inFlow = flowRoutes.some((r) => pathname.startsWith(r));
  const hidden = hiddenRoutes.some((r) => pathname.startsWith(r));

  return (
    <>
      <nav
        aria-label="Serviços"
        className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-col items-center border-r border-border-99 bg-white pt-4 lg:flex"
      >
        <ul className="flex flex-col items-center gap-2" role="list">
          {items.map((it) => (
            <li key={it.href}>
              <NavItem it={it} active={pathname.startsWith(it.href)} vertical />
            </li>
          ))}
        </ul>
      </nav>

      {!hidden && (
        <nav
          aria-label="Serviços"
          className={cx(
            "pointer-events-none fixed inset-x-0 bottom-4 z-30 justify-center px-4 lg:hidden",
            inFlow ? "hidden" : "flex",
          )}
        >
          <ul className="pointer-events-auto flex h-16 items-center gap-1 rounded-full bg-white px-2 shadow-high" role="list">
            {items.map((it) => (
              <li key={it.href}>
                <NavItem it={it} active={pathname.startsWith(it.href)} vertical={false} />
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
