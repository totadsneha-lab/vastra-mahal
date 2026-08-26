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
  description: "Handwoven, pure handloom sarees — sourced directly from India's weaving clusters. Shop online or order via WhatsApp.",

  openGraph: {
    title: "NandrajTex — Pure Handloom Sarees",
    description: "Handwoven, pure handloom sarees — sourced directly from India's weaving clusters.",
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

  twitter: {
    card: "summary_large_image",
    title: "NandrajTex — Pure Handloom Sarees",
    description: "Handwoven, pure handloom sarees — sourced directly from India's weaving clusters.",
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
