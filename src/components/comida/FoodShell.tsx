import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { BagColumn, BagFloating } from "@/components/comida/Bag";

/** Arquétipo "grade e gaveta": conteúdo à esquerda, sacola persistente à direita. */
export function FoodShell({ children }: { children: ReactNode }) {
  return (
    <Container className="flex flex-1 gap-8 py-6 pb-24 lg:pb-10">
      <div className="min-w-0 flex-1">{children}</div>
      <BagColumn />
      <BagFloating />
    </Container>
  );
}
