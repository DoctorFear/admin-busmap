// app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import { mockParents, mockDrivers, Parent, Driver } from "@/lib/data_parents_drivers";
import { setLanguage, getCurrentLang, translateAll } from "@/lib/autoTranslate";
import { Globe } from "lucide-react";

type Role = "parent" | "driver";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("parent");
  const [formData, setFormData] = useState({
    name: "",
    studentName: "",
    license: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, phone, username, password, confirmPassword, studentName, license } = formData;

    if (!name || !phone || !username || !password || !confirmPassword) {
      return "Vui lòng điền đầy đủ các trường bắt buộc";
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username chỉ được chứa chữ, số và gạch dưới";
    }

    if (username.length < 3) {
      return "Username phải có ít nhất 3 ký tự";
    }

    const usernameExists = mockParents.some(p => p.username === username) ||
                           mockDrivers.some(d => d.username === username);
    if (usernameExists) {
      return "Username đã tồn tại. Vui lòng chọn tên khác.";
    }

    if (password !== confirmPassword) {
      return "Mật khẩu xác nhận không khớp";
    }
    if (password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!/^\d{10}$/.test(phone.replace(/\s/g, ""))) {
      return "Số điện thoại phải có 10 chữ số";
    }
    if (role === "parent" && !studentName) {
      return "Vui lòng nhập tên học sinh";
    }
    if (role === "driver" && !license) {
      return "Vui lòng nhập biển số xe hoặc giấy phép";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      if (role === "parent") {
        const newParent: Parent = {
          id: String(mockParents.length + 1),
          name: formData.name,
          studentName: formData.studentName,
          phone: formData.phone,
          username: formData.username,
          password: formData.password,
        };
        mockParents.push(newParent);
        alert("Đăng ký phụ huynh thành công!");
      } else {
        const newDriver: Driver = {
          id: String(mockDrivers.length + 1),
          name: formData.name,
          license: formData.license,
          phone: formData.phone,
          username: formData.username,
          password: formData.password,
        };
        mockDrivers.push(newDriver);
        alert("Đăng ký tài xế thành công!");
      }

      router.push("/login");
    } catch (err) {
      setError("Lỗi hệ thống. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Đăng ký</h2>

        <div className={styles.roleTabs}>
          <div
            className={`${styles.roleTab} ${role === "parent" ? styles.active : ""}`}
            onClick={() => setRole("parent")}
          >
            Phụ huynh
          </div>
          <div
            className={`${styles.roleTab} ${role === "driver" ? styles.active : ""}`}
            onClick={() => setRole("driver")}
          >
            Tài xế
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Họ tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Nguyễn Văn A"
              data-no-translate
            />
          </div>

          {role === "parent" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Tên học sinh</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Nguyễn Minh Anh"
                data-no-translate
              />
            </div>
          )}

          {role === "driver" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Biển số / Giấy phép</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="B2-123456"
                data-no-translate
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="0901234567"
              data-no-translate
            />
          </div>

          {/* USERNAME */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="••••••••"
              data-no-translate
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
                Đang xử lý...
              </span>
            ) : (
              "Đăng ký"
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
            <p style={{ marginBottom: "0.1rem", color: "#444", fontSize: "14px" }}>Đã có tài khoản?</p>
            <Link href="/login" className={styles.loginLink}>
              Đăng nhập
            </Link>
          </div>

          <button
            data-no-translate
            onClick={toggleLang}
            className={styles.registerLink2}
            aria-label="Đổi ngôn ngữ"
            style={{
              background: "none",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              padding: "0.25rem 0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Globe size={18} />
            {displayLang}
          </button>
        </div>
      </div>
    </div>
  );
}