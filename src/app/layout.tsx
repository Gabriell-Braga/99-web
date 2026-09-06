import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "99 Web · conceito",
    template: "%s · 99 Web",
  },
  description:
    "Conceito independente de interface web para corrida, Food, entrega e Pay. Sem vínculo com a 99. Nenhum pedido é real.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="preconnect" href="https://nominatim.openstreetmap.org" />
      </head>
      <body className="flex min-h-full flex-col bg-yellow-99">
        <AppProvider>
          <div className="flex min-h-full flex-1 flex-col lg:pl-[72px]">
          <Header />
          {/* O conteúdo branco sobe por cima da faixa amarela com raio de 24px, como no app. */}
          <main className="relative -mt-6 flex flex-1 flex-col rounded-t-[24px] bg-white">
            {children}
          </main>
          <Footer />
          </div>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
