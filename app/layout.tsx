import type { Metadata, Viewport } from "next";
import { Calistoga, Plus_Jakarta_Sans } from "next/font/google";

import { RevealObserver } from "@/components/motion/reveal-observer";
import { siteUrl } from "@/lib/env";
import { site } from "@/lib/site";

import "./globals.css";

/**
 * Dos familias. Calistoga es una serifa de display redondeada y cálida: da a
 * los titulares un tono humano, lejos del grotesco geométrico que hace que
 * cualquier sitio parezca hecho con plantilla. Plus Jakarta Sans lleva el
 * texto: humanista, ancha y legible en pantallas pequeñas.
 */
const calistoga = Calistoga({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-calistoga",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
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
  themeColor: "#153144",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-CO"
      className={`${calistoga.variable} ${jakarta.variable}`}
      // El script de abajo añade la clase `js` antes de que React hidrate, así
      // que el atributo class del servidor y el del cliente no coinciden a
      // propósito. Es el mismo patrón que usan los conmutadores de tema.
      suppressHydrationWarning
    >
      <head>
        {/*
          Marca el documento como "con JavaScript" antes del primer pintado.
          Es lo que habilita el estado oculto de las apariciones: sin esta
          clase, el CSS deja todo visible y la página funciona igual.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`,
          }}
        />
      </head>
      <body className="min-h-dvh">
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
