import type { Metadata } from "next";
import { TrackingView } from "@/components/pedido/TrackingView";

export const metadata: Metadata = { title: "Acompanhar pedido" };

export default async function PedidoPage(props: PageProps<"/pedido/[id]">) {
  const { id } = await props.params;
  return <TrackingView id={id} />;
}
