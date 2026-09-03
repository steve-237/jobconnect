import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "JobConnect — Plateforme de Recrutement & Missions Ponctuelles",
  description:
    "Trouvez rapidement des prestataires qualifiés pour vos missions ou postulez à des offres près de chez vous. Paiement sécurisé Stripe, profils vérifiés et messagerie en temps réel.",
  keywords: [
    "JobConnect",
    "Missions ponctuelles",
    "Recrutement",
    "Jobbing",
    "Déménagement",
    "Bricolage",
    "Jardinage",
    "Paiement sécurisé",
    "Prestataires qualifiés",
  ],
  authors: [{ name: "JobConnect Team" }],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "JobConnect — Plateforme de Recrutement & Missions Ponctuelles",
    description:
      "Trouvez rapidement des prestataires qualifiés pour vos missions ou postulez à des offres près de chez vous. Paiement sécurisé Stripe, profils vérifiés et messagerie en temps réel.",
    siteName: "JobConnect",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "JobConnect Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobConnect — Plateforme de Recrutement & Missions Ponctuelles",
    description:
      "Trouvez rapidement des prestataires qualifiés pour vos missions ou postulez à des offres près de chez vous avec paiement sécurisé Stripe.",
    images: ["/icon.svg"],
  },
};

import SupportChatbot from "@/components/SupportChatbot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <LanguageProvider>
          {children}
          <SupportChatbot />
        </LanguageProvider>
      </body>
    </html>
  );
}
