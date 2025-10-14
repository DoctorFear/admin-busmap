import type { Metadata } from 'next';
import DriverNavbar from '@/components/DriverNavbar';
import Footer from '@/components/Footer';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'SSB 1.0 - Tài xế | Busmap',
  description: 'Hệ thống theo dõi xe buýt trường học - Tài xế',
};

export default function DriverLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <DriverNavbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
