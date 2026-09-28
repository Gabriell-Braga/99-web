import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { cx } from "@/lib/cx";
import { Icon } from "@/components/ui/Icon";
import { HeroRide } from "@/components/home/HeroRide";
import { HeroBento } from "@/components/home/HeroBento";
import { HomeButton } from "@/components/home/HomeButton";
import { ServiceCards, type Servico } from "@/components/home/ServiceCards";
import { restaurants } from "@/data/restaurants";
import { foodCategories } from "@/data/categories";
import { deliveryCategories } from "@/data/rides";
import { deliveryFare } from "@/lib/pricing";
import { formatBRL } from "@/lib/format";

const servicos: Servico[] = [
  {
    href: "/corrida",
    title: "Corrida",
    description: "Veja o preço de cada categoria antes de pedir e acompanhe a rota no mapa.",
    icon: "car",
    cta: "Pedir corrida",
  },
  {
    href: "/comida",
    title: "Food",
    description: "Restaurantes e ofertas do dia, com o carrinho sempre à vista.",
    icon: "utensils",
    cta: "Ver lojas",
  },
  {
    href: "/entrega",
    title: "Entrega",
    description: "Mande um pacote de até 10 kg na moto ou até 30 kg no carro.",
    icon: "box",
    cta: "Enviar pacote",
  },
  {
    href: "/pedido/demo-entrega",
    title: "Acompanhamento",
    description: "Motorista, veículo e cada etapa do pedido ao vivo no mapa.",
    icon: "clock",
    cta: "Ver um pedido",
  },
];

interface Vantagem {
  service: string;
  title: string;
  description: ReactNode;
  /** Foto do bloco, ou uma miniatura da tela do serviço sobre fundo de cor. */
  imagem?: string;
  arte?: "precos" | "entrega";
}

/** Vantagens, cada uma amarrada a um serviço da 99. Alternam foto e texto, como no site da 99. */
const vantagens: Vantagem[] = [
  {
    service: "99 Corrida",
    title: "Compare antes de confirmar",
    description: (
      <>
        Pop, Moto, Pop Expresso, Negocia e Táxi na mesma lista, com a rota no mapa ao lado.{" "}
        <strong className="font-bold text-black-99">No Negocia você propõe o valor</strong> sem sair da tela.
      </>
    ),
    arte: "precos",
  },
  {
    service: "99 Food",
    title: "Troque de loja sem perder o carrinho",
    description: (
      <>
        O carrinho fica fixo ao lado enquanto você olha ofertas e preferidos.{" "}
        <strong className="font-bold text-black-99">Sair de uma loja não apaga o que já foi escolhido.</strong>
      </>
    ),
    imagem: "/pessoas/mesa.webp",
  },
  {
    service: "Feito para o computador",
    title: "Cole o endereço e pronto",
    description: (
      <>
        O endereço que chegou por mensagem vira rua, número, bairro e CEP.{" "}
        <strong className="font-bold text-black-99">Com teclado, cada pedido leva segundos.</strong>
      </>
    ),
    imagem: "/pessoas/computador.webp",
  },
  {
    service: "99 Entrega",
    title: "Despache um pacote sem pegar o celular",
    description: (
      <>
        Moto até 10 kg, carro até 30 kg.{" "}
        <strong className="font-bold text-black-99">Origem, destino, contatos e conteúdo</strong> no mesmo painel.
      </>
    ),
    arte: "entrega",
  },
];

/** Números do catálogo, para a seção do Food. */
const totalPratos = restaurants.reduce((soma, r) => soma + r.menu.reduce((s, sec) => s + sec.items.length, 0), 0);
const numeros = [
  { valor: String(restaurants.length), rotulo: "lojas perto de você" },
  { valor: String(foodCategories.length), rotulo: "categorias" },
  { valor: String(totalPratos), rotulo: "pratos no cardápio" },
];

/** Grifo amarelo embaixo da palavra-chave do título, como nos títulos do site da 99. */
function Grifo({ children }: { children: ReactNode }) {
  return (
    <span className="bg-[linear-gradient(transparent_60%,var(--color-yellow-99)_60%,var(--color-yellow-99)_92%,transparent_92%)] px-0.5 [box-decoration-break:clone]">
      {children}
    </span>
  );
}

/** Miniatura da lista de categorias da corrida, com preço em cada linha, para o bloco "Compare antes de confirmar". */
const precos = [
  { nome: "Pop", tempo: "3 min", preco: "R$ 16,05", img: "/vehicles/car-white.png", marcado: true },
  { nome: "Moto", tempo: "2 min", preco: "R$ 10,15", img: "/vehicles/moto-white.png" },
  { nome: "Táxi", tempo: "5 min", preco: "R$ 23,10", img: "/vehicles/car-yellow.png" },
];

function PrecosLadoALado() {
  return (
    <ul aria-hidden="true" className="flex w-full max-w-[340px] flex-col gap-2 rounded-3xl bg-white p-3 shadow-high">
      {precos.map((p) => (
        <li
          key={p.nome}
          className={cx("flex items-center gap-3 rounded-2xl px-3 py-2", p.marcado ? "bg-yellow-99-light ring-2 ring-black-99" : "")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.img} alt="" className="h-11 w-11 object-contain" loading="lazy" decoding="async" />
          <span className="flex flex-1 flex-col leading-tight">
            <span className="text-[16px] font-bold">{p.nome}</span>
            <span className="text-[13px] text-secondary-99">{p.tempo}</span>
          </span>
          <span className="text-[16px] font-bold tabular-nums">{p.preco}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Miniatura do pedido de entrega: retirada, destino e as duas opções com o
 * preço calculado pela mesma fórmula do fluxo, para uma rota de 3,4 km.
 */
const opcoesEntrega = deliveryCategories.map((c) => ({
  ...c,
  preco: formatBRL(deliveryFare(3.4, c.id)),
  img: c.id === "moto" ? "/vehicles/moto-box.png" : "/vehicles/car-box.png",
}));

function ResumoEntrega() {
  return (
    <div aria-hidden="true" className="flex w-full max-w-[340px] flex-col gap-3 rounded-3xl bg-white p-4 shadow-high">
      <div className="flex flex-col gap-2 rounded-2xl bg-offwhite-99 px-3 py-2.5 text-[14px]">
        <span className="flex items-center gap-2.5">
          <span className="h-3 w-3 shrink-0 rounded-full border-[3px] border-success-99 bg-white" />
          <span className="truncate font-bold">Retirada · Rua Harmonia, 480</span>
        </span>
        <span className="flex items-center gap-2.5">
          <span className="h-3 w-3 shrink-0 rounded-full border-[3px] border-orange-99 bg-white" />
          <span className="truncate font-bold">Entrega · Av. Paulista, 1000</span>
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {opcoesEntrega.map((o, i) => (
          <div
            key={o.id}
            className={cx("flex flex-col items-center rounded-2xl px-2 pb-2.5 pt-1 text-center", i === 0 ? "bg-yellow-99-light ring-2 ring-black-99" : "bg-offwhite-99")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={o.img} alt="" className="h-16 w-16 object-contain" loading="lazy" decoding="async" />
            <span className="text-[15px] font-bold leading-tight">{o.id === "moto" ? "Moto" : "Carro"}</span>
            <span className="text-[12px] text-secondary-99">até {o.weight}</span>
            <span className="mt-1 text-[15px] font-bold tabular-nums">{o.preco}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Banner: a corrida começa aqui, e os três serviços ficam ao lado em blocos. */}
      <Container className="grid grid-cols-1 gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:py-16">
        <div className="flex min-w-0 flex-col gap-6">
          <h1 className="max-w-2xl text-[44px] font-bold leading-[1.05] text-black-99 md:text-[60px]">Para onde vamos?</h1>
          <p className="max-w-lg text-[17px] text-secondary-99">
            Corrida, Food e Entrega direto no navegador, com mapa e rota de verdade. O endereço já está na sua tela, então
            pedir leva segundos e o celular fica no bolso.
          </p>
          <HeroRide />
        </div>

        <HeroBento />
      </Container>

      {/* Serviços, todos com o mesmo peso. */}
      <section className="bg-subtle-99">
        <Container className="py-16 lg:py-24">
          <h2 className="max-w-2xl text-[32px] font-bold leading-[1.1] md:text-[44px]">
            Tudo da 99, <Grifo>numa aba só</Grifo>
          </h2>
          <p className="mt-4 max-w-2xl text-[17px] text-black-99/75">
            Peça, acompanhe e pague <strong className="font-bold text-black-99">sem tirar o celular do bolso</strong>.
          </p>
          <ServiceCards items={servicos} />
        </Container>
      </section>

      {/* Vantagens em bento: as duas com miniatura da tela ocupam a largura de duas
          colunas, as de foto ficam em cards menores, e o lado da imagem alterna. */}
      <Container className="py-16 lg:py-24">
        <h2 className="max-w-2xl text-[32px] font-bold leading-[1.1] md:text-[44px]">
          Por que pedir pelo <Grifo>computador</Grifo>
        </h2>
        <ul className="mt-10 grid grid-cols-1 gap-4 lg:mt-14 lg:grid-cols-3" role="list">
          {vantagens.map((v) => {
            const texto = (
              <div className="flex flex-col gap-2">
                <span className="text-[14px] font-bold uppercase tracking-wide text-orange-99">{v.service}</span>
                <h3 className={cx("font-bold leading-[1.15]", v.arte ? "text-[28px] md:text-[32px]" : "text-[24px]")}>{v.title}</h3>
                <p className="max-w-md text-[16px] leading-relaxed text-black-99/75">{v.description}</p>
              </div>
            );
            if (v.arte) {
              return (
                <li
                  key={v.service}
                  className={cx(
                    "grid min-w-0 items-center gap-8 rounded-[24px] p-5 sm:grid-cols-2 sm:rounded-[28px] sm:p-8 lg:col-span-2 lg:p-10",
                    v.arte === "precos" ? "rounded-tl-[56px] bg-yellow-99 sm:rounded-tl-[96px]" : "rounded-br-[56px] bg-orange-99-bg sm:rounded-br-[96px]",
                  )}
                >
                  <div className={cx("flex min-w-0 justify-center", v.arte === "entrega" && "sm:order-first")}>
                    {v.arte === "precos" ? <PrecosLadoALado /> : <ResumoEntrega />}
                  </div>
                  <div className={cx("min-w-0", v.arte === "precos" && "sm:order-first")}>{texto}</div>
                </li>
              );
            }
            return (
              <li key={v.service} className="flex min-w-0 flex-col overflow-hidden rounded-[24px] bg-offwhite-99 sm:rounded-[28px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.imagem} alt="" className="h-[200px] w-full object-cover" loading="lazy" decoding="async" />
                <div className="p-6 sm:p-8">{texto}</div>
              </li>
            );
          })}
        </ul>
      </Container>

      {/* O Food ganha um painel amarelo com a comida recortada, como os banners do app. */}
      <Container className="pb-16 lg:pb-24">
        <section
          aria-labelledby="home-food"
          className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[32px] bg-yellow-99 px-6 pt-10 sm:px-10 lg:grid-cols-2 lg:gap-12 lg:rounded-tr-[140px] lg:px-14 lg:py-14"
        >
          <div className="flex min-w-0 flex-col gap-5">
            <span className="w-fit rounded-full bg-black-99 px-3 py-1 text-[13px] font-bold text-yellow-99">99 Food</span>
            <h2 id="home-food" className="text-[32px] font-bold leading-[1.1] md:text-[44px]">
              O almoço resolvido na aba do lado
            </h2>
            <p className="max-w-lg text-[17px] text-black-99/80">
              Compare duas lojas, mude de ideia e volte <strong className="font-bold text-black-99">sem perder nada</strong> do
              que já estava no carrinho.
            </p>

            <dl className="mt-1 grid grid-cols-3 gap-4 border-t border-black-99/15 pt-6">
              {numeros.map((n) => (
                <div key={n.rotulo} className="flex flex-col gap-1">
                  <dt className="text-[34px] font-bold leading-none tabular-nums">{n.valor}</dt>
                  <dd className="text-[14px] text-black-99/75">{n.rotulo}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-2">
              <HomeButton href="/comida" tom="preto">
                Ver lojas
              </HomeButton>
            </div>
          </div>

          {/* Pratos recortados, sobrepostos e saindo pela borda de baixo. */}
          <div aria-hidden="true" className="relative -mx-6 h-[280px] sm:-mx-10 sm:h-[340px] lg:mx-0 lg:h-[400px]">
            <span className="absolute left-1/2 top-1/2 h-[78%] w-[78%] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/35 sm:aspect-square sm:h-auto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/food-cut/sushi.webp" alt="" className="absolute right-[4%] top-[2%] w-[40%] max-w-[230px] object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.2)]" loading="lazy" decoding="async" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/food-cut/pizza-2.webp" alt="" className="absolute left-[2%] top-[10%] w-[40%] max-w-[230px] object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.2)]" loading="lazy" decoding="async" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/food-cut/burger.webp" alt="" className="absolute -bottom-6 left-1/2 w-[58%] max-w-[330px] -translate-x-1/2 object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.25)] lg:bottom-0" loading="lazy" decoding="async" />
          </div>
        </section>
      </Container>

      <Container className="pb-32">
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
