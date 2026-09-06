import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Ícone de meio de pagamento. Pix usa a marca oficial em `public/icons/pix.svg`,
 * monocromática preta, no mesmo tamanho dos outros ícones.
 */
export function PaymentIcon({ name, size = 24 }: { name: IconName | "pix"; size?: number }) {
  if (name === "pix") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/icons/pix.svg" alt="" width={size} height={size} className="block" style={{ width: size, height: size }} />;
  }
  return <Icon name={name} size={size} />;
}
