import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";

import { siteUrl } from "@/lib/env";
import { site } from "@/lib/site";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} — Implementos y acabados para construcción`,
    template: `%s · ${site.shortName}`,
  },
  description:
    "Distribuidores de materiales de construcción y ferretería con entrega en cualquier ciudad de Colombia. Zona húmeda, baños, rejillas, eléctricos y seguridad.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: site.name,
    images: [{ url: "/marca/mab-placa.webp", width: 938, height: 950, alt: site.name }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f1720",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-CO"
      className={`${archivo.variable} ${instrumentSans.variable} ${plexMono.variable}`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
