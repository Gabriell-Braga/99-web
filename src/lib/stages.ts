import type { OrderStage, Vertical } from "@/lib/types";

/** Tempo de cada estágio na demonstração, em milissegundos. */
export const STAGE_DURATION_MS = 10_000;

export function stagesFor(vertical: Vertical, eta: string): OrderStage[] {
  switch (vertical) {
    case "comida":
      return [
        {
          id: "recebido",
          title: "Pedido recebido",
          description: "O restaurante confirmou seu pedido e vai começar o preparo.",
          progress: 0,
          etaLabel: eta,
        },
        {
          id: "preparo",
          title: "Em preparo",
          description: "A cozinha está montando seu pedido.",
          progress: 0,
          etaLabel: eta,
        },
        {
          id: "a-caminho",
          title: "Saiu para entrega",
          description: "O entregador retirou o pedido e está a caminho.",
          progress: 0.85,
          etaLabel: "Chega em 12 min",
        },
        {
          id: "entregue",
          title: "Entregue",
          description: "Bom apetite. Obrigado por pedir pelo 99Food.",
          progress: 1,
          etaLabel: "Entregue",
        },
      ];
    case "corrida":
      return [
        {
          id: "procurando",
          title: "Procurando motorista",
          description: "Estamos encontrando o motorista mais próximo de você.",
          progress: 0,
          etaLabel: "Aguardando",
        },
        {
          id: "a-caminho",
          title: "Motorista a caminho",
          description: "Fique no ponto de embarque. O motorista chega em instantes.",
          progress: 0,
          etaLabel: "Chega em 4 min",
        },
        {
          id: "viagem",
          title: "Em viagem",
          description: "Boa viagem. Você pode acompanhar o trajeto no mapa.",
          progress: 0.85,
          etaLabel: eta,
        },
        {
          id: "finalizada",
          title: "Finalizada",
          description: "Você chegou ao destino. O valor foi cobrado na forma escolhida.",
          progress: 1,
          etaLabel: "Concluída",
        },
      ];
    case "entrega":
      return [
        {
          id: "procurando",
          title: "Procurando entregador",
          description: "Estamos encontrando um entregador disponível perto da coleta.",
          progress: 0,
          etaLabel: "Aguardando",
        },
        {
          id: "coletando",
          title: "Coletando",
          description: "O entregador chegou ao ponto de coleta e está retirando o pacote.",
          progress: 0,
          etaLabel: "Coleta em andamento",
        },
        {
          id: "a-caminho",
          title: "A caminho",
          description: "Pacote em trânsito. O destinatário recebe o código de entrega por SMS.",
          progress: 0.85,
          etaLabel: eta,
        },
        {
          id: "entregue",
          title: "Entregue",
          description: "O destinatário confirmou o recebimento com o código.",
          progress: 1,
          etaLabel: "Entregue",
        },
      ];
  }
}

export function newOrderId(vertical: Vertical): string {
  const prefix = { comida: "CM", corrida: "CR", entrega: "EN" }[vertical];
  const n = Math.floor(1000 + Math.random() * 9000);
  const letters = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${prefix}-${n}${letters}`;
}
