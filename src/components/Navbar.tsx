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
  MapPin,
  LogOut,
  ListChecksIcon,
  MessageCircle,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [displayLang, setDisplayLang] = useState<"VI" | "EN">("VI");

  useEffect(() => {
    const saved = localStorage.getItem("appLang");
    if (saved === "en") setDisplayLang("EN");
    setTimeout(translateAll, 150);
  }, []);

  useEffect(() => {
    translateAll();
  }, [displayLang]);

  const toggleLang = () => {
    const newLang = displayLang === "VI" ? "en" : "vi";
    setLanguage(newLang);
    setDisplayLang(newLang === "vi" ? "VI" : "EN");
  };
  async function handleLogout() {
    try {
      await fetch("http://localhost:8888/api/auth/logout", {
        method: "POST",
        credentials: "include",  // gửi cookie để server xóa session
      });

      // Điều hướng về trang login
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
  
  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
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

      <ul className={styles.navLinks}>
        <li>
          <Link href="/dashboard" className={`${styles.link} ${pathname === "/dashboard" ? styles.active : ""}`}>
            <LayoutDashboard size={18} /> Trang chủ
          </Link>
        </li>
        <li>
          <Link href="/schedule" className={`${styles.link} ${pathname === "/schedule" ? styles.active : ""}`}>
            <CalendarDays size={18} /> Lịch trình
          </Link>
        </li>
        <li>
          <Link href="/assignment" className={`${styles.link} ${pathname === "/assignment" ? styles.active : ""}`}>
            <Users size={18} /> Phân công
          </Link>
        </li>
        <li>
          <Link href="/list" className={`${styles.link} ${pathname === "/list" ? styles.active : ""}`}>
            <ListChecksIcon size={18} /> Danh sách
          </Link>
        </li>
        <li>
          <Link href="/track" className={`${styles.link} ${pathname === "/track" ? styles.active : ""}`}>
            <MapPin size={18} /> Theo dõi
          </Link>
        </li>
        <li>
          <Link href="/messenger" className={`${styles.link} ${pathname === "/messenger" ? styles.active : ""}`}>
            <MessageCircle size={18} /> Liên hệ
          </Link>
        </li>

        {/* Nút đổi ngôn ngữ - giờ dùng CSS Module đẹp lung linh */}
        <li style={{ marginLeft: "auto" }}>
          <button
            data-no-translate
            onClick={toggleLang}
            className={styles.langButton}   // ← Đẹp chuẩn pro!
            aria-label="Đổi ngôn ngữ"
          >
            <Globe size={20} />
            {displayLang}
          </button>
        </li>
        <li>
          <button
            onClick={handleLogout}
            className={styles.logout}
            style={{ background: "none", border: "none", cursor: "pointer" }}
            aria-label="Logout"
          >
            <LogOut size={20} />
          </button>
        </li>
      </ul>
    </nav>
  );
}