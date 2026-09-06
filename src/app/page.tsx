import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { HomeMap } from "@/components/map/HomeMap";

const verticals: { href: string; title: string; description: string; cta: string; icon: IconName }[] = [
  {
    href: "/corrida",
    title: "Corrida",
    description: "Pop, Moto, Pop Expresso, Negocia, Táxi, Entrega Moto e Entrega Carro, com mapa e painel lado a lado.",
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
    description: "Origem, destino e categoria no mesmo painel, sem trocar de aparelho no meio da operação.",
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
          <HomeMap />
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
                <Icon name={v.icon} size={24} />
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
                t: "O endereço já está na tela",
                d: "Ele chegou por mensagem, e-mail ou planilha. Copiar e colar evita digitar tudo de novo e errar o número.",
              },
              {
                t: "Mapa e painel lado a lado",
                d: "A tela grande mostra rota, categorias e preço de uma vez. Escolher deixa de ser uma etapa por tela.",
              },
              {
                t: "Quem despacha o dia inteiro",
                d: "Loja, portaria e recepção pedem corrida e entrega em série. Com teclado, cada pedido custa segundos.",
              },
              {
                t: "O carrinho vira coluna fixa",
                d: "Dá para comparar lojas sem perder o que já escolheu. No celular, sair da loja é recomeçar.",
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
