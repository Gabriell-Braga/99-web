"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { saveUserName, useUserName } from "@/lib/useUserName";

/**
 * Boas-vindas na primeira visita: pergunta o nome que aparece no "Olá" do
 * cabeçalho. Faixa amarela com o glifo em cima, como a tela de entrada do app.
 * Pular grava string vazia, e o cabeçalho diz só "Olá!".
 */
export function NameModal() {
  const name = useUserName();
  const open = name === null;
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        saveUserName("");
        return;
      }
      // Foco preso no modal: do último controle volta ao primeiro e vice-versa.
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>("input, button:not([disabled])");
      if (e.key === "Tab" && nodes && nodes.length > 0) {
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (value.trim()) saveUserName(value);
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
        >
          <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={reduce ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-t-[24px] bg-yellow-99 shadow-high sm:rounded-[24px]"
          >
            <div className="flex items-center gap-2 px-6 pb-10 pt-6 text-black-99">
              <Logo variant="glifoPreto" size={36} />
              <span className="text-[17px] font-bold">Web</span>
            </div>
            {/* O branco sobe por cima do amarelo com raio de 24px, como no resto do site. */}
            <form onSubmit={submit} className="-mt-6 rounded-t-[24px] bg-white px-6 pb-6 pt-7">
              <h2 id={titleId} className="text-[26px] font-bold leading-tight text-black-99">
                Como podemos te chamar?
              </h2>
              <p className="mt-2 text-[15px] text-secondary-99">
                Seu nome aparece na saudação lá em cima. Fica só neste navegador.
              </p>
              <Input
                ref={inputRef}
                label="Nome"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoComplete="given-name"
                maxLength={30}
                placeholder="Ex.: Ana"
                wrapperClassName="mt-6"
              />
              <div className="mt-6 flex flex-col gap-2">
                <Button type="submit" size="lg" full disabled={!value.trim()}>
                  Continuar
                </Button>
                <Button variant="text" size="lg" full onClick={() => saveUserName("")}>
                  Agora não
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
