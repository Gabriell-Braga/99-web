import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
    "Conceito independente de interface web para corrida, entrega e comida. Sem vínculo com a 99. Nenhum pedido é real.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://tile.openstreetmap.org" crossOrigin="" />
        <link rel="preconnect" href="https://nominatim.openstreetmap.org" crossOrigin="" />
      </head>
      <body className="flex min-h-full flex-col">
        <AppProvider>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
