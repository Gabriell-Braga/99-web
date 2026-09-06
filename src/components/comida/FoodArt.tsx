import type { ArtKind } from "@/lib/types";
import { foodPhoto } from "@/data/foodPhotos";
import { cx } from "@/lib/cx";

/**
 * Ilustrações planas em SVG para pratos e lojas, usadas onde a foto não cabe,
 * como o ícone de 24px dos chips de categoria.
 */
function Art({ kind }: { kind: ArtKind }) {
  switch (kind) {
    case "burger":
      return (
        <g>
          <path d="M20 42c0-14 12-22 30-22s30 8 30 22H20Z" fill="#E9A23B" />
          <circle cx="36" cy="30" r="1.6" fill="#FFF3D6" />
          <circle cx="50" cy="26" r="1.6" fill="#FFF3D6" />
          <circle cx="63" cy="31" r="1.6" fill="#FFF3D6" />
          <rect x="18" y="42" width="64" height="6" rx="3" fill="#6FAE4B" />
          <rect x="22" y="48" width="56" height="8" rx="2" fill="#7A3B22" />
          <path d="M22 56h56v4c0 2-2 4-4 4H26c-2 0-4-2-4-4v-4Z" fill="#F4C542" />
          <path d="M20 64h60c0 8-6 12-14 12H34c-8 0-14-4-14-12Z" fill="#E9A23B" />
        </g>
      );
    case "pizza":
      return (
        <g>
          <circle cx="50" cy="50" r="32" fill="#E9A23B" />
          <circle cx="50" cy="50" r="26" fill="#D94F3A" />
          <circle cx="50" cy="50" r="24" fill="#F6D46B" />
          <circle cx="40" cy="42" r="5" fill="#C93A2E" />
          <circle cx="58" cy="40" r="5" fill="#C93A2E" />
          <circle cx="50" cy="58" r="5" fill="#C93A2E" />
          <circle cx="62" cy="56" r="4" fill="#C93A2E" />
          <path d="M36 56l6-2M54 48l6 3M44 32l4 4" stroke="#5D8A3A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 50 L82 50 A32 32 0 0 0 73 27 Z" fill="#F4F4F2" opacity="0.6" />
        </g>
      );
    case "acai":
      return (
        <g>
          <path d="M28 34h44l-4 40c0 4-4 6-8 6H40c-4 0-8-2-8-6l-4-40Z" fill="#F4F4F2" stroke="#D9D9D9" strokeWidth="2" />
          <path d="M31 40h38l-3 30c0 3-3 5-6 5H40c-3 0-6-2-6-5l-3-30Z" fill="#5B2A86" />
          <ellipse cx="50" cy="40" rx="19" ry="4" fill="#7B45A8" />
          <circle cx="42" cy="46" r="4" fill="#F6D46B" />
          <circle cx="56" cy="47" r="3.5" fill="#F6D46B" />
          <circle cx="49" cy="52" r="3" fill="#E6C58E" />
          <rect x="58" y="18" width="4" height="30" rx="2" fill="#B3B3B3" transform="rotate(12 60 33)" />
        </g>
      );
    case "marmita":
      return (
        <g>
          <rect x="18" y="30" width="64" height="44" rx="10" fill="#E9E8E9" />
          <rect x="22" y="34" width="56" height="36" rx="8" fill="#F4F4F2" />
          <rect x="26" y="38" width="24" height="28" rx="6" fill="#F6E7C1" />
          <rect x="52" y="38" width="22" height="13" rx="5" fill="#7A3B22" />
          <rect x="52" y="53" width="22" height="13" rx="5" fill="#6FAE4B" />
          <circle cx="32" cy="46" r="2" fill="#E9A23B" />
          <circle cx="42" cy="56" r="2" fill="#E9A23B" />
          <circle cx="38" cy="50" r="1.5" fill="#D94F3A" />
        </g>
      );
    case "sushi":
      return (
        <g>
          <ellipse cx="36" cy="60" rx="16" ry="10" fill="#F4F4F2" stroke="#D9D9D9" strokeWidth="2" />
          <ellipse cx="36" cy="54" rx="14" ry="7" fill="#F2865E" />
          <ellipse cx="64" cy="46" rx="14" ry="10" fill="#212121" />
          <ellipse cx="64" cy="44" rx="10" ry="6" fill="#F4F4F2" />
          <circle cx="64" cy="44" r="3.5" fill="#F2865E" />
          <path d="M54 66h20" stroke="#6FAE4B" strokeWidth="3" strokeLinecap="round" />
          <rect x="22" y="30" width="3" height="26" rx="1.5" fill="#B3B3B3" transform="rotate(-20 23 43)" />
          <rect x="28" y="30" width="3" height="26" rx="1.5" fill="#B3B3B3" transform="rotate(-20 29 43)" />
        </g>
      );
    case "salad":
      return (
        <g>
          <path d="M22 46h56c0 16-12 28-28 28S22 62 22 46Z" fill="#F4F4F2" stroke="#D9D9D9" strokeWidth="2" />
          <circle cx="36" cy="42" r="8" fill="#6FAE4B" />
          <circle cx="50" cy="36" r="9" fill="#8BC34A" />
          <circle cx="64" cy="42" r="8" fill="#6FAE4B" />
          <circle cx="44" cy="46" r="4" fill="#D94F3A" />
          <circle cx="58" cy="47" r="4" fill="#D94F3A" />
          <ellipse cx="50" cy="44" rx="6" ry="3" fill="#F6D46B" />
        </g>
      );
    case "coxinha":
      return (
        <g>
          <path d="M50 22c14 10 22 26 22 40 0 8-8 14-22 14S28 70 28 62c0-14 8-30 22-40Z" fill="#E9A23B" />
          <path d="M50 26c10 10 16 22 16 34 0 5-6 10-16 10s-16-5-16-10c0-12 6-24 16-34Z" fill="#F4C542" opacity="0.6" />
          <circle cx="42" cy="56" r="1.5" fill="#B87020" />
          <circle cx="56" cy="50" r="1.5" fill="#B87020" />
          <circle cx="50" cy="64" r="1.5" fill="#B87020" />
        </g>
      );
    case "dessert":
      return (
        <g>
          <path d="M24 44h52l-6 30c0 3-3 5-6 5H36c-3 0-6-2-6-5l-6-30Z" fill="#7A3B22" />
          <path d="M24 44h52v6H24z" fill="#5B2A1A" />
          <path d="M28 36h44c0 6-4 10-8 10H36c-4 0-8-4-8-10Z" fill="#F4F4F2" />
          <circle cx="50" cy="30" r="5" fill="#D94F3A" />
          <path d="M50 25v-6" stroke="#6FAE4B" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "drink":
      return (
        <g>
          <path d="M34 26h32l-4 46c0 3-3 5-6 5H44c-3 0-6-2-6-5l-4-46Z" fill="#F4F4F2" stroke="#D9D9D9" strokeWidth="2" />
          <path d="M37 40h26l-3 30c0 2-2 4-4 4H44c-2 0-4-2-4-4l-3-30Z" fill="#F4C542" />
          <rect x="52" y="16" width="4" height="34" rx="2" fill="#D94F3A" transform="rotate(10 54 33)" />
          <circle cx="44" cy="52" r="3" fill="#F4F4F2" opacity="0.7" />
          <circle cx="54" cy="60" r="2" fill="#F4F4F2" opacity="0.7" />
        </g>
      );
    case "fries":
      return (
        <g>
          <rect x="38" y="20" width="6" height="34" rx="3" fill="#F4C542" transform="rotate(-8 41 37)" />
          <rect x="48" y="16" width="6" height="38" rx="3" fill="#F4C542" />
          <rect x="58" y="20" width="6" height="34" rx="3" fill="#F4C542" transform="rotate(8 61 37)" />
          <rect x="30" y="26" width="6" height="30" rx="3" fill="#E9A23B" transform="rotate(-14 33 41)" />
          <rect x="66" y="26" width="6" height="30" rx="3" fill="#E9A23B" transform="rotate(14 69 41)" />
          <path d="M28 46h44l-4 30c0 2-2 4-4 4H36c-2 0-4-2-4-4l-4-30Z" fill="#D94F3A" />
          <path d="M28 46h44v6H28z" fill="#C93A2E" />
        </g>
      );
    case "chicken":
      return (
        <g>
          <ellipse cx="46" cy="52" rx="24" ry="18" fill="#D98B3A" />
          <ellipse cx="42" cy="48" rx="18" ry="12" fill="#E9A23B" opacity="0.7" />
          <path d="M66 46l12-10M70 40l6 2M72 38l-2 6" stroke="#F4F4F2" strokeWidth="5" strokeLinecap="round" />
          <circle cx="36" cy="54" r="1.5" fill="#B87020" />
          <circle cx="50" cy="60" r="1.5" fill="#B87020" />
        </g>
      );
    case "pasta":
      return (
        <g>
          <path d="M20 50h60c0 14-12 26-30 26S20 64 20 50Z" fill="#F4F4F2" stroke="#D9D9D9" strokeWidth="2" />
          <path d="M28 50c6-10 14-10 20 0s14 10 20 0" stroke="#F4C542" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M26 44c6-10 14-10 20 0s14 10 22 0" stroke="#E9A23B" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M30 38c6-8 12-8 18 0s12 8 20 0" stroke="#F4C542" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="44" cy="44" r="4" fill="#D94F3A" />
          <circle cx="58" cy="42" r="4" fill="#D94F3A" />
          <path d="M50 36l4-4" stroke="#6FAE4B" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      );
  }
}

interface FoodArtProps {
  kind: ArtKind;
  tint?: string;
  className?: string;
  /** Escala da ilustração dentro do quadro. */
  scale?: number;
  /** Foto real do prato. Desligue onde o quadro é pequeno demais para ela. */
  photo?: boolean;
  /** Carrega na hora, para a foto que abre a página não entrar como conteúdo adiado. */
  eager?: boolean;
}

/**
 * Quadro do prato. Por padrão mostra a foto servida de public/food, com a
 * ilustração como alternativa. As fotos vêm do Wikimedia Commons e os créditos
 * ficam no rodapé.
 */
export function FoodArt({ kind, tint = "#F1F1F1", className, scale = 1, photo = true, eager }: FoodArtProps) {
  if (photo) {
    return (
      <div className={cx("overflow-hidden", className)} style={{ background: tint }} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foodPhoto[kind]}
          alt=""
          className="h-full w-full object-cover"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          decoding="async"
        />
      </div>
    );
  }
  return (
    <div
      className={cx("flex items-center justify-center overflow-hidden", className)}
      style={{ background: tint }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" style={{ transform: `scale(${scale})` }}>
        <Art kind={kind} />
      </svg>
    </div>
  );
}
