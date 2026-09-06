import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { author } from "@/data/author";
import { photoCredits } from "@/data/foodPhotos";

export function Footer() {
  return (
    <footer className="border-t border-border-99 bg-subtle-99 pb-24">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr_1fr] md:px-8 xl:px-16">
        <div className="flex max-w-xl items-start gap-4">
          <Logo variant="amarelo" size={32} />
          <p className="text-sm text-secondary-99">
            Conceito independente, sem vínculo com a 99 ou com a DiDi. Criado para fim
            demonstrativo e de portfólio. Nenhum pedido, corrida, entrega ou pagamento nesta
            página é real. Mapa por OpenStreetMap e OpenFreeMap.
          </p>
        </div>

        <nav aria-label="Rodapé" className="flex flex-col gap-2 text-sm font-semibold">
          <span className="text-[13px] font-medium text-muted-99">Serviços</span>
          <Link href="/corrida" className="w-fit rounded hover:underline">
            Corrida
          </Link>
          <Link href="/comida" className="w-fit rounded hover:underline">
            Food
          </Link>
          <Link href="/entrega" className="w-fit rounded hover:underline">
            Entrega
          </Link>
          <Link href="/pedido/demo-entrega" className="w-fit rounded hover:underline">
            Acompanhamento
          </Link>
        </nav>

        <div className="flex flex-col gap-2 text-sm">
          <span className="text-[13px] font-medium text-muted-99">Feito por</span>
          <p className="font-semibold">{author.name}</p>
          <p className="text-secondary-99">{author.role}</p>
          <ul className="mt-1 flex flex-col gap-1" role="list">
            {author.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit rounded font-semibold hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-10 md:px-8 xl:px-16">
        <details className="text-sm text-secondary-99">
          <summary className="w-fit rounded font-semibold text-black-99">Créditos das fotos</summary>
          <p className="mt-2 text-[13px]">
            As fotos dos pratos vêm do Wikimedia Commons, em licença livre, e são servidas pelo próprio projeto.
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-[13px]" role="list">
            {photoCredits.map((c) => (
              <li key={c.kind}>
                {c.label}: {c.autor}, {c.licenca} ·{" "}
                <a href={c.fonte} target="_blank" rel="noopener noreferrer" className="rounded underline">
                  original
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </footer>
  );
}
