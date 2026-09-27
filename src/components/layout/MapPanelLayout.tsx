"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
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
   * Tela de fluxo: abaixo de lg o cabeçalho amarelo sai e um botão redondo de
   * voltar fica sobre o mapa (ou no topo do painel, sem mapa).
   */
  onBack?: () => void;
  /** Título da tela, ao lado do voltar no celular e no topo do painel no desktop. */
  title?: string;
  /** "subtle": fundo cinza com cartões brancos, como as telas de detalhes do app. */
  tone?: "white" | "subtle";
}

/**
 * Folha inferior do app traduzida para a web. No desktop, painel à esquerda com
 * rolagem própria e o mapa ocupando o resto.
 *
 * Abaixo de lg, com mapa, a folha é uma gaveta: o mapa ocupa a tela e a folha
 * começa mostrando pouco mais da metade de baixo. Puxando para cima ela sobe até
 * o topo e o conteúdo continua rolando; puxando para baixo volta. É rolagem
 * nativa com pontos de encaixe, então o arraste tem a inércia e a mola do
 * próprio sistema. Enquanto sobe, o mapa escurece e os cantos se endireitam.
 */
export function MapPanelLayout({ panel, map, footer, panelWidth = "md", mapHiddenOnMobile, onBack, title, tone = "white" }: MapPanelLayoutProps) {
  const reduce = useReducedMotion();
  const stacked = Boolean(onBack);
  const sheet = !mapHiddenOnMobile;
  useStackedScreen(stacked || sheet);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  // Altura do mapa livre com a gaveta recolhida; é também o quanto ela sobe.
  const [rest, setRest] = useState(0);
  const { scrollY } = useScroll({ container: scrollerRef });
  const radius = useTransform(scrollY, (v) => {
    if (!rest) return "24px";
    const left = rest - v;
    return `${Math.max(0, Math.min(24, (left / 56) * 24))}px`;
  });
  const dim = useTransform(scrollY, (v) => (rest ? Math.min(1, Math.max(0, v / rest)) * 0.4 : 0));
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const spacer = spacerRef.current;
    if (!sheet || !spacer) return;
    const measure = () => setRest(spacer.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(spacer);
    return () => ro.disconnect();
  }, [sheet]);

  useEffect(() => scrollY.on("change", (v) => setExpanded(rest > 0 && v >= rest - 4)), [scrollY, rest]);

  function toggleSheet() {
    scrollerRef.current?.scrollTo({ top: expanded ? 0 : rest, behavior: reduce ? "auto" : "smooth" });
  }

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
    <div
      className={cx(
        "flex flex-1 flex-col lg:h-[calc(100dvh-72px)] lg:flex-none lg:flex-row lg:items-stretch lg:overflow-hidden lg:rounded-tl-[24px]",
        // No celular a tela vira uma camada só: mapa atrás, gaveta na frente.
        sheet && "max-lg:fixed max-lg:inset-0 max-lg:z-20 max-lg:overflow-hidden max-lg:bg-white",
      )}
    >
      <div
        className={cx(
          "relative shrink-0 lg:order-2 lg:block lg:h-auto lg:min-h-0 lg:flex-1",
          // O mapa cobre a área livre e um pouco sob o raio da gaveta.
          sheet ? "max-lg:absolute max-lg:inset-x-0 max-lg:top-0 max-lg:h-[calc(46dvh+24px)]" : "h-[280px]",
          mapHiddenOnMobile && "hidden",
        )}
      >
        <div className="absolute inset-0">{map}</div>
        {back && <div className="absolute left-4 top-4 z-10 lg:hidden">{back}</div>}
        {sheet && (
          <motion.div aria-hidden="true" style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black lg:hidden" />
        )}
      </div>

      {/* Trilho da gaveta: rola por cima do mapa sem capturar o toque nele. */}
      <div
        ref={scrollerRef}
        className={cx(
          sheet
            ? "sheet-scroller max-lg:pointer-events-none max-lg:absolute max-lg:inset-0 max-lg:snap-y max-lg:snap-mandatory max-lg:overflow-y-auto max-lg:overscroll-contain lg:contents"
            : "contents",
        )}
      >
        {sheet && <div ref={spacerRef} aria-hidden="true" className="h-[46dvh] shrink-0 snap-start lg:hidden" />}
        <motion.aside
          initial={reduce ? false : { x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
          style={sheet ? ({ "--sheet-radius": radius } as unknown as CSSProperties) : undefined}
          className={cx(
            "relative z-10 flex w-full min-w-0 shrink-0 flex-col lg:order-1 lg:mt-0 lg:min-h-0 lg:rounded-none lg:shadow-none",
            sheet
              ? "max-lg:pointer-events-auto max-lg:min-h-dvh max-lg:snap-start max-lg:rounded-t-[var(--sheet-radius)] max-lg:shadow-[0_-8px_24px_rgba(0,0,0,0.12)] max-lg:motion-safe:animate-[sheet-in_520ms_cubic-bezier(0.32,0.72,0,1)]"
              : cx("max-lg:flex-1", !stacked && "rounded-t-[24px]"),
            tone === "subtle" ? "bg-subtle-99" : "bg-white",
            panelWidth === "lg" ? "lg:w-[640px] xl:w-[720px]" : "lg:w-[480px]",
          )}
        >
          {sheet && (
            <button
              type="button"
              onClick={toggleSheet}
              aria-label={expanded ? "Recolher painel" : "Expandir painel"}
              aria-expanded={expanded}
              className="flex h-6 w-full shrink-0 cursor-grab items-center justify-center rounded-t-[inherit] lg:hidden"
            >
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-border-99" />
            </button>
          )}
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
          {/* Na gaveta quem rola é o trilho; no desktop, o próprio painel. */}
          <div className={cx("panel-scroll min-h-0 flex-1 px-4 md:px-8", sheet ? "pb-6 pt-2 lg:overflow-y-auto lg:pt-6" : "overflow-y-auto py-6")}>
            {panel}
          </div>
          {footer && (
            <div className="sticky bottom-0 z-10 border-t border-border-99 bg-white px-4 py-4 md:px-8">{footer}</div>
          )}
        </motion.aside>
      </div>
    </div>
  );
}
