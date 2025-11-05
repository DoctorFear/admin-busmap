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
              alt="Ảnh đại diện học sinh"
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
            <p>
              <strong>Tên:</strong> Nguyễn Văn An
            </p>
            <p>
              <strong>Điểm đón:</strong> 123 Đường Lê Lợi
            </p>
            <p>
              <strong>Điểm trả:</strong> Trường DEF
            </p>
            <p>
              <strong>Lịch trình:</strong> Thứ 2–6, Xe 01, 6:30 AM – 8:00 AM
            </p>
            <button className={styles.submitBtn}>Cập nhật điểm đón</button>
          </div>
        </div>
      </div>
    </div>
  );
}
