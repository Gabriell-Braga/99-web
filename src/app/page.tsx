import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { HomeMap } from "@/components/map/HomeMap";
import { HeroRide } from "@/components/home/HeroRide";

const servicos: { href: string; title: string; description: string; icon: IconName; cta: string }[] = [
  {
    href: "/corrida",
    title: "Corrida",
    description: "Pop, Pop Expresso, Negocia e Táxi, com o preço de cada um lado a lado.",
    icon: "car",
    cta: "Pedir corrida",
  },
  {
    href: "/comida",
    title: "Food",
    description: "Ofertas, lojas preferidas e o carrinho fixo na coluna enquanto você compara.",
    icon: "utensils",
    cta: "Ver lojas",
  },
  {
    href: "/entrega",
    title: "Entrega",
    description: "Pacote de até 10 kg na moto, até 30 kg no carro, com contato dos dois lados.",
    icon: "box",
    cta: "Enviar pacote",
  },
  {
    href: "/pedido/demo-entrega",
    title: "Acompanhamento",
    description: "Etapas, motorista, veículo e mapa ao vivo até o pedido terminar.",
    icon: "clock",
    cta: "Ver um pedido",
  },
];

/** Vantagens, cada uma amarrada a um serviço da 99. */
const vantagens: { title: string; service: string; description: string; imagem: string; arte?: boolean; tint?: string }[] = [
  {
    service: "99 Corrida",
    title: "O preço de cada categoria antes de confirmar",
    description:
      "Pop, Moto, Pop Expresso, Negocia e Táxi na mesma lista, com a rota real no mapa ao lado. No Negocia você propõe o valor sem sair da tela.",
    imagem: "/pessoas/corrida.webp",
  },
  {
    service: "99 Food",
    title: "Comparar lojas sem perder o carrinho",
    description:
      "O carrinho fica fixo na coluna enquanto você olha ofertas e preferidos. Sair de uma loja não apaga o que já estava escolhido.",
    imagem: "/pessoas/mesa.webp",
  },
  {
    service: "99 Entrega",
    title: "Despachar um pacote sem trocar de aparelho",
    description:
      "Moto até 10 kg, carro até 30 kg, com origem, destino, contato dos dois lados e o que vai no pacote no mesmo painel.",
    imagem: "/vehicles/moto-box.png",
    arte: true,
    tint: "#fff8e1",
  },
  {
    service: "Feito para o computador",
    title: "O endereço já está na sua tela",
    description:
      "Cole o endereço inteiro que chegou por mensagem e ele vira rua, número, bairro e CEP. Com teclado, cada pedido custa segundos.",
    imagem: "/pessoas/computador.webp",
  },
];

const passos: { icon: IconName; title: string; description: string; imagem: string }[] = [
  {
    icon: "search",
    title: "Diga para onde vai",
    description: "Digite, cole o endereço inteiro ou escolha um recente. O texto vira rua, número e bairro sozinho.",
    imagem: "/screens/destino.webp",
  },
  {
    icon: "car",
    title: "Escolha a categoria",
    description: "Mapa e painel na mesma tela: a rota real aparece e cada categoria mostra preço e chegada.",
    imagem: "/screens/categorias.webp",
  },
  {
    icon: "pin",
    title: "Acompanhe até o fim",
    description: "Motorista, veículo, placa e etapas em tempo real, no mesmo mapa da solicitação.",
    imagem: "/screens/acompanhamento.webp",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Banner: a corrida começa aqui, com a rota real ao lado. */}
      <Container className="grid gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:py-16">
        <div className="flex min-w-0 flex-col gap-6">
          <h1 className="max-w-2xl text-[44px] font-bold leading-[1.05] text-black-99 md:text-[60px]">Para onde vamos?</h1>
          <p className="max-w-lg text-[17px] text-secondary-99">
            Corrida, Food e Entrega direto no navegador, com mapa e rota de verdade. O endereço já está na sua tela, então
            pedir leva segundos e o celular fica no bolso.
          </p>
          <HeroRide />
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="relative overflow-hidden rounded-2xl border border-border-99">
            <div className="h-[320px] lg:h-[380px]">
              <HomeMap />
            </div>
            {/* Prévia do painel de categorias, como ele aparece no fluxo. */}
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-xl bg-white p-3 shadow-high sm:inset-x-auto sm:right-4 sm:w-[340px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/vehicles/car-white.png" alt="" className="h-14 w-14 shrink-0 object-contain" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="whitespace-nowrap text-[15px] font-bold">Pop · 4 min</span>
                <span className="truncate text-[13px] text-secondary-99">Vila Olímpia ao Ibirapuera</span>
              </span>
              <span className="shrink-0 text-[17px] font-bold tabular-nums text-green-99">R$ 16,89</span>
            </div>
          </div>

          {/* Quem usa está no computador, e a foto diz isso antes do texto. */}
          <div className="hidden overflow-hidden rounded-2xl border border-border-99 lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pessoas/teclado.webp"
              alt=""
              className="h-[150px] w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </Container>

      {/* Serviços, sóbrios e todos com o mesmo peso. */}
      <section className="bg-subtle-99">
        <Container className="py-16 lg:py-20">
          <h2 className="text-[28px] font-bold md:text-[32px]">Tudo em uma aba só</h2>
          <p className="mt-2 max-w-2xl text-[17px] text-secondary-99">
            Quatro caminhos, cada um com o fluxo completo, estados de carregamento, erro e bloqueio.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
            {servicos.map((s) => (
              <li key={s.title}>
                <Link
                  href={s.href}
                  className="group flex h-full flex-col gap-3 rounded-2xl bg-white p-6 transition-colors duration-150 hover:bg-offwhite-99"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-99 text-black-99"
                    aria-hidden="true"
                  >
                    <Icon name={s.icon} size={24} />
                  </span>
                  <span className="text-[20px] font-bold">{s.title}</span>
                  <span className="text-[15px] text-secondary-99">{s.description}</span>
                  <span className="mt-auto inline-flex items-center gap-2 pt-3 text-[15px] font-bold text-black-99">
                    {s.cta}
                    <Icon name="arrowRight" size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Vantagens, uma por serviço da 99. */}
      <Container className="py-16 lg:py-20">
        <h2 className="text-[28px] font-bold md:text-[32px]">Vantagens do 99 Web</h2>
        <p className="mt-2 max-w-2xl text-[17px] text-secondary-99">
          A lacuna foi vista em operação real. Estes são os momentos em que o celular atrapalha.
        </p>
        <ul className="mt-8 grid gap-8 sm:grid-cols-2" role="list">
          {vantagens.map((v) => (
            <li key={v.service} className="flex flex-col gap-4">
              <div
                className="flex items-center justify-center overflow-hidden rounded-2xl border border-border-99"
                style={{ background: v.tint ?? "#f7f7f8" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.imagem}
                  alt=""
                  className={v.arte ? "h-[220px] w-auto object-contain py-6" : "h-[220px] w-full object-cover"}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold uppercase tracking-wide text-secondary-99">{v.service}</span>
                <h3 className="text-[22px] font-bold leading-tight">{v.title}</h3>
                <p className="text-[15px] text-secondary-99">{v.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      {/* As telas reais, na ordem em que a pessoa percorre. */}
      <section className="bg-subtle-99">
        <Container className="py-16 lg:py-20">
          <h2 className="text-[28px] font-bold md:text-[32px]">Como pedir uma corrida</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3" role="list">
            {passos.map((p, i) => (
              <li key={p.title} className="flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-2xl border border-border-99 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imagem}
                    alt=""
                    className="aspect-[16/11] w-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                  />
                  <span
                    className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-black-99 shadow-high"
                    aria-hidden="true"
                  >
                    <Icon name={p.icon} size={22} />
                  </span>
                </div>
                <h3 className="text-[20px] font-bold">
                  <span className="text-secondary-99">{i + 1}. </span>
                  {p.title}
                </h3>
                <p className="text-[15px] text-secondary-99">{p.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Link
              href="/corrida"
              className="inline-flex h-14 items-center gap-2 rounded-xl bg-yellow-99 px-6 text-[17px] font-bold text-black-99 transition-colors duration-150 hover:bg-yellow-99-hover"
            >
              Começar uma corrida
              <Icon name="arrowRight" />
            </Link>
          </div>
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
