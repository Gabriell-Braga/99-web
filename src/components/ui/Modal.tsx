"use client";

import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
  /** Em telas pequenas, sobe do rodapé como uma gaveta. */
  sheetOnMobile?: boolean;
  /**
   * Sem cabeçalho nem margens: o conteúdo desenha a tela toda. No celular ocupa a
   * tela inteira, como as telas empilhadas do app. O título fica só para leitores de tela.
   */
  bare?: boolean;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const noop = () => () => {};

const widths = { sm: "max-w-md", md: "max-w-[560px]", lg: "max-w-3xl" };

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = "md",
  bare,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const reduce = useReducedMotion();
  // Só no cliente, e só depois de hidratar: aberto já no primeiro render (link com
  // ?item=), o portal no servidor não bateria com o do navegador.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && panel) {
        const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (n) => n.offsetParent !== null,
        );
        if (nodes.length === 0) {
          e.preventDefault();
          return;
        }
        const firstNode = nodes[0];
        const lastNode = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === firstNode) {
          e.preventDefault();
          lastNode.focus();
        } else if (!e.shiftKey && document.activeElement === lastNode) {
          e.preventDefault();
          firstNode.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  const transition = { duration: reduce ? 0 : 0.2, ease: [0.4, 0, 0.2, 1] as const };
  const scrim = { duration: reduce ? 0 : 0.15 };

  // O modal vai para o body: dentro de um ancestral com transform, "fixed"
  // passa a se medir por ele, e a caixa aparecia recortada no lugar errado.
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={cx("fixed inset-0 z-50 flex justify-center", bare ? "items-stretch md:items-center md:p-6" : "items-end sm:items-center sm:p-6")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={scrim}
        >
          <button
            type="button"
            aria-label="Fechar"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduce ? false : { y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={transition}
            className={cx(
              "relative flex w-full flex-col overflow-hidden bg-white shadow-high focus:outline-none",
              bare ? "h-dvh md:h-auto md:max-h-[92dvh] md:rounded-[24px]" : "max-h-[92dvh] rounded-t-[20px] sm:rounded-[20px]",
              widths[width],
            )}
          >
            {bare ? (
              <>
                <h2 id={titleId} className="sr-only">
                  {title}
                </h2>
                {children}
              </>
            ) : (
              <>
            <header className="flex items-center justify-between gap-4 border-b border-border-99 px-6 py-4">
              <h2 id={titleId} className="text-[22px] font-semibold leading-tight">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-offwhite-99 text-black-99 hover:bg-border-99"
              >
                <Icon name="x" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <footer className="border-t border-border-99 px-6 py-4">{footer}</footer>
            )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
