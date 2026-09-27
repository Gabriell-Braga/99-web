"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/Icon";
import { useStackedScreen } from "@/lib/useStackedScreen";

interface MapPanelLayoutProps {
  panel: ReactNode;
  map: ReactNode;
  /** Barra de ação fixa no rodapé do painel. */
  footer?: ReactNode;
  panelWidth?: "md" | "lg";
  /** Abaixo de lg o mapa sai e o painel ocupa a tela, como nas telas iniciais do app. */
  mapHiddenOnMobile?: boolean;
  /**
   * Tela de fluxo: abaixo de lg o cabeçalho amarelo sai, o mapa vai até o topo e
   * um botão redondo de voltar fica por cima dele (ou no topo do painel, sem mapa).
   */
  onBack?: () => void;
  /** Título da tela, ao lado do voltar no celular e no topo do painel no desktop. */
  title?: string;
  /** "subtle": fundo cinza com cartões brancos, como as telas de detalhes do app. */
  tone?: "white" | "subtle";
}

/**
 * Folha inferior do app traduzida para a web: painel de 480px à esquerda com
 * rolagem própria e o mapa ocupando o resto. Abaixo de lg volta ao arranjo do
 * app, com o mapa em cima e a folha branca subindo por cima com raio de 24px.
 */
export function MapPanelLayout({ panel, map, footer, panelWidth = "md", mapHiddenOnMobile, onBack, title, tone = "white" }: MapPanelLayoutProps) {
  const reduce = useReducedMotion();
  const stacked = Boolean(onBack);
  useStackedScreen(stacked);

  const back = onBack && (
    <button
      type="button"
      onClick={onBack}
      aria-label="Voltar"
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black-99 shadow-high transition-colors hover:bg-offwhite-99"
    >
      <Icon name="arrowLeft" size={26} />
    </button>
  );

  return (
    <div className="flex flex-1 flex-col lg:h-[calc(100dvh-72px)] lg:flex-none lg:flex-row lg:items-stretch lg:overflow-hidden lg:rounded-tl-[24px]">
      <div
        className={cx(
          "relative shrink-0 lg:order-2 lg:block lg:h-auto lg:min-h-0 lg:flex-1",
          // Sem o cabeçalho, a página começa 24px acima da tela (a folha branca do
          // layout sobe por cima dele); o mapa compensa na altura.
          stacked ? "h-[calc(44dvh+24px)]" : "h-[280px]",
          mapHiddenOnMobile && "hidden",
        )}
      >
        <div className="absolute inset-0">{map}</div>
        {back && <div className="absolute left-4 top-10 z-10 lg:hidden">{back}</div>}
      </div>
      <motion.aside
        initial={reduce ? false : { x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
        className={cx(
          "relative z-10 flex w-full min-w-0 shrink-0 flex-col lg:order-1 lg:mt-0 lg:min-h-0 lg:rounded-none lg:shadow-none",
          mapHiddenOnMobile ? cx("max-lg:flex-1", !stacked && "rounded-t-[24px]") : "-mt-6 rounded-t-[24px] shadow-high",
          tone === "subtle" ? "bg-subtle-99" : "bg-white",
          panelWidth === "lg" ? "lg:w-[640px] xl:w-[720px]" : "lg:w-[480px]",
        )}
      >
        {!mapHiddenOnMobile && <span aria-hidden="true" className="mx-auto mt-2 block h-1 w-10 shrink-0 rounded-full bg-border-99 lg:hidden" />}
        {(title || (mapHiddenOnMobile && onBack)) && (
          // Barra da tela: voltar e título na mesma linha, como no app. No desktop fica só o título.
          <div className={cx("flex items-center gap-2 px-2 md:px-6 lg:px-8 lg:pt-6", mapHiddenOnMobile && onBack ? "pt-10" : "pt-4")}>
            {mapHiddenOnMobile && onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Voltar"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-black-99 transition-colors hover:bg-black-99/5 lg:hidden"
              >
                <Icon name="chevronLeft" size={30} />
              </button>
            )}
            {title && (
              <h1 className="min-w-0 flex-1 truncate pr-11 text-center text-[21px] font-bold min-[400px]:text-[22px] lg:pr-0 lg:text-left lg:text-[24px]">{title}</h1>
            )}
          </div>
        )}
        <div className="panel-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">{panel}</div>
        {footer && (
          <div className="sticky bottom-0 border-t border-border-99 bg-white px-4 py-4 md:px-8">{footer}</div>
        )}
      </motion.aside>
    </div>
  );
}
