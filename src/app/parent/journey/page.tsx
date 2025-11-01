'use client';

import React, { JSX } from 'react';
import styles from './page.module.css';

/**
 * Trang theo dõi hành trình dành cho /parent/journey
 * - Client component để sau này dễ tích hợp Google Maps client-side
 */
export default function ParentJourneyPage(): JSX.Element {
  return (
    <div className={styles.mainContent}>
      <div className={styles.overview}>
        <div className={styles.overviewHeader}>
          <h3>Theo dõi xe buýt</h3>
        </div>

        <div className={styles.mapPlaceholder} role="region" aria-label="Bản đồ hành trình">
          <div className={styles.mapText}>
            Bản đồ thời gian thực (Google Maps API sẽ được tích hợp ở đây)
          </div>

          <div className={styles.mapControls} role="group" aria-label="Điều khiển bản đồ">
            <button type="button" className={styles.controlBtn} aria-label="Phóng to">Phóng to</button>
            <button type="button" className={styles.controlBtn} aria-label="Thu nhỏ">Thu nhỏ</button>
            <button type="button" className={styles.controlBtn} aria-label="Tắt theo dõi">Tắt theo dõi</button>
          </div>
        </div>

        <div className={styles.busInfo} aria-live="polite">
          <p><strong>Xe:</strong> Xe 01 - Tuyến A</p>
          <p><strong>Tài xế:</strong> Nguyễn Văn A</p>
          <p><strong>Trạng thái:</strong> Đang di chuyển</p>
          <p><strong>Thời gian đến dự kiến:</strong> 7:30 AM</p>
        </div>
      </div>
    </div>
  );
}
