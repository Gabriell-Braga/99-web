import type { Restaurant } from "@/lib/types";
import { cx } from "@/lib/cx";

type Face = "sans" | "serif" | "script" | "display";
type Mark = "flame" | "leaf" | "star" | "sun" | "heart";

interface LogoSpec {
  bg: string;
  fg: string;
  /** Nome em destaque, uma linha por item. */
  lines: string[];
  face: Face;
  /** Linha pequena em caixa alta embaixo, como "SUSHI" ou "PADARIA". */
  sub?: string;
  mark?: Mark;
  /** Cor da marca quando difere do texto. */
  accent?: string;
}

/**
 * Logos das lojas fictícias da demonstração. Nenhuma reproduz marca real: são
 * monogramas desenhados aqui para a miniatura ter cara de logo, não de foto.
 */
const logos: Record<string, LogoSpec> = {
  "braseiro-burger": { bg: "#1E1E1E", fg: "#FF8A00", lines: ["BRASEIRO"], sub: "BURGER", face: "display", mark: "flame" },
  "forno-da-vila": { bg: "#B3261E", fg: "#FFF3E0", lines: ["Forno", "da Vila"], face: "serif" },
  "acai-do-largo": { bg: "#4A1D6B", fg: "#FFFFFF", lines: ["Açaí"], sub: "DO LARGO", face: "script" },
  "marmitaria-da-dona-cida": { bg: "#FFF4E0", fg: "#2E7D32", lines: ["Dona Cida"], sub: "MARMITARIA", face: "script" },
  "kaito-sushi": { bg: "#FFFFFF", fg: "#1E1E1E", lines: ["KAITO"], sub: "SUSHI", face: "display", mark: "sun", accent: "#D32F2F" },
  "verde-leve": { bg: "#2E7D4F", fg: "#FFFFFF", lines: ["verde", "leve"], face: "sans", mark: "leaf", accent: "#B9F6CA" },
  "galeto-do-tio": { bg: "#F9A825", fg: "#3E2723", lines: ["GALETO"], sub: "DO TIO", face: "display" },
  "casa-da-coxinha": { bg: "#FFD54F", fg: "#5D2E0F", lines: ["Casa da", "Coxinha"], face: "script" },
  "doceria-amelie": { bg: "#F8D7E3", fg: "#8E2451", lines: ["Amélie"], sub: "DOCERIA", face: "script" },
  "pasta-e-basta": { bg: "#F5EFE3", fg: "#B71C1C", lines: ["Pasta", "e Basta"], face: "serif" },
  "pizza-na-pedra": { bg: "#263238", fg: "#FFB300", lines: ["PIZZA"], sub: "NA PEDRA", face: "display" },
  "sushi-express": { bg: "#D32F2F", fg: "#FFFFFF", lines: ["SUSHI"], sub: "EXPRESS", face: "sans" },
  "acai-tribo": { bg: "#6A1B9A", fg: "#C6FF00", lines: ["TRIBO"], sub: "DO AÇAÍ", face: "display" },
  "doce-encontro": { bg: "#FFFFFF", fg: "#D81B60", lines: ["Doce", "Encontro"], face: "script", mark: "heart" },
  "panela-caseira": { bg: "#795548", fg: "#FFF8E1", lines: ["Panela"], sub: "CASEIRA", face: "serif" },
  "bowl-e-cia": { bg: "#E8F5E9", fg: "#1B5E20", lines: ["bowl", "& cia"], face: "sans" },
  "wok-do-bairro": { bg: "#C62828", fg: "#FFD54F", lines: ["WOK"], sub: "DO BAIRRO", face: "display" },
  "dragao-dourado": { bg: "#151515", fg: "#D4AF37", lines: ["Dragão"], sub: "DOURADO", face: "serif" },
  "bella-massa": { bg: "#1B5E20", fg: "#FFFFFF", lines: ["Bella", "Massa"], face: "script" },
  fornello: { bg: "#3E2723", fg: "#FFCC80", lines: ["Fornello"], sub: "TRATTORIA", face: "serif" },
  "salgados-tia-rosa": { bg: "#EC407A", fg: "#FFFFFF", lines: ["Tia Rosa"], sub: "SALGADOS", face: "script" },
  "pastel-do-mercado": { bg: "#FFEB3B", fg: "#0D47A1", lines: ["PASTEL"], sub: "DO MERCADO", face: "display" },
  "gelato-bianco": { bg: "#E3F2FD", fg: "#1565C0", lines: ["Gelato", "Bianco"], face: "serif" },
  "polo-norte": { bg: "#0D47A1", fg: "#FFFFFF", lines: ["POLO", "NORTE"], face: "display", mark: "star", accent: "#81D4FA" },
  "padaria-estrela": { bg: "#FFF8E1", fg: "#E65100", lines: ["Estrela"], sub: "PADARIA", face: "serif", mark: "star" },
  "pao-nosso": { bg: "#8D6E63", fg: "#FFFFFF", lines: ["Pão", "Nosso"], face: "script" },
  "brasa-viva": { bg: "#BF360C", fg: "#FFFFFF", lines: ["BRASA"], sub: "VIVA", face: "display", mark: "flame", accent: "#FFCA28" },
  "casa-do-boi": { bg: "#212121", fg: "#FFFFFF", lines: ["Casa", "do Boi"], face: "serif" },
  "beirute-express": { bg: "#00695C", fg: "#FFFFFF", lines: ["BEIRUTE"], sub: "EXPRESS", face: "display" },
  "sabor-do-libano": { bg: "#FFFFFF", fg: "#2E7D32", lines: ["Sabor"], sub: "DO LÍBANO", face: "serif", mark: "leaf", accent: "#C62828" },
};

// Largura média de um caractere em em, por fonte, para o nome caber na caixa.
const faces: Record<Face, { family: string; width: number; weight: number; lead: number; max: number }> = {
  sans: { family: "var(--font-montserrat), sans-serif", width: 0.66, weight: 800, lead: 1, max: 30 },
  serif: { family: "var(--font-serif), Georgia, serif", width: 0.56, weight: 900, lead: 1, max: 30 },
  script: { family: "var(--font-script), cursive", width: 0.58, weight: 400, lead: 1.05, max: 28 },
  display: { family: "var(--font-display), Impact, sans-serif", width: 0.42, weight: 400, lead: 0.9, max: 40 },
};

const marks: Record<Mark, string> = {
  flame: "M12 1c1 4 6 6.5 6 12a6 6 0 0 1-12 0c0-3 2-4.5 2.5-7.5C10 7 11 8.5 11 10.5 12 8 12.5 5 12 1z",
  leaf: "M21 3C10 3 3 8.5 3 16c0 2 .8 4 .8 4s2-5.5 8-9c-4.5 4.5-5.5 7.8-5.5 9C16 20 21 13 21 3z",
  star: "M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.1 5.8 20.9l1.6-7L2 9.2l7.1-.6z",
  sun: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z",
  heart: "M12 21s-9-5.6-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.4-9 12-9 12z",
};

const BOX = 80; // largura útil dentro do quadro de 100
const SUB = 10.5;
const SPACING = 1.6;

/** Logo quadrada da loja. O arredondamento e o tamanho vêm da classe. */
export function StoreLogo({ r, className }: { r: Pick<Restaurant, "slug" | "name" | "tint">; className?: string }) {
  const spec: LogoSpec = logos[r.slug] ?? {
    bg: r.tint,
    fg: "#212121",
    lines: [r.name.split(" ").filter((w) => w.length > 2).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || r.name[0]],
    face: "sans",
  };
  const f = faces[spec.face];
  const longest = Math.max(...spec.lines.map((l) => l.length));
  const size = Math.min(f.max, BOX / (longest * f.width), spec.lines.length > 1 ? 30 : f.max);
  const markSize = spec.mark ? 20 : 0;
  const gap = 4;
  const subSize = spec.sub ? Math.min(SUB, (BOX - SPACING * spec.sub.length) / (spec.sub.length * 0.72)) : 0;

  // Empilha marca, nome e linha pequena e centraliza o conjunto na vertical.
  const textH = spec.lines.length * size * f.lead;
  const total = markSize + (markSize ? gap : 0) + textH + (spec.sub ? gap + subSize : 0);
  let y = (100 - total) / 2;
  const markY = y;
  if (markSize) y += markSize + gap;
  const lineYs = spec.lines.map((_, i) => y + size * f.lead * i + size * 0.8);
  y += textH;
  const subY = y + gap + subSize * 0.82;

  return (
    <div className={cx("overflow-hidden", className)} style={{ background: spec.bg }} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="block h-full w-full">
        {spec.mark && (
          <path
            d={marks[spec.mark]}
            fill={spec.accent ?? spec.fg}
            transform={`translate(${50 - markSize / 2} ${markY}) scale(${markSize / 24})`}
          />
        )}
        <text
          textAnchor="middle"
          fill={spec.fg}
          style={{ fontFamily: f.family, fontWeight: f.weight, fontSize: size, letterSpacing: spec.face === "display" ? 0.5 : 0 }}
        >
          {spec.lines.map((l, i) => (
            <tspan key={i} x={50} y={lineYs[i]}>
              {l}
            </tspan>
          ))}
        </text>
        {spec.sub && (
          <text
            x={50}
            y={subY}
            textAnchor="middle"
            fill={spec.fg}
            style={{ fontFamily: faces.sans.family, fontWeight: 800, fontSize: subSize, letterSpacing: SPACING }}
          >
            {spec.sub}
          </text>
        )}
      </svg>
    </div>
  );
}
