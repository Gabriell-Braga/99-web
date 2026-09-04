import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getRestaurant, restaurants } from "@/data/restaurants";
import { RestaurantView } from "@/components/comida/RestaurantView";

export function generateStaticParams() {
  return restaurants.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(props: PageProps<"/comida/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const r = getRestaurant(slug);
  return { title: r ? r.name : "Restaurante" };
}

export default async function RestaurantPage(props: PageProps<"/comida/[slug]">) {
  const { slug } = await props.params;
  const restaurant = getRestaurant(slug);
  if (!restaurant) notFound();
  return (
    <Suspense>
      <RestaurantView restaurant={restaurant} />
    </Suspense>
  );
}
