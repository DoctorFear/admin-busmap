"use client";

import { useState } from "react";
import { notifications, NotificationItem } from "@/lib/data";
import styles from "./page.module.css";

export default function ParentNotificationPage() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className={styles.mainContent}>
      <div className={styles.notifications}>
        <h3>Thông báo</h3>

        <div style={{ marginBottom: "10px" }}>
          <input
            type="checkbox"
            id="push-notifications"
            checked={enabled}
            onChange={() => setEnabled(!enabled)}
            
          />
          <label htmlFor="push-notifications" style={{ marginLeft: "6px" }}>Bật thông báo đẩy</label>
        </div>

        {notifications.map((item: NotificationItem, index: number) => (
          <div data-no-translate
            key={index}
            className={`${styles.notificationItem} ${
              item.status.includes("Trễ") ? styles.alert : ""
            }`}
          >
            <strong>
              {item.bus} ({item.driver}):
            </strong>{" "}
            {item.status} - {item.time}
          </div>
        ))}

      </div>
    </div>
  );
}
