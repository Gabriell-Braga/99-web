import type { Restaurant } from "@/lib/types";
import { storeBrandColor } from "@/components/comida/StoreLogo";
import { storeCover, storeCutout } from "@/data/storeCovers";
import { cx } from "@/lib/cx";

/**
 * Capa da página da loja na cor da marca, com o prato recortado saindo pela
 * borda direita, como os banners amarelos do Food. Categoria sem recorte usa
 * a foto na metade direita, esmaecendo para a cor da marca.
 */
export function StoreCover({ r, className }: { r: Restaurant; className?: string }) {
  const cor = storeBrandColor(r);
  const recorte = storeCutout(r);
  return (
    <div className={cx("overflow-hidden", !r.open && "grayscale", className)} style={{ background: cor }} aria-hidden="true">
      {/* Luz suave atrás do prato, para o recorte não ficar chapado no fundo. */}
      <span className="absolute -right-10 top-1/2 h-[140%] w-[60%] -translate-y-1/2 rounded-full bg-white/20 blur-2xl" />
      {/* Pontilhado discreto na metade esquerda. */}
      <span
        className="absolute inset-y-0 left-0 w-1/2 opacity-[0.12] [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px] [mask-image:linear-gradient(90deg,#000,transparent)]"
        style={{ color: "#000" }}
      />
      {recorte ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recorte}
          alt=""
          className="absolute -bottom-[18%] right-[4%] h-[125%] max-w-[62%] object-contain drop-shadow-[0_16px_20px_rgba(0,0,0,0.3)]"
          fetchPriority="high"
          decoding="async"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={storeCover(r)}
          alt=""
          className="absolute inset-y-0 right-0 h-full w-[60%] object-cover [mask-image:linear-gradient(90deg,transparent,#000_45%)]"
          fetchPriority="high"
          decoding="async"
        />
      )}
    </div>
  );
}
