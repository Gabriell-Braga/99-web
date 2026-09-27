"use client";

import { useEffect } from "react";

/**
 * Marca a tela atual como empilhada: abaixo de lg o cabeçalho amarelo sai e a
 * tela desenha a própria barra, como as telas de fluxo do app. Vale enquanto
 * `active` for verdadeiro e o componente estiver montado.
 */
export function useStackedScreen(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const root = document.documentElement;
    root.dataset.stacked = "";
    return () => {
      delete root.dataset.stacked;
    };
  }, [active]);
}
