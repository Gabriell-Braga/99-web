import type { PackageSize, RideCategory } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";

type Category = RideCategory["id"] | PackageSize;

/** Renders em `public/vehicles/`. A sombra já está na imagem. */
const image: Record<Category, string> = {
  pop: "/vehicles/car-white.png",
  "pop-expresso": "/vehicles/car-white.png",
  negocia: "/vehicles/car-white.png",
  moto: "/vehicles/moto-white.png",
  taxi: "/vehicles/car-yellow.png",
  "entrega-moto": "/vehicles/moto-box.png",
  "entrega-carro": "/vehicles/car-box.png",
  carro: "/vehicles/car-box.png",
};

/** Selo no canto superior direito da imagem, sem fundo. */
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center" aria-hidden="true">
      {children}
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
      {category === "pop-expresso" && (
        <Badge>
          <Icon name="boltFill" size={20} className="text-yellow-99-deep" />
        </Badge>
      )}
      {category === "negocia" && (
        <Badge>
          <Icon name="handshakeFill" size={20} className="text-green-99" />
        </Badge>
      )}
    </span>
  );
}
