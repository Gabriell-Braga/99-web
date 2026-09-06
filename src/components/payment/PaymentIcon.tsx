import PixMark from "../../../public/icons/pix.svg";
import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Ícone de meio de pagamento. Pix usa a marca oficial de `public/icons/pix.svg`,
 * desenhada em `currentColor` para não sumir quando o fundo fica preto.
 */
export function PaymentIcon({ name, size = 24 }: { name: IconName | "pix"; size?: number }) {
  if (name === "pix") {
    return <PixMark width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false" />;
  }
  return <Icon name={name} size={size} />;
}
