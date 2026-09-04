"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { menuAccount, menuReferral, user, type MenuItemDef } from "@/data/menu";

function MenuRow({ item }: { item: MenuItemDef }) {
  return (
    <li>
      <button
        type="button"
        aria-disabled="true"
        title="Fora do escopo deste conceito"
        className="flex w-full items-center gap-4 rounded-xl px-2 py-3 text-left text-[17px] text-black-99 hover:bg-subtle-99"
      >
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center" style={{ color: item.color }}>
          <Icon name={item.icon} size={28} strokeWidth={2.2} />
          {item.dot && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-alert-99" aria-hidden="true" />
          )}
        </span>
        {item.label}
      </button>
    </li>
  );
}

/** Menu lateral do app, aberto pelo avatar do cabeçalho. Os itens são os do produto e ficam fora do escopo. */
export function SideMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <button type="button" aria-label="Fechar menu" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-black/50" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            initial={reduce ? false : { x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-y-0 left-0 flex w-[78%] max-w-sm flex-col overflow-y-auto bg-white px-4 py-6 focus:outline-none"
          >
            <div className="flex items-start justify-between gap-3 px-2 pb-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[26px] font-bold leading-tight">
                  {user.fullName}
                  {user.verified && <Icon name="verified" size={22} className="text-info-99" strokeWidth={2} />}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-secondary-99">
                  Editar minhas informações
                  <span className="h-2 w-2 rounded-full bg-alert-99" aria-hidden="true" />
                </p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-99 text-black-99">
                <Icon name="user" size={26} strokeWidth={2} />
              </span>
            </div>

            <ul className="flex flex-col" role="list">
              {menuAccount.map((i) => (
                <MenuRow key={i.label} item={i} />
              ))}
            </ul>
            <hr className="my-3 border-border-99" />
            <ul className="flex flex-col" role="list">
              {menuReferral.map((i) => (
                <MenuRow key={i.label} item={i} />
              ))}
            </ul>
            <p className="mt-6 px-2 text-[13px] text-muted-99">
              Itens do menu do app, fora do escopo deste conceito.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
