"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";

interface MapPanelLayoutProps {
  panel: ReactNode;
  map: ReactNode;
  /** Barra de ação fixa no rodapé do painel. */
  footer?: ReactNode;
  panelWidth?: "md" | "lg";
}

/**
 * Folha inferior do app traduzida para a web: painel de 480px à esquerda com
 * rolagem própria e o mapa ocupando o resto. Abaixo de lg volta ao arranjo do
 * app, com o mapa em cima e a folha branca subindo por cima com raio de 24px.
 */
export function MapPanelLayout({ panel, map, footer, panelWidth = "md" }: MapPanelLayoutProps) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-1 flex-col lg:h-[calc(100dvh-48px)] lg:flex-none lg:flex-row lg:items-stretch lg:overflow-hidden lg:rounded-tl-[24px]">
      <div className="relative h-[280px] shrink-0 lg:order-2 lg:h-auto lg:min-h-0 lg:flex-1">
        <div className="absolute inset-0">{map}</div>
      </div>
      <motion.aside
        initial={reduce ? false : { x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
        className={cx(
          "relative z-10 -mt-6 flex w-full min-w-0 shrink-0 flex-col rounded-t-[24px] bg-white shadow-high lg:order-1 lg:mt-0 lg:min-h-0 lg:rounded-none lg:shadow-none",
          panelWidth === "lg" ? "lg:w-[640px] xl:w-[720px]" : "lg:w-[480px]",
        )}
      >
        <div className="panel-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">{panel}</div>
        {footer && (
          <div className="sticky bottom-0 border-t border-border-99 bg-white px-4 py-4 md:px-8">{footer}</div>
        )}
      </motion.aside>
    </div>
  );
}
