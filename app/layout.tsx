import type { Metadata, Viewport } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components/layout";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SearchProvider } from "@/components/search/search";
import { ChatWidget } from "@/components/sections/chat";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
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
    "Jr. Blockchain Developer",
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
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
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
      <body className="flex min-h-full flex-col">
        {/* Reveal animations SSR content at opacity 0; without JS, unhide it. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#main-content"
          className="focus:bg-background focus:border-border sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:border focus:px-3 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(buildSiteGraph()) }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MotionProvider>
            <TooltipProvider>
              <SearchProvider items={getSearchItems()}>
                <Navbar />
                <main id="main-content" className="flex flex-1 flex-col">
                  {children}
                </main>
                <Footer />
                <ChatWidget />
              </SearchProvider>
            </TooltipProvider>
          </MotionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
