import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { CartColumn, CartFloating } from "@/components/comida/Bag";

/** Grade de lojas à esquerda e carrinho em coluna fixa de 360px à direita. */
export function FoodShell({ children }: { children: ReactNode }) {
  return (
    <Container className="flex flex-1 gap-8 py-6 pb-40 lg:pb-28">
      <div className="min-w-0 flex-1">{children}</div>
      <CartColumn />
      <CartFloating />
    </Container>
  );
}
