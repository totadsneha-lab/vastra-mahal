import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// This is the metadata block that goes in app/layout.tsx — the file
// Next.js reads to build the <head> of every page. It controls the
// browser tab title AND, importantly, what shows up when this site's
// link is shared on WhatsApp, Instagram, iMessage, etc.

export const metadata = {
  title: "NandrajTex — Pure Handloom Sarees",
  description: "Handwoven Banarasi, Kanjeevaram, and everyday handloom sarees. Shop online or order via WhatsApp.",

  // Open Graph tags — this is what WhatsApp, Instagram, Facebook, and
  // most messaging apps read to build the preview card.
  openGraph: {
    title: "NandrajTex — Pure Handloom Sarees",
    description: "Handwoven Banarasi, Kanjeevaram, and everyday handloom sarees.",
    url: "https://ntexonline.vercel.app",
    siteName: "NandrajTex",
    images: [
      {
        url: "https://ntexonline.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "NandrajTex — Handloom, always.",
      },
    ],
    locale: "en_IN",
    type: "website",
  },

  // Twitter/X uses its own tag set, separate from Open Graph — this
  // makes the preview look right there too, just in case.
  twitter: {
    card: "summary_large_image",
    title: "NandrajTex — Pure Handloom Sarees",
    description: "Handwoven Banarasi, Kanjeevaram, and everyday handloom sarees.",
    images: ["https://ntexonline.vercel.app/og-image.png"],
  },
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
