import type { IconName } from "@/components/ui/Icon";

export interface MenuItemDef {
  label: string;
  icon: IconName;
  color: string;
  dot?: boolean;
}

/** Itens do menu lateral do app, na ordem e com a cor própria de cada um. */
export const menuAccount: MenuItemDef[] = [
  { label: "Atividade", icon: "activity", color: "#FF6B2C" },
  { label: "99Pay", icon: "wallet", color: "#00C9A7", dot: true },
  { label: "Ajuda", icon: "help", color: "#2E7BFF" },
  { label: "Mensagens", icon: "message", color: "#00C853", dot: true },
  { label: "Central de segurança", icon: "shield", color: "#2E7BFF" },
  { label: "Métodos de pagamento", icon: "card", color: "#2E7BFF" },
  { label: "Configurações", icon: "settings", color: "#2E7BFF" },
  { label: "Desafios", icon: "trophy", color: "#FF6B2C" },
];

export const menuReferral: MenuItemDef[] = [
  { label: "Convide Amigos", icon: "gift", color: "#FF6B2C" },
  { label: "Ganhe R$ com seu carro", icon: "car", color: "#FF6B2C" },
  { label: "Convide Motoristas", icon: "people", color: "#FF6B2C" },
  { label: "Seja Motorista", icon: "steering", color: "#FF6B2C" },
];

export const user = {
  name: "Gabriel",
  fullName: "Gabriel Braga",
  verified: true,
};
