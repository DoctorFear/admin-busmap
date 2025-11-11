"use client";

import Link from "next/link"; //  Điều hướng nội bộ
import Image from "next/image";  // Hình ảnh
import { usePathname } from "next/navigation"; // Lấy đường dẫn hiện tại thường làm menu
import styles from "../styles/Navbar.module.css";
import { useRouter } from "next/navigation";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MapPin,
  LogOut,
  ListChecksIcon,
  MessageCircle,
} from "lucide-react"; // lấy icon từ lucide-reacts

export default function Navbar() {
  const pathname = usePathname(); // Lấy đường dẫn hiện tại
  const router = useRouter();
  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className={styles.logo}>
        <Link href="/">
          <Image
            src="/twilight-logo-admin-icon.png"
            alt="Twilight Logo"
            width={150} 
            height={40}
            priority
          />
        </Link>
      </div>

      {/* Liên kết trung tâm */}
      <ul className={styles.navLinks}>
        <li>
          <Link
            href="/dashboard"
            className={`${styles.link} ${pathname === "/dashboard" ? styles.active : ""}`}
          >
            <LayoutDashboard size={18} /> Trang chủ
          </Link>
        </li>
        <li>
          <Link
            href="/schedule"
            className={`${styles.link} ${pathname === "/schedule" ? styles.active : ""}`}
          >
            <CalendarDays size={18} /> Lịch trình
          </Link>
        </li>
        <li>
          <Link
            href="/assignment"
            className={`${styles.link} ${pathname === "/assignment" ? styles.active : ""}`}
          >
            <Users size={18} /> Phân công
          </Link>
        </li>
        <li>
          <Link
            href="/list"
            className={`${styles.link} ${pathname === "/list" ? styles.active : ""}`}
          >
            <ListChecksIcon size={18} /> Danh sách
          </Link>
        </li>
        <li>
          <Link
            href="/track"
            className={`${styles.link} ${pathname === "/track" ? styles.active : ""}`}
          >
            <MapPin size={18} /> Theo dõi
          </Link>
        </li>
        <li>
          <Link
            href="/messenger"
            className={`${styles.link} ${pathname === "/messenger" ? styles.active : ""}`}
          >
            <MessageCircle size={18} /> Liên hệ
          </Link>
        </li>
        <li>
          <Link href="/login" className={styles.logout}>
            <LogOut size={20} />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
