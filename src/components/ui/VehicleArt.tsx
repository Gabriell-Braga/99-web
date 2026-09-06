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
  carro: "/vehicles/car-box.png",
};

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
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black-99 text-yellow-99"
          aria-hidden="true"
        >
          <Icon name="bolt" size={13} />
        </span>
      )}
      {category === "negocia" && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center text-green-99" aria-hidden="true">
          <Icon name="handshake" size={20} />
        </span>
      )}
    </span>
  );
}
