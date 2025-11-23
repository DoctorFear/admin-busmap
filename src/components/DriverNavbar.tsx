"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "../styles/Navbar.module.css";

import { setLanguage, translateAll } from "@/lib/autoTranslate";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  AlertTriangle,
  LogOut,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function DriverNavbar() {
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
        credentials: "include", // BẮT BUỘC để gửi cookie session
      });

      // Điều hướng về trang login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Driver navigation">
      {/* Logo */}
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

      {/* Menu chính */}
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
            className={`${styles.link} ${pathname.startsWith("/driver/schedule") ? styles.active : ""}`}
          >
            <CalendarDays size={18} /> Lịch làm việc
          </Link>
        </li>

        <li>
          <Link
            href="/driver/students"
            className={`${styles.link} ${pathname.startsWith("/driver/students") ? styles.active : ""}`}
          >
            <Users size={18} /> Danh sách học sinh
          </Link>
        </li>

        <li>
          <Link
            href="/driver/alerts"
            className={`${styles.link} ${pathname.startsWith("/driver/alerts") ? styles.active : ""}`}
          >
            <AlertTriangle size={18} /> Cảnh báo
          </Link>
        </li>

        {/* Nút đổi ngôn ngữ */}
        <li style={{ marginLeft: "auto", marginRight: "20px" }}>
          <button
            data-no-translate
            onClick={toggleLang}
            className={styles.langButton}
            aria-label="Đổi ngôn ngữ"
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
