import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

import Footer from "@/components/Footer";
import HeaderJeu from "@/components/HeaderJeu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1000QBM",
  description: "Jeu Biblique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning={true}
        >
         <div className="flex flex-col justify-between min-h-screen bg-gradient-to-tl from-amber-700 via-orange-300 to-amber-800 m-4 sm:m-12 rounded-3xl shadow-lg ">
            {/* Contenu principal */}
            <div className="p-4 sm:p-8 flex-grow">
              <HeaderJeu />
            </div>
            <div className="p-4 sm:p-8 flex-grow">{children}</div>
            <Toaster />
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
