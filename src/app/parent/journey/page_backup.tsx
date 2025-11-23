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
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "#374151" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ fontWeight: "bold" }}>Xe:</span>
              <span data-no-translate>Xe 01</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ fontWeight: "bold" }}>Tài xế:</span>
              <span data-no-translate>Nguyễn Văn A</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ fontWeight: "bold" }}>Tuyến đường:</span>
              <span data-no-translate>Tuyến ABC</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ fontWeight: "bold" }}>Trạng thái:</span>
              <span data-no-translate>Đang di chuyển</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <span style={{ fontWeight: "bold" }}>Thời gian đến dự kiến:</span>
              <span data-no-translate>7:30 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
