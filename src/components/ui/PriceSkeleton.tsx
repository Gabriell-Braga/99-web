"use client";

import { useEffect, useState } from "react";

/**
 * Enquanto o preço recalcula, cada valor vira um esqueleto de 60px por no
 * mínimo 400ms. Vale mesmo com prefers-reduced-motion.
 */
export function usePriceSkeleton(routeKey: string | null, ready: boolean): { loading: boolean } {
  const [tracked, setTracked] = useState<{ key: string | null; elapsed: boolean }>({ key: null, elapsed: false });

  // Trajeto mudou: reinicia a contagem mínima (ajuste de estado durante a renderização).
  if (routeKey !== tracked.key) {
    setTracked({ key: routeKey, elapsed: false });
  }

  useEffect(() => {
    if (!routeKey || tracked.elapsed) return;
    const t = setTimeout(() => {
      setTracked((s) => (s.key === routeKey ? { ...s, elapsed: true } : s));
    }, 400);
    return () => clearTimeout(t);
  }, [routeKey, tracked.elapsed]);

  return { loading: Boolean(routeKey) && (!ready || !tracked.elapsed) };
}

export function PriceSkeleton() {
  return <span className="inline-block h-5 w-[60px] animate-skeleton rounded bg-offwhite-99" aria-label="Calculando preço" role="status" />;
}
