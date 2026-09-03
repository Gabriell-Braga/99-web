import type { Metadata } from "next";
import { CheckoutView } from "@/components/comida/CheckoutView";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return <CheckoutView />;
}
