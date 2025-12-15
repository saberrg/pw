import Footer from "@/app/_components/footer";
import AppHeader from "@/app/_components/app-header";
import { HOME_OG_IMAGE_URL } from "@/lib/constants";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/app/_components/ui/sonner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `Saber G.`,
  description: `Personal Website of Saber Garibi`,
  openGraph: {
    images: [HOME_OG_IMAGE_URL],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="40x40"
          href="/favicon/SG.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="40x40"
          href="/favicon/SG.png"
        />
        <link rel="shortcut icon" href="/favicon/SG.png" />
        <meta name="theme-color" content="#000" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen">
          <AppHeader />
          {children}
        </div>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
