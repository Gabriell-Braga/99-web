import type { PackageSize, RideCategory } from "@/lib/types";

type Category = RideCategory["id"] | PackageSize;

/** Renders em `public/vehicles/`. A sombra já está na imagem. */
const image: Record<Category, string> = {
  pop: "/vehicles/car-white.png",
  "pop-expresso": "/vehicles/car-white.png",
  negocia: "/vehicles/car-white.png",
  moto: "/vehicles/moto-white.png",
  taxi: "/vehicles/car-yellow.png",
  "entrega-moto": "/vehicles/moto-box.png",
  carro: "/vehicles/car-box.png",
};

/** Raio amarelo em círculo preto: Pop Expresso. */
function BoltBadge() {
  return (
    <span
      className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black-99"
      aria-hidden="true"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#FFDD00">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
      </svg>
    </span>
  );
}

/** Aperto de mãos verde com cifrão: Negocia. */
function HandshakeBadge() {
  return (
    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M2 8.5 6.5 5l5 2.5 2-1.5L18 8l4 1.5v6l-3 1.5-4.5 3.5-3-1-3 1L2 14.5v-6Z" fill="#00803D" />
        <path d="M11.5 7.5 8 11l2.5 2 3.5-3M12 13l3 2.5M9.5 14.5l2.5 2" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" fill="none" />
        <circle cx="17.5" cy="17.5" r="5.5" fill="#00803D" stroke="#fff" strokeWidth="1" />
        <text x="17.5" y="20.3" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#fff" fontFamily="Montserrat, sans-serif">
          $
        </text>
      </svg>
    </span>
  );
}

/** Imagem da categoria com 64px de largura, mais o selo de Pop Expresso ou Negocia. */
export function VehicleArt({ category, width = 64 }: { category: Category; width?: number }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width, height: width }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image[category]}
        alt=""
        width={width}
        height={width}
        className="block h-full w-full object-contain"
        loading="lazy"
        decoding="async"
      />
      {category === "pop-expresso" && <BoltBadge />}
      {category === "negocia" && <HandshakeBadge />}
    </span>
  );
}
