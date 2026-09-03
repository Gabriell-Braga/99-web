import type { Metadata } from "next";
import { DeliveryView } from "@/components/entrega/DeliveryView";

export const metadata: Metadata = { title: "Entrega" };

export default function EntregaPage() {
  return <DeliveryView />;
}
