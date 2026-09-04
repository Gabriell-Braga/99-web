import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { MapView } from "@/components/map/MapView";

const verticals: { href: string; title: string; description: string; cta: string; icon: IconName }[] = [
  {
    href: "/corrida",
    title: "Corrida",
    description: "Pop, Moto, Pop Expresso, Negocia, Táxi e Entrega Moto, com mapa e painel lado a lado.",
    cta: "Para onde vamos?",
    icon: "car",
  },
  {
    href: "/comida",
    title: "Food",
    description: "Ofertas, lojas preferidas e o carrinho sempre à vista numa coluna fixa.",
    cta: "Ver lojas",
    icon: "utensils",
  },
  {
    href: "/entrega",
    title: "Entrega",
    description: "Entrega Moto ou Entrega Carro. Origem e destino num campo só, com endereços recentes.",
    cta: "Enviar",
    icon: "box",
  },
];

export default function HomePage() {
  return (
    <>
      <Container className="grid gap-10 py-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-16">
        <div className="flex min-w-0 flex-col gap-6">
          <h1 className="max-w-2xl text-[40px] font-bold leading-[1.15] text-black-99 md:text-[56px] md:leading-[1.1]">
            A 99 que falta para quem está no computador
          </h1>
          <p className="max-w-xl text-[17px] text-secondary-99">
            Corrida, Food e Entrega direto no navegador. O endereço já está na sua tela, então informar origem e destino leva
            segundos, sem trocar de aparelho no meio da operação.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/corrida"
              className="inline-flex h-14 items-center gap-2 rounded-xl bg-yellow-99 px-6 text-[17px] font-bold text-black-99 transition-colors hover:bg-yellow-99-hover"
            >
              Para onde vamos?
              <Icon name="arrowRight" />
            </Link>
            <Link
              href="/comida"
              className="inline-flex h-14 items-center rounded-xl border border-border-99 bg-white px-6 text-[17px] font-bold text-black-99 transition-colors hover:bg-subtle-99"
            >
              Ver lojas
            </Link>
          </div>
        </div>
        <div className="relative h-[280px] min-w-0 overflow-hidden rounded-2xl border border-border-99 lg:h-[360px]">
          <MapView
            origin={{ lat: -23.5535, lng: -46.6889, label: "Vila Madalena" }}
            destination={{ lat: -23.5614, lng: -46.656, label: "Av. Paulista" }}
            progress={0.55}
            vehicle="moto"
            interactive={false}
          />
        </div>
      </Container>

      <Container className="pb-16 lg:pb-20">
        <div className="mb-6 flex flex-col gap-1">
          <h2 className="text-[20px] font-bold">O que você quer fazer?</h2>
          <p className="text-[15px] text-secondary-99">Três serviços, cada um com o fluxo completo até o acompanhamento.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {verticals.map((v) => (
            <Link
              key={v.href}
              href={v.href}
              className="group flex flex-col gap-4 rounded-2xl border border-border-99 bg-white p-5 transition-colors hover:bg-subtle-99"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-99 text-black-99">
                <Icon name={v.icon} size={24} strokeWidth={2} />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-[20px] font-bold">{v.title}</h3>
                <p className="text-[15px] text-secondary-99">{v.description}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-2 text-[15px] font-bold text-black-99">
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
            <h2 className="text-[20px] font-bold">Por que web</h2>
            <p className="mt-2 text-[15px] text-secondary-99">
              A lacuna foi vista em operação real. Estes são os momentos em que o celular atrapalha.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-2" role="list">
            {[
              {
                t: "A loja no horário de pico",
                d: "O pedido chega pelo cardápio web com o endereço na tela. Informar a entrega na aba do lado leva segundos, sem pegar o celular.",
              },
              {
                t: "O escritório na hora do almoço",
                d: "Quem passa o dia no computador pede comida com o celular na mão em vez de resolver na aba do lado.",
              },
              {
                t: "O carrinho que não some",
                d: "Com largura de sobra, o carrinho vira coluna fixa. Dá para comparar lojas sem perder o que já escolheu.",
              },
              {
                t: "Estados de verdade",
                d: "Carregamento, vazio, erro e bloqueio existem em cada fluxo. É o que separa protótipo de tela de apresentação.",
              },
            ].map((b) => (
              <li key={b.t} className="flex flex-col gap-1 rounded-2xl bg-white p-5">
                <h3 className="text-[15px] font-bold">{b.t}</h3>
                <p className="text-[15px] text-secondary-99">{b.d}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="py-10 pb-32">
        <div className="flex gap-3 rounded-2xl border border-border-99 p-4 text-[15px] text-secondary-99">
          <Icon name="info" className="mt-0.5 shrink-0 text-info-99" />
          <p>
            Este é um conceito independente, sem vínculo com a 99. Foi criado para demonstrar como o serviço poderia operar no
            navegador. Nenhum pedido, corrida, entrega ou pagamento é real, e nada aqui consome serviços da empresa.
          </p>
        </div>
      </Container>
    </>
  );
}
