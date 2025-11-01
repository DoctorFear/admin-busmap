"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "../styles/Navbar.module.css";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  AlertTriangle,
  LogOut,
} from "lucide-react";

export default function DriverNavbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Driver navigation">
      <div className={styles.logo}>
        <Link href="/driver">
          <Image
            src="/twilight-logo-taixe-icon.png"
            alt="Twilight Logo"
            width={150}
            height={40}
            priority
          />
        </Link>
      </div>

      <ul className={styles.navLinks}>
        <li>
          <Link
            href="/driver"
            className={`${styles.link} ${pathname === "/driver" ? styles.active : ""}`}
          >
            <LayoutDashboard size={18} /> Trang chủ
          </Link>
        </li>
        <li>
          <Link
            href="/driver/schedule"
            className={`${styles.link} ${pathname === "/driver/schedule" ? styles.active : ""}`}
          >
            <CalendarDays size={18} /> Lịch làm việc
          </Link>
        </li>
        <li>
          <Link
            href="/driver/students"
            className={`${styles.link} ${pathname === "/driver/students" ? styles.active : ""}`}
          >
            <Users size={18} /> Danh sách học sinh
          </Link>
        </li>
        <li>
          <Link
            href="/driver/alerts"
            className={`${styles.link} ${pathname === "/driver/alerts" ? styles.active : ""}`}
          >
            <AlertTriangle size={18} /> Cảnh báo
          </Link>
        </li>
      </ul>

      <div className={styles.logoutBtn}>
        <button type="button" className={styles.logout}>
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
