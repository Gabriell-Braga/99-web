export interface PhotoCredit {
  id: string;
  label: string;
  autor: string;
  licenca: string;
  fonte: string;
}

/**
 * Fotos das vantagens, todas em CC0 pelo Rawpixel e servidas do próprio
 * projeto. O CC0 dispensa crédito, mas ele fica no rodapé junto com o das
 * fotos de prato.
 */
export const peopleCredits: PhotoCredit[] = [
  {
    id: "corrida",
    label: "Táxi na rua",
    autor: "Rawpixel",
    licenca: "CC0 1.0",
    fonte: "https://www.rawpixel.com/image/2280893/free-photo-image-taxi-cab-car",
  },
  {
    id: "mesa",
    label: "Refeição na mesa",
    autor: "Rawpixel",
    licenca: "CC0 1.0",
    fonte: "https://www.rawpixel.com/image/3282913/free-photo-image-cafeteria-restaurant-brunch",
  },
  {
    id: "computador",
    label: "Trabalho no computador",
    autor: "Rawpixel",
    licenca: "CC0 1.0",
    fonte: "https://www.rawpixel.com/image/5921515/photo-image-background-public-domain-technology",
  },
  {
    id: "teclado",
    label: "Teclado",
    autor: "Rawpixel",
    licenca: "CC0 1.0",
    fonte: "https://www.rawpixel.com/image/5925994/photo-image-background-public-domain-technology",
  },
];
