"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";
import { setLanguage, getCurrentLang, translateAll } from "@/lib/autoTranslate";

type Role = "parent" | "driver";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("parent");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    studentName: "",
    address: "",
    license: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setFormData(prev => ({
      ...prev,
      studentName: newRole === "parent" ? prev.studentName : "",
      address: newRole === "parent" ? prev.address : "",
      license: newRole === "driver" ? prev.license : "",
    }));
  };

  // ==================== VALIDATION ====================
  const validateForm = () => {
    const { name, phone, username, password, confirmPassword, studentName, address, license } = formData;

    if (!name || !phone || !username || !password || !confirmPassword)
      return "Vui lòng điền đầy đủ các trường bắt buộc";

    // Mật khẩu >= 6 ký tự
    if (password.length < 6)
      return "Mật khẩu phải có ít nhất 6 ký tự";

    if (password !== confirmPassword)
      return "Mật khẩu xác nhận không khớp";

    // Số điện thoại VN
    const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
    if (!phoneRegex.test(phone))
      return "Số điện thoại không hợp lệ (VD: 0901234567)";

    // Parent validation
    if (role === "parent") {
      if (!studentName) return "Vui lòng nhập tên học sinh";
      if (!address) return "Vui lòng nhập địa chỉ";

      if (address.length < 5)
        return "Địa chỉ quá ngắn, vui lòng nhập đầy đủ";
    }

    // Driver validation (biển số xe VN)
    if (role === "driver") {
      const licenseRegex = /^([0-9]{2}[A-Z]{1,2}-?[0-9]{3}\.?[0-9]{2})$/;
      if (!licenseRegex.test(license))
        return "Biển số xe không đúng định dạng (VD: 51A-123.45)";
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
      const res = await fetch("http://localhost:8888/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.name,
          username: formData.username,
          password: formData.password,
          phone: formData.phone,
          role,
          studentName: role === "parent" ? formData.studentName : undefined,
          address: role === "parent" ? formData.address : undefined,
          license: role === "driver" ? formData.license : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Đăng ký thất bại");
        setLoading(false);
        return;
      }

      alert("Đăng ký thành công!");
      router.push("/login");
    } catch {
      setError("Không thể kết nối server");
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
            onClick={() => handleRoleChange("parent")}
          >
            Phụ huynh
          </div>
          <div
            className={`${styles.roleTab} ${role === "driver" ? styles.active : ""}`}
            onClick={() => handleRoleChange("driver")}
          >
            Tài xế
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Họ tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nguyễn Văn A"
              className={styles.input}
            />
          </div>

          {role === "parent" && (
            <>
              <div className={styles.formGroup}>
                <label>Tên học sinh</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  required
                  placeholder="Nguyễn Minh Anh"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Địa chỉ nhà</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Số nhà, đường, quận"
                  className={styles.input}
                />
              </div>
            </>
          )}

          {role === "driver" && (
            <div className={styles.formGroup}>
              <label>Biển số / Giấy phép</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleChange}
                required
                placeholder="51A-123.45"
                className={styles.input}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="0901234567"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="admin"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="••••••"
              className={styles.input}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

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
        <p>
          Đã có tài khoản?</p>
          <Link href="/login" className={styles.loginLink}>Đăng nhập</Link>
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
