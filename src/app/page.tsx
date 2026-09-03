import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MapView } from "@/components/map/MapView";

const verticals: {
  href: string;
  title: string;
  description: string;
  cta: string;
  icon: IconName;
  accent: string;
}[] = [
  {
    href: "/comida",
    title: "Comida",
    description: "Peça o almoço do escritório na aba do lado, com a sacola sempre à vista.",
    cta: "Ver restaurantes",
    icon: "utensils",
    accent: "bg-yellow-99 text-black-99",
  },
  {
    href: "/corrida",
    title: "Corrida",
    description: "Chame 99Pop, 99Comfort, 99Moto ou 99Táxi com mapa e painel lado a lado.",
    cta: "Solicitar corrida",
    icon: "car",
    accent: "bg-yellow-99 text-black-99",
  },
  {
    href: "/entrega",
    title: "Entrega",
    description: "Cole o endereço vindo de outro sistema e o formulário se preenche sozinho.",
    cta: "Enviar pacote",
    icon: "package",
    accent: "bg-yellow-99 text-black-99",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-yellow-99">
        <Container className="grid gap-10 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-20">
          <div className="flex min-w-0 flex-col gap-6">
            <h1 className="max-w-2xl text-[40px] font-bold leading-[1.15] text-black-99 md:text-[56px] md:font-extrabold md:leading-[1.1]">
              A 99 que falta para quem está no computador
            </h1>
            <p className="max-w-xl text-lg text-black-99/80">
              Corrida, entrega e comida direto no navegador. Sem pegar o celular para digitar de
              novo o que já está na tela.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/entrega"
                className="inline-flex h-14 items-center gap-2 rounded-xl bg-black-99 px-8 font-semibold text-white transition-colors hover:bg-secondary-99"
              >
                Testar o fluxo de entrega
                <Icon name="arrowRight" />
              </Link>
              <Link
                href="/comida"
                className="inline-flex h-14 items-center rounded-xl border border-black-99/20 bg-white px-8 font-semibold text-black-99 transition-colors hover:bg-subtle-99"
              >
                Pedir comida
              </Link>
            </div>
          </div>
          <div className="relative h-[280px] min-w-0 overflow-hidden rounded-[20px] shadow-high lg:h-[360px]">
            <MapView
              origin={{ lat: -23.5535, lng: -46.6889, label: "Vila Madalena" }}
              destination={{ lat: -23.5614, lng: -46.656, label: "Av. Paulista" }}
              progress={0.55}
              vehicle="moto"
              interactive={false}
            />
          </div>
        </Container>
      </section>

      <Container className="py-16 lg:py-20">
        <div className="mb-8 flex flex-col gap-2">
          <h2 className="text-[28px] font-semibold">O que você quer fazer?</h2>
          <p className="text-secondary-99">Três serviços, cada um com o fluxo completo até o acompanhamento.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {verticals.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="group flex flex-col gap-4 rounded-2xl border border-border-99 bg-white p-6 shadow-low transition-shadow hover:shadow-mid"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-full ${v.accent}`}>
                <Icon name={v.icon} size={24} />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-[22px] font-semibold">{v.title}</h3>
                <p className="text-sm text-secondary-99">{v.description}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-2 font-semibold text-black-99">
                {v.cta}
                <Icon name="arrowRight" size={18} />
              </span>
            </Link>
          ))}
        </div>
      </Container>

      <section className="bg-subtle-99">
        <Container className="grid gap-10 py-16 lg:grid-cols-3 lg:py-20">
          <div className="lg:col-span-1">
            <h2 className="text-[28px] font-semibold">Por que web</h2>
            <p className="mt-2 text-secondary-99">
              A lacuna foi vista em operação real. Estes são os três momentos em que o celular
              atrapalha.
            </p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:col-span-2" role="list">
            {[
              {
                t: "O restaurante no horário de pico",
                d: "O pedido chega pelo cardápio web com endereço completo na tela. Solicitar a entrega deveria ser colar, não redigitar.",
              },
              {
                t: "O escritório na hora do almoço",
                d: "Quem passa o dia no computador pede comida com o celular na mão em vez de resolver na aba do lado.",
              },
              {
                t: "A sacola que não some",
                d: "Com largura de sobra, a sacola vira coluna fixa. Dá para comparar restaurantes sem perder o que já escolheu.",
              },
              {
                t: "Estados de verdade",
                d: "Carregamento, vazio, erro e bloqueio existem em cada fluxo. É o que separa protótipo de tela de apresentação.",
              },
            ].map((b) => (
              <li key={b.t} className="flex flex-col gap-1 rounded-xl bg-white p-6 shadow-low">
                <h3 className="font-semibold">{b.t}</h3>
                <p className="text-sm text-secondary-99">{b.d}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-10">
        <div className="flex gap-3 rounded-xl border border-border-99 p-4 text-sm text-secondary-99">
          <Icon name="info" className="mt-0.5 shrink-0 text-info-99" />
          <p>
            Este é um conceito independente, sem vínculo com a 99. Foi criado para demonstrar como o
            serviço poderia operar no navegador. Nenhum pedido, corrida, entrega ou pagamento é real,
            e nada aqui consome serviços da empresa.
          </p>
        </div>
      </Container>
    </>
  );
}
