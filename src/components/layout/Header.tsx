"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Icon } from "@/components/ui/Icon";
import { bagCount, useApp } from "@/context/AppProvider";
import { AddressPicker } from "@/components/comida/AddressPicker";
import { user } from "@/data/menu";
import { CountBubble } from "@/components/ui/CountBubble";

function HeaderAction({
  label,
  icon,
  href,
  count,
  onClick,
}: {
  label: string;
  icon: "coupon" | "receipt" | "cart";
  href?: string;
  count?: number;
  onClick?: () => void;
}) {
  const cls =
    "relative flex h-11 w-11 items-center justify-center rounded-full text-black-99 transition-colors hover:bg-black-99/10";
  const inner = (
    <>
      <Icon name={icon} size={24} />
      {count ? <CountBubble count={count} className="absolute -right-0.5 -top-0.5 h-5 min-w-5 px-1 text-[11px]" /> : null}
    </>
  );
  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

/**
 * Cabeçalho amarelo do app: avatar à esquerda, saudação ou endereço ao lado,
 * ações à direita. Em Food são cupom, pedidos e carrinho.
 */
export function Header() {
  const pathname = usePathname();
  const { address, bag } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const inFood = pathname.startsWith("/comida");
  const count = bagCount(bag);

  return (
    <header className="bg-yellow-99 pb-6">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-3 px-4 md:gap-4 md:px-8 xl:px-16">
        {/* Avatar decorativo: o menu do perfil está fora do escopo. */}
        <span className="flex h-11 w-11 shrink-0 cursor-default items-center justify-center rounded-full bg-white text-black-99" aria-hidden="true">
          <Icon name="user" size={24} />
        </span>

        {inFood ? (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex min-w-0 items-center gap-2 rounded-xl text-left text-black-99"
            aria-haspopup="dialog"
          >
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="text-[13px] font-medium">Entregar em</span>
              <span className="truncate text-[17px] font-bold">{address.line1}</span>
            </span>
            <Icon name="chevronDown" size={18} className="shrink-0" />
          </button>
        ) : (
          <p className="min-w-0 truncate text-[22px] font-bold text-black-99">Olá, {user.name}!</p>
        )}

        <Link
          href="/"
          className="ml-auto hidden items-center gap-2 rounded-xl text-black-99 md:flex"
          aria-label="99 Web, início"
        >
          <Logo variant="glifoPreto" size={32} />
          <span className="text-[17px] font-bold">Web</span>
        </Link>

        <div className="ml-auto flex items-center gap-1 md:ml-4">
          {inFood && (
            <>
              <HeaderAction label="Cupons de desconto" icon="coupon" href="/comida/checkout" />
              <HeaderAction label="Pedidos" icon="receipt" href="/pedido/demo-comida" />
              <HeaderAction label="Carrinho" icon="cart" href="/comida/checkout" count={count} />
            </>
          )}
        </div>
      </div>
      {inFood && <AddressPicker open={pickerOpen} onClose={() => setPickerOpen(false)} />}
    </header>
  );
}
