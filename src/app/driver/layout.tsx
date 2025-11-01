'use client';

import DriverNavbar from '@/components/DriverNavbar';
import { useEffect } from 'react';

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const adminNav = document.querySelector('nav[aria-label="Main navigation"]');
    if (adminNav) {
      (adminNav as HTMLElement).style.display = 'none';
    }
    
    return () => {
      const adminNav = document.querySelector('nav[aria-label="Main navigation"]');
      if (adminNav) {
        (adminNav as HTMLElement).style.display = '';
      }
    };
  }, []);

  return (
    <>
      <DriverNavbar />
      {children}
    </>
  );
}
