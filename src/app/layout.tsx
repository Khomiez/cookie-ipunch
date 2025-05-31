import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Comic_Neue } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add Comic Neue as a close alternative to Comic Sans MS
const comicNeue = Comic_Neue({
  weight: ['300', '400', '700'],
  variable: "--font-comic",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fat Sprinkle - Fresh Cookies Delivered",
  description: "Freshly baked cookies made with love, delivered to your door",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${comicNeue.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}