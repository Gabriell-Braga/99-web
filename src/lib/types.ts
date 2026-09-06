import type { LatLng } from "@/lib/geo";

export type Vertical = "comida" | "corrida" | "entrega";

export type PaymentMethod = "pix" | "cartao" | "dinheiro" | "vale";

export interface SavedAddress extends LatLng {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  covered: boolean;
}

export type FoodCategoryId =
  | "lanche"
  | "pizza"
  | "acai"
  | "marmita"
  | "japonesa"
  | "saudavel"
  | "brasileira"
  | "doces";

export interface FoodCategory {
  id: FoodCategoryId;
  label: string;
}

export type ArtKind =
  | "burger"
  | "pizza"
  | "acai"
  | "marmita"
  | "sushi"
  | "salad"
  | "coxinha"
  | "dessert"
  | "drink"
  | "fries"
  | "chicken"
  | "pasta";

export interface OptionChoice {
  id: string;
  label: string;
  price: number;
  /** Selo "Em alta" com ícone de chama. */
  hot?: boolean;
}

export interface OptionGroup {
  id: string;
  label: string;
  /** "single" = escolha exclusiva; "multi" = adicionais que somam ao total. */
  type: "single" | "multi";
  required: boolean;
  max?: number;
  choices: OptionChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Preço promocional em verde; o cheio aparece riscado. */
  promoPrice?: number;
  art: ArtKind;
  available: boolean;
  options?: OptionGroup[];
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export interface Restaurant {
  slug: string;
  name: string;
  category: FoodCategoryId;
  tagline: string;
  rating: number;
  ratingCount: number;
  etaMin: number;
  etaMax: number;
  deliveryFee: number;
  minOrder: number;
  distanceKm: number;
  open: boolean;
  opensAt?: string;
  art: ArtKind;
  tint: string;
  address: string;
  location: LatLng;
  /** Tipo de cozinha, como o app mostra na linha de metadados. */
  cuisine: string;
  /** Taxa cheia riscada ao lado da promocional. */
  deliveryFeeFull?: number;
  deliveredBy: "Entregador 99" | "Entrega pela loja";
  menu: MenuSection[];
}

export interface BagLine {
  lineId: string;
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selections: { groupLabel: string; choiceLabel: string; price: number }[];
  note?: string;
}

export interface Bag {
  restaurantSlug: string | null;
  lines: BagLine[];
}

export type VehicleArt = "car" | "moto" | "box";

export interface RideCategory {
  id: "pop" | "moto" | "pop-expresso" | "negocia" | "taxi" | "entrega-moto" | "entrega-carro";
  name: string;
  description: string;
  art: VehicleArt;
  seats: number;
  perKm: number;
  base: number;
  minFare: number;
  etaMin: number;
  /** Linha "Negocia": o usuário propõe o valor com um stepper. */
  negotiable?: boolean;
}

export type PackageSize = "moto" | "carro";

export interface ContactPoint {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  cep: string;
  name: string;
  phone: string;
}

export interface OrderStage {
  id: string;
  title: string;
  description: string;
  /** Fração do trajeto percorrida ao fim deste estágio (0 a 1). */
  progress: number;
  etaLabel: string;
}

export interface OrderPoint extends LatLng {
  label: string;
}

export interface OrderBase {
  id: string;
  vertical: Vertical;
  createdAt: number;
  payment: PaymentMethod;
  total: number;
  stages: OrderStage[];
  origin: OrderPoint;
  destination: OrderPoint;
  /** Trajeto real (OSRM), quando disponível. */
  route?: LatLng[];
}

export interface FoodOrder extends OrderBase {
  vertical: "comida";
  restaurantName: string;
  restaurantSlug: string;
  lines: BagLine[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  deliveryMode: "padrao" | "rapida" | "retirada";
  addressLabel: string;
  courier: { name: string; vehicle: string; rating: number };
}

export interface RideOrder extends OrderBase {
  vertical: "corrida";
  category: RideCategory["id"];
  categoryName: string;
  distanceKm: number;
  durationMin: number;
  note?: string;
  driver: {
    name: string;
    rating: number;
    vehicle: string;
    color: string;
    plate: string;
    trips: number;
  };
}

export interface DeliveryOrder extends OrderBase {
  vertical: "entrega";
  pickup: ContactPoint;
  dropoff: ContactPoint;
  content: string;
  size: PackageSize;
  distanceKm: number;
  courier: { name: string; vehicle: string; plate: string; rating: number };
}

export type Order = FoodOrder | RideOrder | DeliveryOrder;
