import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
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
    "Portafolio de Juan Carlos Andrade Unigarro: Senior AI Engineer especializado en IA generativa sobre AWS, arquitectura de agentes, LLMOps, observabilidad e infraestructura serverless con CDK.",
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
      className={`${syne.variable} ${geist.variable} ${jetbrains.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: noFouc }} />
        {children}
      </body>
    </html>
  );
}
