import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { GoogleAnalytics } from "@/components/google-analytics";
import { GoogleAdSense } from "@/components/google-adsense";
import { safeDbOperation } from "@/lib/db-fallback";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Portal da Transparência | O Moço do Te Amo",
  description: "Acompanhe todas as doações e vaquinhas com total transparência. Conheça as causas que apoiamos e participe!",
  icons: {
    icon: "/icon.svg",
  },
  metadataBase: new URL("https://portal.omocodoteamo.com.br"),
  openGraph: {
    title: "Portal da Transparência | O Moço do Te Amo",
    description: "Acompanhe todas as doações e vaquinhas com total transparência. Conheça as causas que apoiamos e participe!",
    url: "https://portal.omocodoteamo.com.br",
    siteName: "Portal da Transparência O Moço do Te Amo",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://portal.omocodoteamo.com.br/og-image.jpg", // Criar esta imagem
        width: 1200,
        height: 630,
        alt: "Portal da Transparência O Moço do Te Amo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal da Transparência | O Moço do Te Amo",
    description: "Acompanhe todas as doações e vaquinhas com total transparência. Conheça as causas que apoiamos e participe!",
    images: ["https://portal.omocodoteamo.com.br/og-image.jpg"], // Mesma imagem
  },
  alternates: {
    canonical: "https://portal.omocodoteamo.com.br",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  keywords: ["transparência", "doações", "vaquinhas", "causas sociais", "O Moço do Te Amo", "ajuda humanitária", "campanhas beneficentes"],
};

async function getConfigData() {
  // Verifica se estamos no build
  const isBuild = process.env.NODE_ENV === "production" &&
                 process.env.NEXT_PHASE === "phase-production-build";

  // Durante o build, retorna valores padrão
  if (isBuild) {
    console.log("Build time: Usando valores padrão para configuração");
    return {
      gaId: null,
      adsenseId: null
    };
  }

  // Em runtime, usa operação segura com fallback
  return await safeDbOperation(async () => {
    const config = await prisma.config.findFirst({
      select: {
        googleAnalyticsId: true,
        googleAdSenseId: true,
        adsAtivado: true
      },
    });

    return {
      gaId: config?.googleAnalyticsId || null,
      adsenseId: config?.adsAtivado ? config?.googleAdSenseId : null
    };
  }, {
    gaId: null,
    adsenseId: null
  });
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { gaId, adsenseId } = await getConfigData();

  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "O Moço do Te Amo",
              "url": "https://portal.omocodoteamo.com.br",
              "logo": "https://portal.omocodoteamo.com.br/icon.svg",
              "description": "Acompanhe todas as doações e vaquinhas com total transparência. Saiba como ajudar e conhecer todas as causas que apoiamos.",
              "foundingDate": "2022",
              "email": "contato@omocodoteamo.com.br"
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics gaId={gaId} />
        <GoogleAdSense adClient={adsenseId} />
        {children}
      </body>
    </html>
  );
}