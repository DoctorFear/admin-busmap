"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function ParentNotificationPage() {
  const router = useRouter();

  const [parentID, setParentID] = useState<number | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Lấy parentID từ localStorage khi mount
  useEffect(() => {
    const storedParentID = localStorage.getItem("parentID");
    if (storedParentID) {
      setParentID(parseInt(storedParentID));
    }
  }, []);

  // Fetch notifications từ API
  useEffect(() => {
    if (!parentID) return;
    setLoading(true);
    fetch(`/api/notifications/${parentID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNotifications(data.data || []);
      })
      .catch((err) => console.error("Error fetching notifications:", err))
      .finally(() => setLoading(false));
  }, [parentID]);

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


        {loading ? (
          <p>Đang tải...</p>
        ) : notifications.length === 0 ? (
          <p style={{ color: "#777" }}>Không có thông báo nào</p>
        ) : (
          notifications.slice(0, 20).map((item, idx) => {
            const isAlert = item.type === 'INCIDENT' || (item.title && item.title.toLowerCase().includes('cảnh báo'));
            return (
              <div
                key={item.notificationID || idx}
                className={isAlert ? `${styles.notificationItem} ${styles.alert}` : styles.notificationItem}
                data-no-translate
              >
                <strong>{item.title || item.type}</strong>
                <br />
                {item.content}
                <br />
                <span style={{ fontSize: "0.8em", color: "#999" }}>
                  {item.sentAt ? new Date(item.sentAt).toLocaleString("vi-VN") : ""}
                </span>
              </div>
            );
          })
        )}

      </div>
    </div>
  );
}
