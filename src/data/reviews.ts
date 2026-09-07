import type { ArtKind, Restaurant } from "@/lib/types";
import { pickPhoto } from "@/data/foodPhotos";

export interface Review {
  id: string;
  autor: string;
  data: string;
  estrelas: number;
  texto: string;
  foto?: string;
}

export interface RatingSummary {
  media: number;
  total: number;
  /** Quantidade por nota, de 5 a 1. */
  barras: number[];
  comFoto: number;
  positivas: number;
  negativas: number;
  avaliacoes: Review[];
}

const NOMES = [
  "Augusto M.",
  "Carla R.",
  "Diego S.",
  "Fernanda L.",
  "Rafael P.",
  "Juliana T.",
  "Marcos V.",
  "Patrícia N.",
];

const ELOGIOS = [
  "Chegou quentinho e antes do horário. Embalagem impecável.",
  "Porção generosa e tempero na medida. Já virou meu pedido de sexta.",
  "Entrega rápida e o app avisou cada etapa. Recomendo.",
  "Pedi de novo por causa do atendimento. Mandaram até um bilhete.",
  "Preço justo pelo tamanho. Deu para dividir tranquilo.",
];

const CRITICAS = [
  "Veio faltando um item do combo. Resolveram, mas demorou.",
  "Demorou mais que o previsto e chegou morno.",
];

/** Datas fixas, para o texto não mudar entre o servidor e o navegador. */
const DATAS = ["2026/08/29", "2026/08/24", "2026/08/17", "2026/08/09", "2026/07/28", "2026/07/15", "2026/07/02"];

function semente(texto: string): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Avaliações de demonstração derivadas da nota e do total de cada loja. São
 * sempre as mesmas para a mesma loja, e nenhuma é real.
 */
export function ratingSummary(r: Restaurant): RatingSummary {
  const s = semente(r.slug);
  const total = r.ratingCount;
  // Distribuição puxada para o topo, coerente com a nota exibida.
  const pesos = [0.72, 0.16, 0.06, 0.03, 0.03].map((p, i) => p + ((s >> (i * 3)) % 5) / 200);
  const soma = pesos.reduce((a, b) => a + b, 0);
  const barras = pesos.map((p) => Math.round((p / soma) * total));
  const positivas = barras[0] + barras[1];
  const negativas = barras[3] + barras[4];

  const quantas = 5 + (s % 3);
  const avaliacoes: Review[] = Array.from({ length: quantas }, (_, i) => {
    const h = semente(`${r.slug}-${i}`);
    const negativa = i === 1 || i === quantas - 1;
    const estrelas = negativa ? 1 + (h % 2) : 4 + (h % 2);
    const comFoto = i % 3 === 0;
    return {
      id: `${r.slug}-av-${i}`,
      autor: NOMES[(h + i) % NOMES.length],
      data: DATAS[i % DATAS.length],
      estrelas,
      texto: negativa ? CRITICAS[h % CRITICAS.length] : ELOGIOS[h % ELOGIOS.length],
      foto: comFoto ? pickPhoto(r.art as ArtKind, `${r.slug}-foto-${i}`) : undefined,
    };
  });

  return {
    media: r.rating,
    total,
    barras,
    comFoto: avaliacoes.filter((a) => a.foto).length,
    positivas,
    negativas,
    avaliacoes,
  };
}

/** Janela de funcionamento por tipo de loja, igual todos os dias, como no app. */
const JANELAS: Record<string, [string, string]> = {
  padarias: ["06:00", "20:00"],
  doces: ["10:00", "20:00"],
  sorvetes: ["12:00", "22:00"],
  marmita: ["10:30", "15:30"],
  saudavel: ["10:00", "22:00"],
  lanche: ["18:00", "00:00"],
  japonesa: ["18:00", "23:30"],
  carnes: ["18:00", "23:30"],
  arabe: ["17:30", "23:00"],
  chinesa: ["11:00", "23:00"],
  italiana: ["18:00", "23:30"],
  pizza: ["18:00", "23:59"],
  salgados: ["07:00", "19:00"],
  brasileira: ["11:00", "22:00"],
  acai: ["11:00", "22:00"],
};

export const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/**
 * Horário da semana. A loja fechada abre no horário que ela já anuncia, então
 * a janela sai dele; o resto vem do tipo de cozinha.
 */
export function weeklyHours(r: Restaurant): { dia: string; janela: string }[] {
  const [abre, fecha] = JANELAS[r.category] ?? ["11:00", "23:00"];
  const inicio = r.opensAt ?? abre;
  return DIAS.map((dia) => ({ dia, janela: `${inicio} - ${fecha}` }));
}
