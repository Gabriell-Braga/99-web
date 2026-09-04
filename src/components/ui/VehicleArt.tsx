import type { VehicleArt as Kind } from "@/lib/types";

/**
 * Ilustrações dos veículos e do pacote, no espírito das isométricas do app:
 * moto e carro brancos com rodas amarelas, caixa marrom com fita amarela.
 */
export function VehicleArt({ kind, size = 64 }: { kind: Kind; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      {kind === "car" && (
        <g>
          <path d="M8 40c0-3 1-5 3-6l7-11c1-2 3-3 5-3h18c2 0 4 1 5 3l7 11c2 1 3 3 3 6v6H8v-6Z" fill="#FFFFFF" stroke="#212121" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M13 34h38" stroke="#212121" strokeWidth="2.2" />
          <path d="M18 34l4-9h20l4 9" fill="#EDEFF2" stroke="#212121" strokeWidth="2" strokeLinejoin="round" />
          <path d="M32 25v9" stroke="#212121" strokeWidth="2" />
          <circle cx="19" cy="47" r="6" fill="#FFDD00" stroke="#212121" strokeWidth="2.2" />
          <circle cx="45" cy="47" r="6" fill="#FFDD00" stroke="#212121" strokeWidth="2.2" />
          <circle cx="19" cy="47" r="2" fill="#212121" />
          <circle cx="45" cy="47" r="2" fill="#212121" />
          <rect x="10" y="38" width="5" height="3" rx="1.5" fill="#FFDD00" stroke="#212121" strokeWidth="1.5" />
          <rect x="49" y="38" width="5" height="3" rx="1.5" fill="#FC4C02" stroke="#212121" strokeWidth="1.5" />
        </g>
      )}
      {kind === "moto" && (
        <g>
          <circle cx="16" cy="44" r="8" fill="#FFDD00" stroke="#212121" strokeWidth="2.2" />
          <circle cx="48" cy="44" r="8" fill="#FFDD00" stroke="#212121" strokeWidth="2.2" />
          <circle cx="16" cy="44" r="2.5" fill="#212121" />
          <circle cx="48" cy="44" r="2.5" fill="#212121" />
          <path d="M16 44 26 28h12l6 10h4" fill="none" stroke="#212121" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 34h16l4 8H18l4-8Z" fill="#FFFFFF" stroke="#212121" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M38 28l3-6h5M26 28h-6" stroke="#212121" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="28" y="18" width="14" height="6" rx="3" fill="#FFFFFF" stroke="#212121" strokeWidth="2" />
          <path d="M44 34l4 10" stroke="#212121" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
      {kind === "box" && (
        <g>
          <path d="M10 22 32 12l22 10v20L32 52 10 42V22Z" fill="#B87333" stroke="#212121" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M10 22l22 10 22-10M32 32v20" stroke="#212121" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M32 32v20" stroke="#FFDD00" strokeWidth="4" />
          <path d="M10 22l22 10 22-10" stroke="#FFDD00" strokeWidth="4" />
          <path d="M10 22 32 12l22 10v20L32 52 10 42V22Z" fill="none" stroke="#212121" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M32 32v20M10 22l22 10 22-10" stroke="#212121" strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}
