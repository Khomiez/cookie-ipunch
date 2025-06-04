// src/app/(admin)/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google';
import { Comic_Neue } from 'next/font/google';
import "../globals.css";
import { ReactNode } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const comicNeue = Comic_Neue({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-comic-neue',
});

export const metadata: Metadata = {
  title: "Admin Dashboard - fatsprinkle.co",
  description: "Admin dashboard for managing fatsprinkle.co cookie shop",
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} ${comicNeue.variable} antialiased min-h-screen`}>
      {children}
    </div>
  );
}
