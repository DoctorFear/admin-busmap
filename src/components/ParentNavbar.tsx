"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "../styles/Navbar.module.css";
import {
  LayoutDashboard,
  Route,
  History,
  Bell,
  UserPen,
  Settings,
  LogOut,
} from "lucide-react";

export default function ParentNavbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Parent navigation">
      <div className={styles.logo}>
        <Link href="/parent">
          <Image
            src="/twilight-logo-phuhuynh-icon.png"
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
            href="/parent"
            className={`${styles.link} ${pathname === "/parent" ? styles.active : ""}`}
          >
            <LayoutDashboard size={18} /> Trang chủ
          </Link>
        </li>
        <li>
          <Link
            href="/parent/journey"
            className={`${styles.link} ${pathname === "/parent/journey" ? styles.active : ""}`}
          >
            <Route size={18} /> Theo dõi hành trình
          </Link>
        </li>
        <li>
          <Link
            href="/parent/history"
            className={`${styles.link} ${pathname === "/parent/history" ? styles.active : ""}`}
          >
            <History size={18} /> Lịch sử hành trình
          </Link>
        </li>
        <li>
          <Link
            href="/parent/notification"
            className={`${styles.link} ${pathname === "/parent/notification" ? styles.active : ""}`}
          >
            <Bell size={18} /> Thông báo
          </Link>
        </li>
                <li>
          <Link
            href="/parent/information"
            className={`${styles.link} ${pathname === "/parent/information" ? styles.active : ""}`}
          >
            <UserPen size={18} /> Thông tin học sinh
          </Link>
        </li>
        <li>
          <Link
            href="/parent/setting"
            className={`${styles.link} ${pathname === "/parent/setting" ? styles.active : ""}`}
          >
            <Settings size={18} /> Cài đặt
          </Link>
        </li>
        <li>
          <Link href="/logout" className={styles.logout}>
            <LogOut size={20} />
          </Link>
        </li>
      </ul>

    </nav>
  );
}
