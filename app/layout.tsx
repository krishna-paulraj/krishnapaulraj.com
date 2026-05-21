import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    "Full Stack Developer focused on Next.js, Web3, AI-powered applications, and modern web experiences.",

  keywords: [
    "Suresh Krishna Paulraj",
    "Full Stack Developer",
    "Next.js Developer",
    "React Developer",
    "Web3 Developer",
    "Blockchain",
    "AI Applications",
    "TypeScript",
    "Portfolio",
  ],

  authors: [{ name: "Suresh Krishna Paulraj" }],

  creator: "Suresh Krishna Paulraj",

  metadataBase: new URL("https://krishnapaulraj.com"),

  openGraph: {
    title: "Suresh Krishna Paulraj",
    description:
      "Full Stack Developer building modern web, AI, and blockchain applications.",
    url: "https://krishnapaulraj.com",
    siteName: "Suresh Krishna Paulraj Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Suresh Krishna Paulraj Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Suresh Krishna Paulraj",
    description:
      "Full Stack Developer building modern web, AI, and blockchain applications.",
    images: ["/og-image.png"],
    creator: "@thedevkrish",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
