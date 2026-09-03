"use client";

import { useEffect, useMemo, useState } from "react";
import { formatBRL, formatCountdown } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Padrão visual no estilo de QR Code, gerado localmente a partir de uma semente. */
function QrPattern({ seed, size = 25 }: { seed: string; size?: number }) {
  const cells = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    const rand = () => {
      h ^= h << 13;
      h >>>= 0;
      h ^= h >> 17;
      h ^= h << 5;
      h >>>= 0;
      return h / 4294967296;
    };
    const grid: boolean[][] = [];
    for (let y = 0; y < size; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < size; x++) row.push(rand() > 0.55);
      grid.push(row);
    }
    // Padrões de localização nos três cantos.
    const finder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const border = x === 0 || y === 0 || x === 6 || y === 6;
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[oy + y][ox + x] = border || core;
        }
      }
      // Margem branca ao redor.
      for (let y = -1; y < 8; y++) {
        for (let x = -1; x < 8; x++) {
          const gx = ox + x;
          const gy = oy + y;
          if (gx < 0 || gy < 0 || gx >= size || gy >= size) continue;
          if (x === -1 || y === -1 || x === 7 || y === 7) grid[gy][gx] = false;
        }
      }
    };
    finder(0, 0);
    finder(size - 7, 0);
    finder(0, size - 7);
    return grid;
  }, [seed, size]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-48 w-48 rounded-lg bg-white"
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR Code de demonstração"
    >
      {cells.map((row, y) =>
        row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#212121" /> : null)),
      )}
    </svg>
  );
}

interface PixScreenProps {
  amount: number;
  orderRef: string;
  onPaid: () => void;
  onCancel: () => void;
}

export function PixScreen({ amount, orderRef, onPaid, onCancel }: PixScreenProps) {
  const [seconds, setSeconds] = useState(15 * 60);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const code = useMemo(
    () =>
      `00020126580014br.gov.bcb.pix0136demo-${orderRef.toLowerCase()}-nao-e-um-pagamento-real5204000053039865406${amount.toFixed(2)}5802BR5909NOVE NOVE6009SAO PAULO62070503***6304ABCD`,
    [amount, orderRef],
  );

  useEffect(() => {
    if (verifying) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [verifying]);

  useEffect(() => {
    if (!verifying) return;
    const t = setTimeout(onPaid, 2000);
    return () => clearTimeout(t);
  }, [verifying, onPaid]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const expired = seconds === 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
      <div>
        <h2 className="text-[28px] font-semibold leading-tight">Pague com Pix</h2>
        <p className="mt-1 text-secondary-99">
          Escaneie o código ou copie e cole no aplicativo do seu banco.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-99 p-6">
        <QrPattern seed={code} />
        <p className="text-2xl font-bold">{formatBRL(amount)}</p>
        <p
          className="flex items-center gap-2 text-sm text-secondary-99"
          aria-live="polite"
        >
          <Icon name="clock" size={16} />
          {expired ? "Código expirado" : `Expira em ${formatCountdown(seconds)}`}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <label htmlFor="pix-code" className="text-left text-sm font-medium text-secondary-99">
          Pix copia e cola
        </label>
        <div className="flex gap-2">
          <input
            id="pix-code"
            readOnly
            value={code}
            className="h-12 min-w-0 flex-1 rounded-lg border border-border-99 bg-subtle-99 px-4 font-mono text-xs text-secondary-99"
            onFocus={(e) => e.currentTarget.select()}
          />
          <Button variant="ghost" onClick={copy} aria-live="polite">
            <Icon name={copied ? "check" : "copy"} />
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button size="lg" full onClick={() => setVerifying(true)} disabled={verifying || expired}>
          {verifying ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black-99/30 border-t-black-99" aria-hidden="true" />
              Verificando pagamento
            </>
          ) : (
            "Já fiz o pagamento"
          )}
        </Button>
        <Button variant="ghost" full onClick={onCancel} disabled={verifying}>
          Cancelar
        </Button>
      </div>

      <p className="text-[13px] text-muted-99">
        Simulação: nenhum pagamento é processado. Clicar em “Já fiz o pagamento” sempre confirma.
      </p>
    </div>
  );
}
