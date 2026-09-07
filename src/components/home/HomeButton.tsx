import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";

type Tom = "amarelo" | "preto" | "branco";

const tons: Record<Tom, { base: string; bolha: string; seta: string; texto: string }> = {
  // A bolha é a cor que toma o botão inteiro no hover, então ela entra invertida.
  amarelo: {
    base: "bg-yellow-99 text-black-99",
    bolha: "bg-black-99",
    seta: "bg-black-99 text-yellow-99 group-hover:bg-yellow-99 group-hover:text-black-99",
    texto: "group-hover:text-yellow-99",
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
        "group relative isolate inline-flex h-14 items-center gap-3 overflow-hidden rounded-full pl-2 pr-6 text-[17px] font-bold",
    t.base,
    className,
  );
  const miolo = (
    <>
      {/* Círculo que vira o fundo do botão. Sai do lugar da seta e cresce. */}
      <span
        aria-hidden="true"
        className={cx(
          "absolute left-2 top-1/2 -z-10 h-10 w-10 -translate-y-1/2 rounded-full transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[22] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          t.bolha,
        )}
      />

      <span
        aria-hidden="true"
        className={cx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-1 group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0",
          t.seta,
        )}
      >
        {/* Seta diagonal, como no site da 99. */}
        <Icon name="arrowDiagonal" size={20} />
      </span>

      <span className={cx("relative transition-colors duration-[400ms]", t.texto)}>
        {children}
        {/* Sublinhado entrando pela esquerda. */}
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-0 h-0.5 w-full origin-left scale-x-0 bg-current transition-transform duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-100 motion-reduce:transition-none"
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
