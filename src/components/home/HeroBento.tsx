import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

interface Bloco {
  href: string;
  titulo: string;
  texto: string;
  imagem: string;
  /** Classes do bloco (cor, forma) e da imagem (posição e tamanho). */
  bloco: string;
  img: string;
  escuro?: boolean;
}

/**
 * Os três serviços em blocos, no lugar das fotos soltas. A Corrida ocupa a
 * coluna inteira com o canto grande arredondado, como os painéis do site da 99;
 * Food e Entrega dividem a outra coluna. As imagens são os recortes do projeto,
 * saindo pela borda como nos banners do Food.
 */
const blocos: Bloco[] = [
  {
    href: "/corrida",
    titulo: "Corrida",
    texto: "Pop, Moto, Negocia e Táxi com o preço lado a lado.",
    imagem: "/vehicles/car-white.png",
    bloco: "row-span-2 bg-yellow-99 rounded-[24px] rounded-tr-[56px] sm:rounded-[28px] sm:rounded-tr-[88px]",
    img: "absolute -bottom-3 left-1/2 w-[84%] max-w-[256px] -translate-x-1/2 sm:-bottom-4",
  },
  {
    href: "/comida",
    titulo: "Food",
    texto: "Almoço, lanche e mercado.",
    imagem: "/food-icons/lanches.webp",
    // O prato do ícone é translúcido: em fundo escuro ele fica cinza, por isso o Food vai no claro.
    bloco: "bg-orange-99-bg rounded-[24px] sm:rounded-[28px]",
    img: "absolute bottom-2 right-3 w-[50%] max-w-[180px]",
  },
  {
    href: "/entrega",
    titulo: "Entrega",
    texto: "Pacote na moto ou no carro.",
    imagem: "/vehicles/moto-box.png",
    bloco: "bg-black-99 text-white rounded-[24px] rounded-bl-[56px] sm:rounded-[28px] sm:rounded-bl-[88px]",
    img: "absolute bottom-2 right-4 w-[48%] max-w-[170px]",
    escuro: true,
  },
];

/** Trajeto do bloco da Corrida: origem verde, rota tracejada e destino laranja, como no mapa do app. */
function Trajeto() {
  return (
    <svg
      viewBox="0 0 200 150"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-5 top-[32%] h-[34%] w-[calc(100%-2.5rem)] sm:inset-x-6"
      preserveAspectRatio="xMidYMid meet"
    >
      <path d="M30 120 C 60 120, 60 60, 100 60 S 150 20, 172 26" fill="none" stroke="#212121" strokeWidth="5" strokeLinecap="round" strokeDasharray="0.1 12" />
      <circle cx="30" cy="120" r="9" fill="#fff" stroke="#00C853" strokeWidth="5" />
      <path d="M172 4a14 14 0 0 1 14 14c0 10-14 24-14 24s-14-14-14-24a14 14 0 0 1 14-14z" fill="#FC4C02" />
      <circle cx="172" cy="18" r="5" fill="#fff" />
    </svg>
  );
}

export function HeroBento() {
  return (
    <ul className="grid h-[380px] grid-cols-2 grid-rows-2 gap-3 sm:h-[440px] lg:h-[480px]" role="list" aria-label="Serviços">
      {blocos.map((b, i) => (
        <li key={b.href} className={cx("min-h-0", i === 0 && "row-span-2")}>
          <Link
            href={b.href}
            className={cx(
              "group relative flex h-full flex-col gap-1 overflow-hidden p-4 transition-[translate] duration-300 ease-[cubic-bezier(0.33,0,0.2,1)] hover:-translate-y-1 motion-reduce:hover:translate-y-0 sm:p-6",
              b.bloco,
            )}
          >
            <span className="flex items-center gap-2 text-[19px] font-bold leading-tight min-[400px]:text-[22px] sm:text-[26px]">
              {b.titulo}
              <span
                aria-hidden="true"
                className={cx(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-[rotate] sm:h-7 sm:w-7 duration-300 group-hover:-rotate-45 motion-reduce:group-hover:rotate-0",
                  b.escuro ? "bg-yellow-99 text-black-99" : "bg-black-99 text-white",
                )}
              >
                <Icon name="arrowRight" size={16} />
              </span>
            </span>
            <span className={cx("max-w-[15rem] text-[14px] leading-snug sm:text-[15px]", b.escuro ? "text-white/75" : "text-black-99/75")}>{b.texto}</span>
            {i === 0 && <Trajeto />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={b.imagem}
              alt=""
              aria-hidden="true"
              className={cx(
                "pointer-events-none object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.22)] transition-[scale] duration-500 ease-[cubic-bezier(0.33,0,0.2,1)] group-hover:scale-[1.04] motion-reduce:group-hover:scale-100",
                b.img,
              )}
              fetchPriority={i === 0 ? "high" : undefined}
              decoding="async"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
