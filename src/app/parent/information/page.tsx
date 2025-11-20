'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import { Upload } from 'lucide-react';
import styles from './page.module.css';

export default function Information(): JSX.Element {
  const [preview, setPreview] = useState<string>('/default-avatar.png'); // ảnh mặc định

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    }
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.informationCard}>
        <h3 className={styles.title}>Thông tin học sinh</h3>

        <div className={styles.infoContainer}>
          {/* Bên trái: ảnh */}
          <div className={styles.avatarSection}>
            <img
              src={preview}
              
              className={styles.studentAvatar}
            />
            <label htmlFor="avatar-upload" className={styles.uploadBtn}>
              <Upload size={18} /> Tải ảnh lên
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>

          {/* Bên phải: thông tin */}
          <div className={styles.studentDetails}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "#374151" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ fontWeight: "bold" }}>Tên:</span>
                <span data-no-translate>Nguyễn Văn An</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ fontWeight: "bold" }}>Điểm đón:</span>
                <span data-no-translate>123 Đường Lê Lợi</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ fontWeight: "bold" }}>Điểm trả:</span>
                <span data-no-translate>Trường DEF</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ fontWeight: "bold" }}>Lịch trình:</span>
                <span data-no-translate>Thứ 2–6, Xe 01, 6:30 AM – 8:00 AM</span>
              </div>
            </div>

            <button className={styles.submitBtn}>Cập nhật điểm đón</button>
          </div>
        </div>
      </div>
    </div>
  );
}
