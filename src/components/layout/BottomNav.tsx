"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import { isStoreRoute } from "@/lib/routes";

const items: { href: string; label: string; icon: IconName; disabled?: boolean }[] = [
  { href: "/corrida", label: "Corrida", icon: "car" },
  { href: "/comida", label: "Food", icon: "utensils" },
  { href: "/entrega", label: "Entrega", icon: "box" },
  { href: "/pay", label: "Pay", icon: "money", disabled: true },
];

/** Telas de fluxo têm barra de ação própria no rodapé; no celular a pílula sai delas. */
const flowRoutes = ["/corrida", "/entrega", "/pedido"];
/** No checkout a barra de ação ocupa a largura toda e cobriria a pílula. */
const hiddenRoutes = ["/comida/checkout"];

/**
 * Pílula branca flutuante no rodapé, centralizada, em todas as larguras.
 * Corrida, Food, Entrega e Pay nesta ordem; o círculo amarelo desliza para o
 * item ativo em 220ms.
 */
export function BottomNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const inFlow = flowRoutes.some((r) => pathname.startsWith(r));
  if (hiddenRoutes.some((r) => pathname.startsWith(r))) return null;

  const transition = { duration: reduce ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <nav
      aria-label="Serviços"
      className={cx(
        "pointer-events-none fixed inset-x-0 bottom-4 z-30 justify-center px-4 lg:bottom-6",
        inFlow ? "hidden lg:flex lg:justify-end lg:pr-8" : isStoreRoute(pathname) ? "hidden md:flex" : "flex",
      )}
    >
      <ul className="pointer-events-auto flex h-[72px] items-center rounded-full bg-white px-1 shadow-high min-[360px]:h-20" role="list">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          const inner = (
            <span className="relative flex h-16 w-[72px] items-center justify-center min-[360px]:h-[72px] min-[360px]:w-20">
              {active && (
                <motion.span
                  layoutId={reduce ? undefined : "nav-ativo"}
                  transition={transition}
                  className="absolute h-16 w-16 rounded-full bg-yellow-99 min-[360px]:h-[72px] min-[360px]:w-[72px]"
                  aria-hidden="true"
                />
              )}
              <span className="relative flex flex-col items-center justify-center gap-1 text-black-99">
                <Icon name={it.icon} size={active ? 28 : 24} />
                {/* No item selecionado fica só o ícone dentro do círculo amarelo. */}
                {active ? (
                  <span className="sr-only">{it.label}</span>
                ) : (
                  <span className="text-[13px] leading-none text-secondary-99">{it.label}</span>
                )}
              </span>
            </span>
          );
          if (it.disabled) {
            return (
              <li key={it.href}>
                <span
                  className="block cursor-not-allowed rounded-full opacity-60"
                  title="Fora do escopo do conceito"
                  aria-disabled="true"
                >
                  {inner}
                </span>
              </li>
            );
          }
          return (
            <li key={it.href}>
              <motion.div whileTap={reduce ? undefined : { scale: 0.94 }} transition={{ duration: 0.1 }}>
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "block rounded-full transition-colors duration-150 ease-out",
                    !active && "hover:bg-offwhite-99",
                  )}
                >
                  {inner}
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
