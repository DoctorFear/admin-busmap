// server component
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '../components/LayoutWrapper';
import { LoadScript } from '@react-google-maps/api';
// GLOBAL: Load GG Map 
import GoogleMapsProvider from '@/components/GoogleMapsProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Twilight | Busmap Assignment',
  description: 'A simple Next.js project with CSS Modules',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        
        {/* Wrap app by provider client, load GG Maps SDK one time for all page (project) */}
        <GoogleMapsProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </GoogleMapsProvider>
      
      </body>
    </html>
  );
}
