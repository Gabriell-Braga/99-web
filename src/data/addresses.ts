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

export interface RecentAddress {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  cep: string;
  /** Contato salvo junto com o endereço, como o app guarda em "Endereços recentes". */
  name?: string;
  phone?: string;
}

/** Endereços recentes mostrados antes de digitar, nos fluxos de corrida e entrega. */
export const recentAddresses: RecentAddress[] = [
  {
    id: "rec-paulista",
    title: "Avenida Paulista, 1578",
    subtitle: "Bela Vista · São Paulo - SP",
    lat: -23.5614,
    lng: -46.656,
    street: "Avenida Paulista",
    number: "1578",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    cep: "01310-200",
  },
  {
    id: "rec-oscar",
    title: "Rua Oscar Freire, 379",
    subtitle: "Jardins · São Paulo - SP",
    lat: -23.5622,
    lng: -46.6683,
    street: "Rua Oscar Freire",
    number: "379",
    neighborhood: "Jardins",
    city: "São Paulo",
    cep: "01426-001",
    name: "Maria Souza",
    phone: "11987654321",
  },
  {
    id: "rec-ibira",
    title: "Parque Ibirapuera, Portão 3",
    subtitle: "Av. Pedro Álvares Cabral · São Paulo - SP",
    lat: -23.5874,
    lng: -46.6576,
    street: "Avenida Pedro Álvares Cabral",
    number: "s/n",
    neighborhood: "Vila Mariana",
    city: "São Paulo",
    cep: "04094-050",
  },
  {
    id: "rec-aspicuelta",
    title: "Rua Aspicuelta, 312",
    subtitle: "Vila Madalena · São Paulo - SP",
    lat: -23.5569,
    lng: -46.6913,
    street: "Rua Aspicuelta",
    number: "312",
    neighborhood: "Vila Madalena",
    city: "São Paulo",
    cep: "05433-010",
    name: "Braseiro Burger",
    phone: "11912345678",
  },
];
