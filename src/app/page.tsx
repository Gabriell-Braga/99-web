import { Container } from "@/components/layout/Container";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/Icon";
import { HeroRide } from "@/components/home/HeroRide";
import { HomeButton } from "@/components/home/HomeButton";
import { ServiceCards, type Servico } from "@/components/home/ServiceCards";
import { restaurants } from "@/data/restaurants";
import { foodCategories } from "@/data/categories";
import { pickPhoto } from "@/data/foodPhotos";

const servicos: Servico[] = [
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
    imagem: "/pessoas/entrega.webp",
  },
  {
    service: "Feito para o computador",
    title: "O endereço já está na sua tela",
    description:
      "Cole o endereço inteiro que chegou por mensagem e ele vira rua, número, bairro e CEP. Com teclado, cada pedido custa segundos.",
    imagem: "/pessoas/computador.webp",
  },
];

/** Números reais do catálogo do protótipo, para a seção do Food. */
const totalPratos = restaurants.reduce((soma, r) => soma + r.menu.reduce((s, sec) => s + sec.items.length, 0), 0);
const numeros = [
  { valor: String(restaurants.length), rotulo: "lojas abertas no catálogo" },
  { valor: String(foodCategories.length), rotulo: "categorias no trilho" },
  { valor: String(totalPratos), rotulo: "pratos com foto e preço" },
];

/** Quatro pratos do próprio catálogo, no mosaico da seção do Food. */
const mosaico = ["burger", "sushi", "pizza"] as const;

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
          <div className="relative overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pessoas/corrida.webp"
              alt=""
              className="h-[320px] w-full object-cover lg:h-[380px]"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          {/* Os outros dois serviços aparecem em foto, ao lado da corrida. */}
          <div className="hidden gap-3 lg:grid lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pessoas/mesa.webp" alt="" className="h-[150px] w-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pessoas/entrega.webp" alt="" className="h-[150px] w-full object-cover" loading="lazy" decoding="async" />
            </div>
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
          <ServiceCards items={servicos} />
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

      {/* O Food ganha a própria faixa, com o catálogo do protótipo em números. */}
      <section className="bg-black-99 text-white">
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:py-20">
          <div className="flex min-w-0 flex-col gap-5">
            <span className="w-fit rounded-full bg-yellow-99 px-3 py-1 text-[13px] font-bold text-black-99">99 Food</span>
            <h2 className="text-[32px] font-bold leading-tight md:text-[40px]">
              O almoço resolvido na aba do lado
            </h2>
            <p className="max-w-lg text-[17px] text-white/70">
              Trilho de categorias, ofertas do dia e o carrinho fixo na coluna. Você compara duas lojas, muda de ideia e
              volta sem perder nada do que já tinha escolhido.
            </p>

            <dl className="mt-2 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {numeros.map((n) => (
                <div key={n.rotulo} className="flex flex-col gap-1">
                  <dt className="text-[32px] font-bold leading-none tabular-nums text-yellow-99">{n.valor}</dt>
                  <dd className="text-[13px] text-white/70">{n.rotulo}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-2">
              <HomeButton href="/comida" tom="amareloNoEscuro">
                Ver lojas
              </HomeButton>
            </div>
          </div>

          {/* Mosaico com pratos do próprio catálogo. */}
          <ul
            className="grid grid-cols-2 grid-rows-[150px_150px] gap-3 lg:grid-rows-[190px_190px]"
            role="list"
            aria-label="Pratos do catálogo"
          >
            {mosaico.map((kind, i) => (
              <li key={kind} className={cx("min-h-0", i === 0 && "row-span-2")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pickPhoto(kind)}
                  alt=""
                  className="h-full w-full rounded-2xl object-cover"
                  loading="lazy"
                  decoding="async"
                />
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
