"use client";

import { useSyncExternalStore } from "react";

/**
 * Nome de quem usa o site, pedido no modal de boas-vindas e guardado no
 * navegador. `null` quer dizer que ainda não perguntamos; string vazia, que a
 * pessoa pulou; `undefined`, que ainda não dá para saber (servidor e hidratação).
 */
const KEY = "99web:nome";
const listeners = new Set<() => void>();
// Cópia em memória para quando o navegador bloqueia o armazenamento.
let memory: string | null = null;

function read(): string | null {
  try {
    return localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useUserName(): string | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined);
}

export function saveUserName(name: string) {
  memory = name.trim();
  try {
    localStorage.setItem(KEY, memory);
  } catch {
    // Sem armazenamento, o nome vale só até recarregar a página.
  }
  listeners.forEach((fn) => fn());
}
