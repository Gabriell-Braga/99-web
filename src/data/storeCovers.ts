import type { Restaurant } from "@/lib/types";
import { restaurants } from "@/data/restaurants";
import { foodPhotos } from "@/data/foodPhotos";

/**
 * Capa de cada loja. Lojas da mesma categoria recebem fotos diferentes, na
 * ordem do catálogo, para duas docerias não aparecerem com o mesmo bolo. Só
 * repete quando a categoria tem mais lojas do que fotos.
 */
const covers = new Map<string, string>();
const usadas = new Map<string, number>();
for (const r of restaurants) {
  const lista = foodPhotos[r.art];
  const n = usadas.get(r.art) ?? 0;
  covers.set(r.slug, lista[n % lista.length]);
  usadas.set(r.art, n + 1);
}

export function storeCover(r: Pick<Restaurant, "slug" | "art">): string {
  return covers.get(r.slug) ?? foodPhotos[r.art][0];
}

/** Recorte transparente do prato da categoria, para a capa da página da loja. */
const cutouts: Partial<Record<Restaurant["art"], string[]>> = {
  burger: ["/food-cut/burger.webp"],
  pizza: ["/food-cut/pizza-2.webp", "/food-cut/pizza.webp"],
  acai: ["/food-cut/acai-2.webp", "/food-cut/acai.webp"],
  marmita: ["/food-cut/marmita-2.webp"],
  sushi: ["/food-cut/sushi.webp", "/food-cut/sushi-2.webp"],
  salad: ["/food-cut/salad.webp", "/food-cut/salad-2.webp"],
  chicken: ["/food-cut/chicken-3.webp"],
  coxinha: ["/food-cut/coxinha.webp", "/food-cut/coxinha-2.webp"],
  dessert: ["/food-cut/dessert-2.webp", "/food-cut/dessert-3.webp"],
  pasta: ["/food-cut/pasta.webp"],
  chinesa: ["/food-cut/chinesa.webp"],
  carne: ["/food-cut/carne.webp"],
  fries: ["/food-cut/fries-2.webp"],
  drink: ["/food-cut/drink.webp"],
};

const cutoutBySlug = new Map<string, string>();
const cortesUsados = new Map<string, number>();
for (const r of restaurants) {
  const lista = cutouts[r.art];
  if (!lista) continue;
  const n = cortesUsados.get(r.art) ?? 0;
  cutoutBySlug.set(r.slug, lista[n % lista.length]);
  cortesUsados.set(r.art, n + 1);
}

/** Recorte da loja, ou undefined quando a categoria não tem recorte (padaria, sorvete, árabe). */
export function storeCutout(r: Pick<Restaurant, "slug">): string | undefined {
  return cutoutBySlug.get(r.slug);
}
