"use client";

import { weeklySchedule, ScheduleItem } from '@/lib/data1';
import styles from '../page.module.css';

export default function DriverSchedulePage() {
  return (
    <div className={styles.driverContainer}>
      <div className={styles.schedule}>
        <h3>Lịch làm việc tuần này</h3>
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Tuyến đường</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {weeklySchedule.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.route}</td>
                <td>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.schedule}>
        <h3>Lịch làm việc hôm nay</h3>
        <p><strong>Tuyến đường:</strong> Tuyến A - Trường DEF</p>
        <p><strong>Thời gian:</strong> 6:30 AM - 8:00 AM, 19/09/2025</p>
        <p className={styles.contactLinks}>
          <a href="mailto:manager@ssb1.0.edu.vn">Liên hệ quản lý</a>
        </p>
      </div>
    </div>
  );
}
