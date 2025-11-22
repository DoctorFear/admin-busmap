"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "parent",
    studentName: "", // chỉ dành cho parent
    license: "",     // chỉ dành cho driver
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, phone, username, password, confirmPassword, role, studentName, license } = formData;

    if (!name || !phone || !username || !password || !confirmPassword)
      return "Vui lòng điền đầy đủ các trường bắt buộc";

    if (password !== confirmPassword) return "Mật khẩu xác nhận không khớp";

    // validation theo role
    if (role === "parent" && !studentName) return "Vui lòng nhập tên học sinh";
    if (role === "driver" && !license) return "Vui lòng nhập biển số xe / giấy phép";

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
    password: formData.password,   // ✅ gửi password thô
    phone: formData.phone,
    role: formData.role,
    studentName: formData.role === "parent" ? formData.studentName : undefined,
    license: formData.role === "driver" ? formData.license : undefined,
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

          {formData.role === "parent" && (
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
          )}

          {formData.role === "driver" && (
            <div className={styles.formGroup}>
              <label>Biển số / Giấy phép</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleChange}
                required
                placeholder="B2-123456"
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
              placeholder="••••••••"
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
              placeholder="••••••••"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Vai trò</label>
            <select name="role" value={formData.role} onChange={handleChange} className={styles.input}>
              <option value="parent">Phụ huynh</option>
              <option value="driver">Tài xế</option>
            </select>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        <p>
          Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
