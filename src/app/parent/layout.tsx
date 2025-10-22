'use client';

import ParentNavbar from '@/components/ParentNavbar';
import { useEffect } from 'react';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Ẩn navbar chính (nếu có)
    const mainNav = document.querySelector('nav[aria-label="Main navigation"]');
    if (mainNav) {
      (mainNav as HTMLElement).style.display = 'none';
    }

    // Khi rời khỏi khu vực /parent thì hiện lại navbar chính
    return () => {
      const mainNav = document.querySelector('nav[aria-label="Main navigation"]');
      if (mainNav) {
        (mainNav as HTMLElement).style.display = '';
      }
    };
  }, []);

  return (
    <>
      <ParentNavbar />
      <main>{children}</main>
    </>
  );
}
