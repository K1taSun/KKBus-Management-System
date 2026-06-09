import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LanguageProvider } from "@/lib/LanguageContext";
import { CartProvider } from "@/lib/CartContext";
import { CartDrawer } from "@/components/layout/CartDrawer";

export const metadata: Metadata = {
  title: "KKBus",
  description: "Zarezerwuj bilet na podróż z KKBus.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className="antialiased bg-background-main text-text-main flex flex-col min-h-screen">
        <LanguageProvider>
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
            <CartDrawer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

