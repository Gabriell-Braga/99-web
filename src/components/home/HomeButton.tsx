import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

type Tom = "amarelo" | "amareloNoEscuro" | "preto" | "branco";

const tons: Record<Tom, { base: string; bolha: string; seta: string; texto: string }> = {
  // A bolha é a cor que toma o botão inteiro no hover, então ela entra invertida.
  amarelo: {
    base: "bg-yellow-99 text-black-99",
    bolha: "bg-black-99",
    seta: "bg-black-99 text-yellow-99 group-hover:bg-yellow-99 group-hover:text-black-99",
    texto: "group-hover:text-yellow-99",
  },
  // Sobre fundo escuro o preto sumiria: o hover vira branco.
  amareloNoEscuro: {
    base: "bg-yellow-99 text-black-99",
    bolha: "bg-white",
    seta: "bg-black-99 text-yellow-99 group-hover:bg-yellow-99 group-hover:text-black-99",
    texto: "group-hover:text-black-99",
  },
  preto: {
    base: "bg-black-99 text-white",
    bolha: "bg-white",
    seta: "bg-white text-black-99 group-hover:bg-black-99 group-hover:text-white",
    texto: "group-hover:text-black-99",
  },
  branco: {
    base: "bg-white text-black-99 border border-border-99",
    bolha: "bg-yellow-99",
    seta: "bg-yellow-99 text-black-99 group-hover:bg-white",
    texto: "group-hover:text-black-99",
  },
};

interface HomeButtonProps {
  /** Link ou ação: um dos dois. */
  href?: string;
  onClick?: () => void;
  children: string;
  tom?: Tom;
  className?: string;
}

/**
 * Botão da home, no gesto do site da 99: a bolha da seta cresce e toma o fundo,
 * a seta sobe na diagonal e o sublinhado entra pela esquerda. Tudo em 400ms com
 * a mesma curva, e parado para quem pede menos movimento.
 */
export function HomeButton({ href, onClick, children, tom = "amarelo", className }: HomeButtonProps) {
  const t = tons[tom];
  const classe = cx(
        "group relative isolate inline-flex h-14 items-center gap-3 overflow-hidden rounded-xl pl-1.5 pr-5 text-[17px] font-bold",
    t.base,
    className,
  );
  const miolo = (
    <>
      {/* Círculo que vira o fundo do botão. Sai do lugar da seta e cresce. */}
      <span
        aria-hidden="true"
        className={cx(
          "absolute left-1.5 top-1/2 -z-10 h-11 w-11 -translate-y-1/2 rounded-lg transition-transform duration-[600ms] ease-[cubic-bezier(0.33,0,0.2,1)] group-hover:scale-[26] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          t.bolha,
        )}
      />

      <span
        aria-hidden="true"
        className={cx(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-[600ms] ease-[cubic-bezier(0.33,0,0.2,1)]",
          t.seta,
        )}
      >
        {/* Aponta para a direita e vira diagonal no hover. */}
        <Icon
          name="arrowRight"
          size={20}
          className="transition-transform duration-[600ms] ease-[cubic-bezier(0.33,0,0.2,1)] group-hover:-rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
        />
      </span>

      <span className={cx("relative transition-colors duration-[600ms]", t.texto)}>
        {children}
        {/* Sublinhado entrando pela esquerda. */}
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-[600ms] ease-[cubic-bezier(0.33,0,0.2,1)] group-hover:scale-x-100 motion-reduce:transition-none"
        />
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={classe}>
        {miolo}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classe}>
      {miolo}
    </button>
  );
}
