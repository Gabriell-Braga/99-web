import type { FoodCategory } from "@/lib/types";

/** Trilho de categorias do 99 Food, na ordem do app. Arte em public/food-icons. */
export const foodCategories: FoodCategory[] = [
  { id: "chinesa", label: "Chinesa", icon: "/food-icons/chinesa.webp" },
  { id: "italiana", label: "Italiana", icon: "/food-icons/italiana.webp" },
  { id: "doces", label: "Doces", icon: "/food-icons/doces.webp" },
  { id: "marmita", label: "Marmita", icon: "/food-icons/marmita.webp" },
  { id: "japonesa", label: "Japonesa", icon: "/food-icons/japonesa.webp" },
  { id: "salgados", label: "Salgados", icon: "/food-icons/salgados.webp" },
  { id: "lanche", label: "Lanches", icon: "/food-icons/lanches.webp" },
  { id: "acai", label: "Açaí", icon: "/food-icons/acai.webp" },
  { id: "sorvetes", label: "Sorvetes", icon: "/food-icons/sorvetes.webp" },
  { id: "padarias", label: "Padarias", icon: "/food-icons/padarias.webp" },
  { id: "pizza", label: "Pizza", icon: "/food-icons/pizza.webp" },
  { id: "carnes", label: "Carnes", icon: "/food-icons/carnes.webp" },
  { id: "brasileira", label: "Brasileira", icon: "/food-icons/brasileira.webp" },
  { id: "saudavel", label: "Saudável", icon: "/food-icons/saudavel.webp" },
  { id: "arabe", label: "Árabe", icon: "/food-icons/arabe.webp" },
];

/**
 * O cone de sorvete é o único PNG vertical: na mesma altura dos outros ele fica
 * com metade da presença. A escala compensa sem mexer no alinhamento da linha.
 */
export const categoryScale: Partial<Record<FoodCategory["id"], number>> = {
  sorvetes: 1.25,
};
