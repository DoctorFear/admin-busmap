"use client";

import { Bus, Bell, User } from "lucide-react";
import styles from "./page.module.css";

export default function Home() {
  const busCount = 12;
  const notificationCount = 3;
  const parentName = "Phụ huynh Nguyễn Văn A";

  return (
    <div className={styles.mainContent}>
      <div className={styles.home}>
        <h2 className={styles.title}>Trang chủ</h2>
        <p className={styles.welcome}>Xin chào, {parentName} 👋</p>

        <div className={styles.stats}>
          <div className={styles.card}>
            <Bus className={styles.icon} />
            <div>
              <h4>{busCount}</h4>
              <p>Xe buýt đang hoạt động</p>
            </div>
          </div>

          <div className={styles.card}>
            <Bell className={styles.icon} />
            <div>
              <h4>{notificationCount}</h4>
              <p>Thông báo mới</p>
            </div>
          </div>

          <div className={styles.card}>
            <User className={styles.icon} />
            <div>
              <h4>Phụ huynh</h4>
              <p>{parentName}</p>
            </div>
          </div>
        </div>

        <button className={styles.btn}>Xem chi tiết</button>
      </div>
    </div>
  );
}
