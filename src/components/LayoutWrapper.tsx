// components/LayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import DriverNavbar from './DriverNavbar';
import ParentNavbar from './ParentNavbar';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Danh sách các trang KHÔNG cần Navbar & Footer
  const noLayoutPaths = ['/login', '/register', '/forgot-password'];
  const isNoLayoutPage = noLayoutPaths.some(path => pathname?.startsWith(path));

  // Nếu là trang không cần layout → chỉ trả về children
  if (isNoLayoutPage) {
    return <>{children}</>;
  }

  // Xác định Navbar theo role (giữ nguyên logic cũ)
  const isDriverPage = pathname?.startsWith('/driver');
  const isParentPage = pathname?.startsWith('/parent');

  let ActiveNavbar = Navbar;
  if (isDriverPage) ActiveNavbar = DriverNavbar;
  else if (isParentPage) ActiveNavbar = ParentNavbar;

  return (
    <>
      <ActiveNavbar />
      {children}
      <Footer />
    </>
  );
}