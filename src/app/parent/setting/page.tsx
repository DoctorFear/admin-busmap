'use client';

import React, { JSX, FormEvent } from 'react';
import { Save } from 'lucide-react';
import styles from './page.module.css';

export default function Setting(): JSX.Element {
  const viewBusDetails = (busId: string) => {
    console.log(`Viewing details for bus: ${busId}`);
    // TODO: Thêm logic hiển thị chi tiết xe tại đây (modal, API,...)
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Đã lưu cài đặt');
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.settingsCard}>
        <h3 className={styles.title}>Cài đặt</h3>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="language">Ngôn ngữ:</label>
          <select id="language" className={styles.select}>
            <option value="vi">Tiếng Việt</option>
            <option value="en">Tiếng Anh</option>
          </select>

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            defaultValue="phuhuynh@example.com"
            className={styles.input}
          />

          <label htmlFor="phone">Số điện thoại:</label>
          <input
            type="tel"
            id="phone"
            defaultValue="0123456789"
            className={styles.input}
          />

          <label htmlFor="notification-distance">Khoảng cách thông báo:</label>
          <div className={styles.inlineInput}>
            <input
              type="number"
              id="notification-distance"
              defaultValue="500"
              className={styles.inputSmall}
            />
            <span>mét</span>
          </div>

          <button type="submit" className={styles.submitBtn}>
            <Save size={18} />
            <span>Lưu</span>
          </button>
        </form>

        <p className={styles.supportText}>
          <a href="mailto:support@ssb1.0.edu.vn" className={styles.supportLink}>
            Liên hệ hỗ trợ
          </a>
        </p>
      </div>
    </div>
  );
}
