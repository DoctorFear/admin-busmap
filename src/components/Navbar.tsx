"use client";

import Link from "next/link";
import Image from "next/image"; // ✅ thêm dòng này
import { usePathname } from "next/navigation";
import styles from "../styles/Navbar.module.css";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MapPin,
  LogOut,
  ListChecksIcon,
  MessageCircle,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className={styles.logo}>
        <Link href="/">
          {/* ✅ Thay chữ MyApp bằng logo */}
          <Image
            src="/twilight-logo-admin-icon.png"
            alt="Twilight Logo"
            width={150}  // bạn có thể chỉnh lại cho cân đối
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
            href="/about"
            className={`${styles.link} ${pathname === "/about" ? styles.active : ""}`}
          >
            <CalendarDays size={18} /> Lịch trình
          </Link>
        </li>
        <li>
          <Link
            href="/assign"
            className={`${styles.link} ${pathname === "/assign" ? styles.active : ""}`}
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
      </ul>

      {/* Nút đăng xuất */}
      <div className={styles.logoutBtn}>
        <button type="button" className={styles.logout}>
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
