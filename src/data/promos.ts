export interface Promo {
  id: string;
  badge: string;
  title: string;
  description: string;
  cta: string;
  /** Fundo do banner e foto do lado direito. */
  tint: string;
  image: string;
}

/**
 * Banners de demonstração. Campanha, valor e prazo são fictícios: o protótipo
 * não reproduz nenhuma promoção real da 99.
 */
export const promos: Promo[] = [
  {
    id: "cupom",
    badge: "Cupom de estreia",
    title: "R$ 15 de desconto no primeiro pedido",
    description: "Aplicado no carrinho, sem código para digitar.",
    cta: "Ver lojas",
    tint: "#212121",
    image: "/food/burger.webp",
  },
  {
    id: "frete",
    badge: "Entrega grátis",
    title: "Frete zero acima de R$ 30",
    description: "Nas lojas com o selo, na região que você escolheu.",
    cta: "Aproveitar",
    tint: "#00803d",
    image: "/food/pizza.webp",
  },
  {
    id: "semana",
    badge: "Ofertas da semana",
    title: "Até 40% OFF em pratos selecionados",
    description: "Uma lista nova toda segunda, enquanto durar o estoque.",
    cta: "Ver ofertas",
    tint: "#c43c00",
    image: "/food/sushi.webp",
  },
];
