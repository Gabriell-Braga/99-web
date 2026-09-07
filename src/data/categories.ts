import type { FoodCategory } from "@/lib/types";

/** Trilho de categorias do 99 Food, na ordem do app. Arte em public/food-icons. */
export const foodCategories: FoodCategory[] = [
  { id: "chinesa", label: "Chinesa", icon: "/food-icons/chinesa.png" },
  { id: "italiana", label: "Italiana", icon: "/food-icons/italiana.png" },
  { id: "doces", label: "Doces", icon: "/food-icons/doces.png" },
  { id: "marmita", label: "Marmita", icon: "/food-icons/marmita.png" },
  { id: "japonesa", label: "Japonesa", icon: "/food-icons/japonesa.png" },
  { id: "salgados", label: "Salgados", icon: "/food-icons/salgados.png" },
  { id: "lanche", label: "Lanches", icon: "/food-icons/lanches.png" },
  { id: "acai", label: "Açaí", icon: "/food-icons/acai.png" },
  { id: "sorvetes", label: "Sorvetes", icon: "/food-icons/sorvetes.png" },
  { id: "padarias", label: "Padarias", icon: "/food-icons/padarias.png" },
  { id: "pizza", label: "Pizza", icon: "/food-icons/pizza.png" },
  { id: "carnes", label: "Carnes", icon: "/food-icons/carnes.png" },
  { id: "brasileira", label: "Brasileira", icon: "/food-icons/brasileira.png" },
  { id: "saudavel", label: "Saudável", icon: "/food-icons/saudavel.png" },
  { id: "arabe", label: "Árabe", icon: "/food-icons/arabe.png" },
];

/**
 * O cone de sorvete é o único PNG vertical: na mesma altura dos outros ele fica
 * com metade da presença. A escala compensa sem mexer no alinhamento da linha.
 */
export const categoryScale: Partial<Record<FoodCategory["id"], number>> = {
  sorvetes: 1.25,
};
