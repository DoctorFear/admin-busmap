// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import { setLanguage, getCurrentLang, translateAll } from "@/lib/autoTranslate";
import { Globe } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // State cho nút ngôn ngữ
  const [displayLang, setDisplayLang] = useState<"VI" | "EN">("VI");

  useEffect(() => {
    const saved = getCurrentLang();
    if (saved === "en") setDisplayLang("EN");
    setTimeout(translateAll, 150);
  }, []);

  const toggleLang = () => {
    const newLang = displayLang === "VI" ? "en" : "vi";
    setLanguage(newLang);
    setDisplayLang(newLang === "vi" ? "VI" : "EN");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.msg || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }

      // Lưu userID vào localStorage
      if (data.data?.userID) {
        localStorage.setItem('userID', String(data.data.userID));
        localStorage.setItem('username', data.data.username || '');
        localStorage.setItem('fullName', data.data.fullName || '');
        localStorage.setItem('role', data.role || '');
      }

      switch (data.role) {
        case "admin":
          router.push("/admin");
          break;
        case "parent":
          router.push("/parent");
          break;
        case "driver":
          router.push("/driver");
          break;
        default:
          setError("Role không hợp lệ");
      }
    } catch {
      setError("Không thể kết nối server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
              placeholder="ph_lan, tai_le"
              data-no-translate
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="••••••••"
              data-no-translate
            />
          </div>

          {error && <p className={styles.error} data-no-translate>{error}</p>}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? (
              <span className={styles.loadingText}>
                <div className={styles.spinner}></div>
                Đang đăng nhập...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",  gap: "0.3rem" }}>
            <p style={{ marginBottom: "0.1rem", color: "#444", fontSize: "14px" }}>Chưa có tài khoản?</p>
            <Link href="/register" className={styles.registerLink}>
              Đăng ký
            </Link>
          </div>


          <button
            onClick={toggleLang}
            className={styles.registerLink2}
            aria-label="Đổi ngôn ngữ"
            style={{
              background: "none",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "0.25rem 0.75rem",
            }}
          >
            {displayLang}
          </button>
        </div>



      </div>
    </div>
  );
}