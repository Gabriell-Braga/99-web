import type { Metadata } from "next";
import { FoodListing } from "@/components/comida/FoodListing";

export const metadata: Metadata = { title: "Comida" };

export default function ComidaPage() {
  return <FoodListing />;
}
