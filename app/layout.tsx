import type { Metadata, Viewport } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SearchProvider } from "@/components/search/search";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSearchItems } from "@/lib/search";
import { buildSiteGraph, jsonLdString } from "@/lib/structured-data";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Suresh Krishna Paulraj",
    template: "%s | Suresh Krishna Paulraj",
  },

  description:
    "Software engineer at Blocsys building scalable web applications with TypeScript, React, and Next.js — plus notes on AI tooling and engineering craft.",

  keywords: [
    "Krishna Paulraj",
    "Suresh Krishna Paulraj",
    "Software Engineer",
    "Next.js Developer",
    "React Developer",
    "TypeScript",
    "Full Stack Developer",
    "AI Applications",
    "RAG",
    "Blocsys",
    "Portfolio",
  ],

  authors: [{ name: "Suresh Krishna Paulraj" }],

  creator: "Suresh Krishna Paulraj",

  metadataBase: new URL("https://krishnapaulraj.com"),

  openGraph: {
    title: "Suresh Krishna Paulraj",
    description:
      "Software engineer building scalable web apps with TypeScript, React, and Next.js. Writing about engineering and AI.",
    url: "https://krishnapaulraj.com",
    siteName: "Suresh Krishna Paulraj",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Suresh Krishna Paulraj",
    description:
      "Software engineer building scalable web apps with TypeScript, React, and Next.js. Writing about engineering and AI.",
    creator: "@thedevkrish",
  },

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ec" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1c19" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(buildSiteGraph()) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MotionProvider>
            <TooltipProvider>
              <SearchProvider items={getSearchItems()}>
                <Navbar />
                <main className="flex flex-1 flex-col">{children}</main>
                <Footer />
              </SearchProvider>
            </TooltipProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
