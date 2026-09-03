import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/ui/States";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-16">
      <EmptyState
        icon="pin"
        title="Página não encontrada"
        description="O endereço que você abriu não existe neste protótipo. Volte ao início e escolha um dos três serviços."
        action={<LinkButton href="/">Ir para o início</LinkButton>}
      />
    </Container>
  );
}
