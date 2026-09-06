import type { ArtKind } from "@/lib/types";

/**
 * Fotos dos pratos, todas do Wikimedia Commons em licença livre e servidas
 * do próprio projeto, sem depender de serviço externo de imagem. Os créditos
 * aparecem no rodapé, como pedem as licenças CC BY e CC BY-SA.
 */
export const foodPhoto: Record<ArtKind, string> = {
  burger: "/food/burger.webp",
  pizza: "/food/pizza.webp",
  acai: "/food/acai.webp",
  marmita: "/food/marmita.webp",
  sushi: "/food/sushi.webp",
  salad: "/food/salad.webp",
  coxinha: "/food/coxinha.webp",
  dessert: "/food/dessert.webp",
  drink: "/food/drink.webp",
  fries: "/food/fries.webp",
  chicken: "/food/chicken.webp",
  pasta: "/food/pasta.webp",
};

export interface PhotoCredit {
  kind: ArtKind;
  label: string;
  autor: string;
  licenca: string;
  fonte: string;
}

export const photoCredits: PhotoCredit[] = [
  { kind: "burger", label: "Lanche", autor: "Renee Comet (photographer)", licenca: "Public domain", fonte: "https://commons.wikimedia.org/wiki/File:Cheeseburger.jpg" },
  { kind: "pizza", label: "Pizza", autor: "Mario56", licenca: "CC BY-SA 3.0", fonte: "https://commons.wikimedia.org/wiki/File:Margherita_Originale.JPG" },
  { kind: "acai", label: "Açaí", autor: "Joe Crawford from San Diego, California, USA", licenca: "CC BY 2.0", fonte: "https://commons.wikimedia.org/wiki/File:A%C3%A7a%C3%AD_na_tigela_-_Acai_bowl.jpg" },
  { kind: "marmita", label: "Marmita", autor: "Henrique Dante de Almeida", licenca: "CC BY-SA 3.0", fonte: "https://commons.wikimedia.org/wiki/File:Rice_and_beans%2C_Hotel_in_Itatiaia.jpeg" },
  { kind: "sushi", label: "Japonesa", autor: "chidorian from Japan", licenca: "CC BY-SA 2.0", fonte: "https://commons.wikimedia.org/wiki/File:Sushi_platter.jpg" },
  { kind: "salad", label: "Saudável", autor: "Andy Li", licenca: "CC0", fonte: "https://commons.wikimedia.org/wiki/File:Salmon_Poke_Bowl_(S)_with_Spicy_mayo_sauce_-_Kitokito.jpg" },
  { kind: "coxinha", label: "Salgado", autor: "Horacio Cambeiro", licenca: "CC BY 3.0", fonte: "https://commons.wikimedia.org/wiki/File:Coxinha_de_Puerto_Iguaz%C3%BA%2C_Misiones%2C_Argentina.jpg" },
  { kind: "dessert", label: "Doce", autor: "ConsciousBurning", licenca: "CC0", fonte: "https://commons.wikimedia.org/wiki/File:Vegan_chocolate_cake_with_sliced_strawberries.jpg" },
  { kind: "drink", label: "Bebida", autor: "Nshemeire Addah", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Orange_juice_in_a_glass.jpg" },
  { kind: "fries", label: "Porção", autor: "4028mdk09", licenca: "CC BY-SA 3.0", fonte: "https://commons.wikimedia.org/wiki/File:Schale_mit_einer_Portion_Pommes_frites.JPG" },
  { kind: "chicken", label: "Frango", autor: "Rwebogora", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Chicken_at_grill.jpg" },
  { kind: "pasta", label: "Massa", autor: "Javier Somoza", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Espaguetis_carbonara.jpg" },
];
