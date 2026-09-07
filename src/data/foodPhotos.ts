import type { ArtKind } from "@/lib/types";

/**
 * Fotos dos pratos, todas de licença livre e servidas do próprio projeto em
 * WebP. Onde há duas, a segunda evita que lojas da mesma categoria apareçam
 * com a mesma imagem. Os créditos ficam no rodapé.
 */
export const foodPhotos: Record<ArtKind, string[]> = {
  burger: ["/food/burger.webp", "/food/burger-2.webp"],
  pizza: ["/food/pizza.webp", "/food/pizza-2.webp", "/food/pizza-3.webp"],
  acai: ["/food/acai.webp", "/food/acai-2.webp"],
  marmita: ["/food/marmita.webp", "/food/marmita-2.webp"],
  sushi: ["/food/sushi.webp", "/food/sushi-2.webp"],
  salad: ["/food/salad.webp", "/food/salad-2.webp"],
  coxinha: ["/food/coxinha.webp", "/food/coxinha-2.webp"],
  dessert: ["/food/dessert.webp", "/food/dessert-2.webp", "/food/dessert-3.webp"],
  drink: ["/food/drink.webp", "/food/drink-2.webp"],
  fries: ["/food/fries.webp", "/food/fries-2.webp"],
  chicken: ["/food/chicken.webp", "/food/chicken-2.webp", "/food/chicken-3.webp"],
  pasta: ["/food/pasta.webp", "/food/pasta-2.webp", "/food/pasta-3.webp"],
  chinesa: ["/food/chinesa.webp"],
  sorvete: ["/food/sorvete.webp"],
  padaria: ["/food/padaria.webp", "/food/padaria-2.webp"],
  carne: ["/food/carne.webp"],
  arabe: ["/food/arabe.webp"],
};

/**
 * Escolhe sempre a mesma foto para a mesma semente, para não trocar a cada
 * render. Numa lista da mesma loja, o índice manda: assim dois pratos vizinhos
 * da mesma categoria nunca aparecem com a mesma imagem.
 */
export function pickPhoto(kind: ArtKind, seed?: string, index?: number): string {
  const lista = foodPhotos[kind];
  if (index !== undefined) return lista[index % lista.length];
  if (!seed || lista.length === 1) return lista[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return lista[h % lista.length];
}

export interface PhotoCredit {
  id: string;
  label: string;
  autor: string;
  licenca: string;
  fonte: string;
}

export const photoCredits: PhotoCredit[] = [
  { id: "burger", label: "Lanche", autor: "Renee Comet (photographer)", licenca: "Public domain", fonte: "https://commons.wikimedia.org/wiki/File:Cheeseburger.jpg" },
  { id: "pizza", label: "Pizza", autor: "Mario56", licenca: "CC BY-SA 3.0", fonte: "https://commons.wikimedia.org/wiki/File:Margherita_Originale.JPG" },
  { id: "acai", label: "Açaí", autor: "Joe Crawford from San Diego, California, USA", licenca: "CC BY 2.0", fonte: "https://commons.wikimedia.org/wiki/File:A%C3%A7a%C3%AD_na_tigela_-_Acai_bowl.jpg" },
  { id: "marmita", label: "Marmita", autor: "Henrique Dante de Almeida", licenca: "CC BY-SA 3.0", fonte: "https://commons.wikimedia.org/wiki/File:Rice_and_beans%2C_Hotel_in_Itatiaia.jpeg" },
  { id: "sushi", label: "Japonesa", autor: "chidorian from Japan", licenca: "CC BY-SA 2.0", fonte: "https://commons.wikimedia.org/wiki/File:Sushi_platter.jpg" },
  { id: "salad", label: "Saudável", autor: "Andy Li", licenca: "CC0", fonte: "https://commons.wikimedia.org/wiki/File:Salmon_Poke_Bowl_(S)_with_Spicy_mayo_sauce_-_Kitokito.jpg" },
  { id: "coxinha", label: "Salgados", autor: "Horacio Cambeiro", licenca: "CC BY 3.0", fonte: "https://commons.wikimedia.org/wiki/File:Coxinha_de_Puerto_Iguaz%C3%BA%2C_Misiones%2C_Argentina.jpg" },
  { id: "dessert", label: "Doces", autor: "ConsciousBurning", licenca: "CC0", fonte: "https://commons.wikimedia.org/wiki/File:Vegan_chocolate_cake_with_sliced_strawberries.jpg" },
  { id: "drink", label: "Bebida", autor: "Nshemeire Addah", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Orange_juice_in_a_glass.jpg" },
  { id: "fries", label: "Porção", autor: "4028mdk09", licenca: "CC BY-SA 3.0", fonte: "https://commons.wikimedia.org/wiki/File:Schale_mit_einer_Portion_Pommes_frites.JPG" },
  { id: "chicken", label: "Frango", autor: "Rwebogora", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Chicken_at_grill.jpg" },
  { id: "pasta", label: "Massa", autor: "Javier Somoza", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Espaguetis_carbonara.jpg" },
  { id: "chinesa", label: "Chinesa", autor: "JIP", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Beef_wok_as_a_convenience_food.jpg" },
  { id: "sorvete", label: "Sorvete", autor: "RegionVisitor90", licenca: "CC0", fonte: "https://commons.wikimedia.org/wiki/File:Port_Broughton_Hotel_20260127-123706.jpg" },
  { id: "carne", label: "Carnes", autor: "Shixart1985", licenca: "CC BY 2.0", fonte: "https://commons.wikimedia.org/wiki/File:Steak_served_with_sauce_greens_and_garnishes_on_a_dark_plate.jpg" },
  { id: "burger-2", label: "Lanche 2", autor: "JIP", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Hamburger_and_fries_at_Canttiini_close_up.jpg" },
  { id: "pizza-2", label: "Pizza 2", autor: "Missvain", licenca: "CC0", fonte: "https://commons.wikimedia.org/wiki/File:Gabacool_Provisions_-_July_2024_-_Sarah_Stierch_09.jpg" },
  { id: "marmita-2", label: "Marmita 2", autor: "Acabashi", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Crispy_chicken_and_rice_at_Highgate_Cricket_Club%2C_Crouch_End_2.jpg" },
  { id: "salad-2", label: "Saudável 2", autor: "HaJunkiyada", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Liat_Portal_for_Foodie_Disorder_-_Mixed_vegetable_salad_with_fresh_herbs.jpg" },
  { id: "chicken-2", label: "Frango 2", autor: "HaJunkiyada", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Liat_Portal_for_Foodie_Disorder_-_Grilled_chicken_with_rice%2C_potatoes_and_vegetables.jpg" },
  { id: "pasta-2", label: "Massa 2", autor: "JIP", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Pasta_bolognese_at_restaurant_Vltava.jpg" },
  { id: "drink-2", label: "Bebida 2", autor: "public domain", licenca: "CC0", fonte: "https://commons.wikimedia.org/wiki/File:Pineapple_Juice_fruits-465832.jpg" },
  { id: "padaria", label: "Padaria", autor: "autor não informado", licenca: "CC BY 2.0", fonte: "https://commons.wikimedia.org/wiki/File:Acme_bread.jpg" },
  { id: "dessert-2", label: "Doces 2", autor: "Daria YakovlevaMinor edits made by Subsidiary acco", licenca: "CC0", fonte: "https://commons.wikimedia.org/wiki/File:Piece_of_chocolate_cake_on_a_white_plate_decorated_with_chocolate_sauce.jpg" },
  { id: "acai-2", label: "Açaí 2", autor: "ella.o", licenca: "BY 2.0", fonte: "https://www.flickr.com/photos/155807330@N05/30276166867" },
  { id: "sushi-2", label: "Japonesa 2", autor: "avlxyz", licenca: "BY-SA 2.0", fonte: "https://www.flickr.com/photos/10559879@N00/4734585503" },
  { id: "fries-2", label: "Porção 2", autor: "autor não informado", licenca: "CC0 1.0", fonte: "https://www.rawpixel.com/image/6019954/photo-image-public-domain-plant-food" },
  { id: "arabe", label: "Árabe", autor: "Contrapunctus-1", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Pesto_fettucine_and_a_mezze_bowl_at_Hons_All-Day_Dining%2C_Le_Press%2C_Hazratganj%2C_Lucknow_(2025-08-03).jpg" },
  { id: "coxinha-2", label: "Salgados 2", autor: "PattayaPatrol", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:DFC_3930_Golden_crispy_fried_dumplings_arranged_in_neat_rows_on_a_cooling_rack_ready_to_be_served.jpg" },
  { id: "pasta-3", label: "Massa 3", autor: "Michael Rivera", licenca: "CC BY-SA 3.0", fonte: "https://commons.wikimedia.org/wiki/File:Spinach_Artichoke_Ravioli.jpg" },
  { id: "pizza-3", label: "Pizza 3", autor: "PattayaPatrol", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:DZ6_0560_Wood-fired_pizza_topped_with_ham_peppers_and_melted_cheese_ready_to_slice_and_serve.jpg" },
  { id: "dessert-3", label: "Doces 3", autor: "Pilauricey (talk)", licenca: "CC BY-SA 3.0", fonte: "https://commons.wikimedia.org/wiki/File:Carnegie_Deli_Strawberry_Cheesecake.jpg" },
  { id: "chicken-3", label: "Frango 3", autor: "Jameswasswa", licenca: "CC BY-SA 4.0", fonte: "https://commons.wikimedia.org/wiki/File:Whole_spiced_chicken_(roasted).jpg" },
  { id: "padaria-2", label: "Padaria 2", autor: "Shixart1985", licenca: "CC BY 2.0", fonte: "https://commons.wikimedia.org/wiki/File:Coffee%2C_croissants%2C_and_jam_on_a_plate_with_cookies_on_a_table_during_breakfast_time_in_a_cozy_setting.jpg" },
];
