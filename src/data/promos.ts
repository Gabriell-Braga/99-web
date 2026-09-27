import type { FoodCategoryId } from "@/lib/types";

export interface Promo {
  id: string;
  title: string;
  /** Selo de preço "a partir de" em destaque, como no banner do app. */
  price?: { reais: string; centavos: string };
  /** Recortes em PNG/WebP transparente, em public/food-cut. O primeiro fica na frente. */
  images: string[];
  /** Mancha lilás atrás da comida, como no banner "Burger da madrugada". */
  blob?: boolean;
  /** Categoria que o banner abre na listagem. */
  category: FoodCategoryId;
}

/**
 * Banners de demonstração, todos no amarelo do app, com a comida recortada
 * saindo da borda. Campanha e valores são fictícios: o protótipo não reproduz
 * nenhuma promoção real da 99.
 */
export const promos: Promo[] = [
  {
    id: "larica",
    title: "Larica da madrugada",
    price: { reais: "14", centavos: "99" },
    images: ["/food-cut/pizza-2.webp"],
    category: "pizza",
  },
  {
    id: "burger",
    title: "Burger da madrugada",
    images: ["/food-cut/burger.webp", "/food-cut/fries-2.webp"],
    blob: true,
    category: "lanche",
  },
  {
    id: "pizza",
    title: "Japa pra dois",
    price: { reais: "59", centavos: "90" },
    images: ["/food-cut/sushi.webp"],
    category: "japonesa",
  },
  {
    id: "acai",
    title: "Açaí no capricho",
    images: ["/food-cut/acai-2.webp"],
    blob: true,
    category: "acai",
  },
  {
    id: "doce",
    title: "Sobremesa por conta",
    price: { reais: "12", centavos: "90" },
    images: ["/food-cut/dessert-2.webp"],
    category: "doces",
  },
];
