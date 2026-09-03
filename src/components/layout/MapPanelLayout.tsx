import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

interface MapPanelLayoutProps {
  panel: ReactNode;
  map: ReactNode;
  /** Rodapé fixo do painel, com o CTA principal. */
  footer?: ReactNode;
  panelWidth?: "md" | "lg";
}

/**
 * Arquétipo "mapa e painel": painel de formulário fixo à esquerda com rolagem
 * própria, mapa ocupando o resto da largura. Abaixo de lg, o mapa vai para
 * cima com 280px e o painel ocupa a largura inteira.
 */
export function MapPanelLayout({ panel, map, footer, panelWidth = "md" }: MapPanelLayoutProps) {
  return (
    <div className="flex flex-1 flex-col lg:h-[calc(100dvh-72px)] lg:flex-none lg:flex-row lg:items-stretch lg:overflow-hidden">
      <div className="relative h-[280px] shrink-0 lg:order-2 lg:h-auto lg:min-h-0 lg:flex-1">
        <div className="absolute inset-0">{map}</div>
      </div>
      <aside
        className={cx(
          "relative z-10 flex w-full min-w-0 shrink-0 flex-col bg-white lg:order-1 lg:min-h-0 lg:shadow-high",
          panelWidth === "lg" ? "lg:w-[640px] xl:w-[720px]" : "lg:w-[480px]",
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">{panel}</div>
        {footer && (
          <div className="sticky bottom-0 border-t border-border-99 bg-white px-4 py-4 md:px-8">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
