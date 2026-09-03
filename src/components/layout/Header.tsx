"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { Logo } from "@/components/layout/Logo";
import { Icon } from "@/components/ui/Icon";
import { useApp } from "@/context/AppProvider";
import { useState } from "react";
import { AddressPicker } from "@/components/comida/AddressPicker";

const nav = [
  { href: "/comida", label: "Comida" },
  { href: "/corrida", label: "Corrida" },
  { href: "/entrega", label: "Entrega" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { address } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const inFood = pathname.startsWith("/comida");
  const accent = "bg-yellow-99";

  return (
    <header className="sticky top-0 z-40 h-[72px] bg-white shadow-header">
      <div className="mx-auto flex h-full max-w-[1440px] items-center gap-3 px-4 md:gap-6 md:px-8 xl:px-16">
        <Link href="/" className="flex shrink-0 items-center gap-3 rounded-lg">
          <Logo decorative={false} />
          <span className="hidden text-lg font-semibold sm:inline">Web</span>
        </Link>

        <nav aria-label="Serviços" className="flex h-full items-stretch gap-1">
          {nav.map((n) => {
            const isActive = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={isActive ? "page" : undefined}
                className={cx(
                  "relative flex items-center rounded-lg px-2 text-sm font-semibold transition-colors md:px-4 md:text-base",
                  isActive ? "text-black-99" : "text-secondary-99 hover:text-black-99",
                )}
              >
                {n.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className={cx("absolute inset-x-2 bottom-0 h-1 rounded-t-full md:inset-x-4", accent)}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {inFood && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-offwhite-99 text-left text-sm font-semibold text-black-99 hover:bg-border-99 sm:h-12 sm:w-auto sm:max-w-[280px] sm:justify-start sm:gap-2 sm:px-4"
              aria-haspopup="dialog"
            >
              <Icon name="pin" className="shrink-0 text-black-99" />
              <span className="sr-only sm:hidden">Trocar endereço de entrega</span>
              <span className="hidden min-w-0 flex-col leading-tight sm:flex">
                <span className="text-xs font-medium text-muted-99">Entregar em</span>
                <span className="truncate">{address.line1}</span>
              </span>
              <Icon name="chevronDown" size={16} className="hidden shrink-0 text-muted-99 sm:block" />
            </button>
          )}
          <span
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-offwhite-99 text-black-99 md:flex"
            role="img"
            aria-label="Conta de demonstração"
            title="Conta de demonstração"
          >
            <Icon name="user" />
          </span>
        </div>
      </div>
      {inFood && <AddressPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />}
    </header>
  );
}
