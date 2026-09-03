import type { SavedAddress } from "@/lib/types";

/** Endereços salvos do usuário para o fluxo de comida. O último está fora da área. */
export const savedAddresses: SavedAddress[] = [
  {
    id: "casa",
    label: "Casa",
    line1: "Rua Harmonia, 480",
    line2: "Apto 62 · Vila Madalena",
    city: "São Paulo - SP",
    covered: true,
    lat: -23.5535,
    lng: -46.6889,
  },
  {
    id: "trabalho",
    label: "Trabalho",
    line1: "Av. Paulista, 1578",
    line2: "12º andar · Bela Vista",
    city: "São Paulo - SP",
    covered: true,
    lat: -23.5614,
    lng: -46.656,
  },
  {
    id: "sitio",
    label: "Sítio",
    line1: "Estrada do Cipó, km 14",
    line2: "Zona rural",
    city: "Mairiporã - SP",
    covered: false,
    lat: -23.3186,
    lng: -46.5871,
  },
];
