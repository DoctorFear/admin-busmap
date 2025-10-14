"use client";

import Image from "next/image";
import styles from "../styles/Navbar.module.css";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  AlertTriangle,
  LogOut,
} from "lucide-react";

export default function DriverNavbar() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Driver navigation">
      <div className={styles.logo}>
        <a href="/driver" style={{ cursor: 'pointer' }}>
          <Image
            src="/twilight-logo-taixe-icon.png"
            alt="Twilight Logo"
            width={150}
            height={40}
            priority
          />
        </a>
      </div>

      <ul className={styles.navLinks}>
        <li>
          <a
            onClick={() => scrollToSection('home')}
            className={styles.link}
            style={{ cursor: 'pointer' }}
          >
            <LayoutDashboard size={18} /> Trang chủ
          </a>
        </li>
        <li>
          <a
            onClick={() => scrollToSection('schedule')}
            className={styles.link}
            style={{ cursor: 'pointer' }}
          >
            <CalendarDays size={18} /> Lịch làm việc
          </a>
        </li>
        <li>
          <a
            onClick={() => scrollToSection('students')}
            className={styles.link}
            style={{ cursor: 'pointer' }}
          >
            <Users size={18} /> Danh sách học sinh
          </a>
        </li>
        <li>
          <a
            onClick={() => scrollToSection('alerts')}
            className={styles.link}
            style={{ cursor: 'pointer' }}
          >
            <AlertTriangle size={18} /> Cảnh báo
          </a>
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
