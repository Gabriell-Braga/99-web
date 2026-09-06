/** Logotipos oficiais da 99, em `public/logos/`. */
const file = {
  /** Selo amarelo com os noves pretos. Para fundo claro. */
  amarelo: "/logos/Amarelo.svg",
  /** Selo preto com os noves claros. */
  preto: "/logos/Preto.svg",
  /** Selo branco com os noves pretos. */
  branco: "/logos/Branco.svg",
  /** Só os noves, em preto, sem selo. Para fundo amarelo. */
  glifoPreto: "/logos/Null_Preto.svg",
  /** Só os noves, em branco, sem selo. Para fundo escuro. */
  glifoBranco: "/logos/Null_branco.svg",
} as const;

export type LogoVariant = keyof typeof file;

interface LogoProps {
  variant?: LogoVariant;
  size?: number;
  /** Decorativo por padrão; passe false quando for o único conteúdo do link. */
  decorative?: boolean;
}

export function Logo({ variant = "amarelo", size = 40, decorative = true }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={file[variant]}
      alt={decorative ? "" : "99"}
      width={size}
      height={size}
      className="block shrink-0"
      style={{ width: size, height: size }}
      aria-hidden={decorative ? "true" : undefined}
    />
  );
}
