import type { Metadata } from "next";
import { RideView } from "@/components/corrida/RideView";

export const metadata: Metadata = { title: "Corrida" };

export default function CorridaPage() {
  return <RideView />;
}
