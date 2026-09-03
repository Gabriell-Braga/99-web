import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { author } from "@/data/author";
import { Icon } from "@/components/ui/Icon";

const linkLabels: Record<keyof typeof author.links, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  site: "Site",
  whatsapp: "WhatsApp",
};

export function Footer() {
  const links = (Object.keys(author.links) as (keyof typeof author.links)[]).filter((k) => author.links[k]);
  return (
    <footer className="border-t border-border-99 bg-subtle-99">
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
          <Link href="/comida" className="w-fit rounded hover:underline">
            Comida
          </Link>
          <Link href="/corrida" className="w-fit rounded hover:underline">
            Corrida
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
          <a href={`mailto:${author.email}`} className="flex w-fit items-center gap-2 rounded font-semibold hover:underline">
            <Icon name="user" size={16} />
            {author.email}
          </a>
          {links.length > 0 && (
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-semibold" role="list">
              {links.map((k) => (
                <li key={k}>
                  <a href={author.links[k]} target="_blank" rel="noopener noreferrer" className="rounded hover:underline">
                    {linkLabels[k]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
