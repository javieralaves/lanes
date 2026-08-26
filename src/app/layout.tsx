import type { Metadata, Viewport } from "next";
import {
  Archivo_Black,
  Barlow_Condensed,
  Chakra_Petch,
  DM_Sans,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";

const display = Chakra_Petch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const posterBrand = Archivo_Black({
  variable: "--font-poster-brand",
  subsets: ["latin"],
  weight: ["400"],
});

const posterCondensed = Barlow_Condensed({
  variable: "--font-poster-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const posterBody = DM_Sans({
  variable: "--font-poster-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Lanes — Cook along a recipe like a song",
    template: "%s · Lanes",
  },
  description:
    "Lanes turns recipes into timed prep lanes. Hit each cook step when it arrives. Play the weeknight lentil curry demo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1814",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} ${posterBrand.variable} ${posterCondensed.variable} ${posterBody.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
