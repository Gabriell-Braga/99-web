import type { ArtKind } from "@/lib/types";
import { pickPhoto } from "@/data/foodPhotos";
import { cx } from "@/lib/cx";

interface FoodArtProps {
  kind: ArtKind;
  /** Cor de fundo enquanto a foto carrega. */
  tint?: string;
  className?: string;
  /** Carrega na hora, para a foto que abre a página não entrar como conteúdo adiado. */
  eager?: boolean;
  /** Slug da loja ou id do prato: decide qual variante da foto aparece. */
  seed?: string;
  /** Posição no cardápio: garante variantes diferentes em pratos vizinhos. */
  index?: number;
}

/**
 * Quadro do prato ou da loja, sempre com foto real servida de public/food. As
 * imagens são de licença livre e os créditos ficam no rodapé.
 */
export function FoodArt({ kind, tint = "#F1F1F1", className, eager, seed, index }: FoodArtProps) {
  return (
    <div className={cx("overflow-hidden", className)} style={{ background: tint }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={pickPhoto(kind, seed, index)}
        alt=""
        className="h-full w-full object-cover"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
      />
    </div>
  );
}
