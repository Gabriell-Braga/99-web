import type { RideCategory } from "@/lib/types";

export const rideCategories: RideCategory[] = [
  {
    id: "pop",
    name: "99Pop",
    description: "Carro comum para o dia a dia",
    seats: 4,
    base: 4.5,
    perKm: 2.1,
    minFare: 9.9,
    etaMin: 4,
  },
  {
    id: "comfort",
    name: "99Comfort",
    description: "Carros novos, mais espaço e ar-condicionado",
    seats: 4,
    base: 6.5,
    perKm: 2.9,
    minFare: 14.9,
    etaMin: 6,
  },
  {
    id: "moto",
    name: "99Moto",
    description: "Mais rápido no trânsito, só para uma pessoa",
    seats: 1,
    base: 3,
    perKm: 1.3,
    minFare: 6.9,
    etaMin: 3,
  },
  {
    id: "taxi",
    name: "99Táxi",
    description: "Táxi credenciado com preço de taxímetro",
    seats: 4,
    base: 5.5,
    perKm: 3.2,
    minFare: 15,
    etaMin: 7,
  },
];

export const drivers = {
  pop: {
    name: "Carlos Henrique",
    rating: 4.92,
    vehicle: "Chevrolet Onix",
    color: "prata",
    plate: "FGH-2C47",
    trips: 3218,
  },
  comfort: {
    name: "Renata Oliveira",
    rating: 4.97,
    vehicle: "Toyota Corolla",
    color: "preto",
    plate: "EZX-9A12",
    trips: 5412,
  },
  moto: {
    name: "Diego Nascimento",
    rating: 4.88,
    vehicle: "Honda CG 160",
    color: "vermelha",
    plate: "DKT-7F31",
    trips: 1980,
  },
  taxi: {
    name: "Antônio Ferreira",
    rating: 4.95,
    vehicle: "Fiat Cronos",
    color: "branco",
    plate: "TXI-4B90",
    trips: 8764,
  },
} as const;
