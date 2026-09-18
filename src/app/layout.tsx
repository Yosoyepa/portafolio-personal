import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./portfolio.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jet",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Juan Andrade | Senior AI Engineer",
  description:
    "Juan Carlos Andrade Unigarro, Senior AI Engineer. Agentes de IA, inteligencia documental, backend y plataformas AWS. Explora mi trayectoria y seis proyectos con código público.",
  keywords: [
    "AI Engineer",
    "Generative AI",
    "AWS",
    "Amazon Bedrock",
    "LLMOps",
    "Serverless",
    "AWS CDK",
    "Agentic AI",
    "RAG",
    "Portfolio",
  ],
  authors: [{ name: "Juan Carlos Andrade Unigarro" }],
  creator: "Juan Carlos Andrade Unigarro",
  openGraph: {
    title: "Juan Andrade | Senior AI Engineer",
    description:
      "IA generativa en producción · Arquitectura de agentes sobre AWS · LLMOps & FinOps",
    type: "website",
    locale: "es_CO",
    alternateLocale: "en_US",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05060b",
  colorScheme: "dark",
};

// Evita FOUC: oculta los elementos [data-reveal] antes del primer paint
// cuando el usuario no ha pedido movimiento reducido.
const noFouc = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('anim-ready')}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${geist.variable} ${jetbrains.variable}`}
    >
      <body>
        {/* El fondo del hero es el elemento LCP: se descubre tarde como background-image,
            así que se precarga por adelantado (variante móvil y desktop). */}
        <link rel="preload" as="image" href="/assets/nebula-blue.webp" media="(min-width: 641px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/assets/nebula-blue-mobile.webp" media="(max-width: 640px)" fetchPriority="high" />
        <script dangerouslySetInnerHTML={{ __html: noFouc }} />
        {children}
      </body>
    </html>
  );
}
