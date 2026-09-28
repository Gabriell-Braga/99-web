import type { Metadata } from "next";
import { Bebas_Neue, Montserrat, Pacifico, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { NameModal } from "@/components/layout/NameModal";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Fontes só das logos das lojas fictícias, para cada marca ter cara própria.
const pacifico = Pacifico({ variable: "--font-script", subsets: ["latin"], weight: "400", display: "swap" });
const playfair = Playfair_Display({ variable: "--font-serif", subsets: ["latin"], weight: ["700", "900"], display: "swap" });
const bebas = Bebas_Neue({ variable: "--font-display", subsets: ["latin"], weight: "400", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "99 Web",
    template: "%s · 99 Web",
  },
  description:
    "Conceito independente de interface web para corrida, Food, entrega e Pay. Sem vínculo com a 99. Nenhum pedido é real.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} ${pacifico.variable} ${playfair.variable} ${bebas.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="preconnect" href="https://nominatim.openstreetmap.org" />
      </head>
      <body className="flex min-h-full flex-col bg-yellow-99">
        <AppProvider>
          <Header />
          {/* O conteúdo branco sobe por cima da faixa amarela com raio de 24px, como no app. */}
          <main className="relative -mt-6 flex flex-1 flex-col rounded-t-[24px] bg-white">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <NameModal />
        </AppProvider>
      </body>
    </html>
  );
}
