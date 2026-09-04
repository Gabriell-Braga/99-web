import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { author } from "@/data/author";

export function Footer() {
  return (
    <footer className="border-t border-border-99 bg-subtle-99 pb-24">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr_1fr] md:px-8 xl:px-16">
        <div className="flex max-w-xl items-start gap-4">
          <Logo size={32} />
          <p className="text-sm text-secondary-99">
            Conceito independente, sem vínculo com a 99 ou com a DiDi. Criado para fim
            demonstrativo e de portfólio. Nenhum pedido, corrida, entrega ou pagamento nesta
            página é real. Mapa por OpenStreetMap.
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
    </footer>
  );
}
