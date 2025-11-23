"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "../styles/Navbar.module.css";

import { setLanguage, translateAll } from "@/lib/autoTranslate";

import {
  Route,
  Bell,
  UserPen,
  Settings,
  LogOut,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function ParentNavbar() {
  const pathname = usePathname();
  const [displayLang, setDisplayLang] = useState<"VI" | "EN">("VI");

  // Khôi phục ngôn ngữ + dịch lần đầu
  useEffect(() => {
    const saved = localStorage.getItem("appLang");
    if (saved === "en") setDisplayLang("EN");
    setTimeout(translateAll, 150);
  }, []);

  // Dịch lại mỗi khi đổi ngôn ngữ
  useEffect(() => {
    translateAll();
  }, [displayLang]);

  const toggleLang = () => {
    const newLang = displayLang === "VI" ? "en" : "vi";
    setLanguage(newLang);
    setDisplayLang(newLang === "vi" ? "VI" : "EN");
  };

  // ------------------ LOGOUT FUNCTION ------------------
  async function handleLogout() {
    try {
      await fetch("http://localhost:8888/api/auth/logout", {
        method: "POST",
        credentials: "include",  // gửi cookie session
      });

      // Điều hướng về login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Parent navigation">
      {/* Logo */}
      <div className={styles.logo}>
        <Link href="/parent/journey">
          <Image
            src="/twilight-logo-parents-icon.png"
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
            href="/parent/journey"
            className={`${styles.link} ${pathname.startsWith("/parent/journey") ? styles.active : ""}`}
          >
            <Route size={18} /> Theo dõi hành trình
          </Link>
        </li>

        <li>
          <Link
            href="/parent/notification"
            className={`${styles.link} ${pathname.startsWith("/parent/notification") ? styles.active : ""}`}
          >
            <Bell size={18} /> Thông báo
          </Link>
        </li>

        <li>
          <Link
            href="/parent/information"
            className={`${styles.link} ${pathname.startsWith("/parent/information") ? styles.active : ""}`}
          >
            <UserPen size={18} /> Thông tin học sinh
          </Link>
        </li>

        <li>
          <Link
            href="/parent/setting"
            className={`${styles.link} ${pathname.startsWith("/parent/setting") ? styles.active : ""}`}
          >
            <Settings size={18} /> Cài đặt
          </Link>
        </li>

        {/* Nút đổi ngôn ngữ */}
        <li style={{ marginLeft: "auto"}}>
          <button
            data-no-translate
            onClick={toggleLang}
            className={styles.langButton}
            aria-label="Change language"
          >
            <Globe size={20} />
            {displayLang}
          </button>
        </li>

        {/* ------------------ NÚT LOGOUT ------------------ */}
        <li>
          <button
            onClick={handleLogout}
            className={styles.logout}
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </li>
      </ul>
    </nav>
  );
}
