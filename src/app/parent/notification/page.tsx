"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function ParentNotificationPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Lấy parentID từ localStorage
    const id = localStorage.getItem("userID");
    if (id) {
      fetch(`/api/notifications/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setNotifications(data.data.map((item: any) => ({
              notificationID: item.notificationID || item.id,
              title: item.title || "Thông báo từ tài xế",
              content: item.content || item.message || item.status || "",
              sentAt: item.sentAt || item.time || item.createdAt || "",
              severity: item.severity || item.level || "INFO"
            })));
          }
        })
        .catch(() => setNotifications([]));
    }
  }, []);

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

        {notifications.length === 0 && (
          <div>Không có thông báo nào.</div>
        )}
        {notifications.map((item, index) => {
          // Phân biệt nguồn gửi
          const isAdmin = item.fromUserID === 1 || (item.title && item.title.toLowerCase().includes("admin"));
          return (
            <div
              key={item.notificationID || index}
              className={`${styles.notificationItem} ${item.severity === "WARNING" || item.severity === "CRITICAL" ? styles.alert : ""}`}
              style={{ marginBottom: 12 }}
            >
              {/* rgb(190, 0, 0); */}
              <div style={{ fontWeight: 700, color: isAdmin ? '#rgb(190, 0, 0)' : '#b71c1c', marginBottom: 4, display: 'flex', alignItems: 'center' }}>
              {/* <div style={{ fontWeight: 700, color: isAdmin ? '#1565c0' : '#b71c1c', marginBottom: 4, display: 'flex', alignItems: 'center' }}> */}
                <span style={{ marginRight: 6 }}>{isAdmin ? '🛡️' : '📢'}</span> {item.title || (isAdmin ? 'Thông báo từ Admin' : 'Thông báo từ tài xế')}
              </div>
              <div style={{ marginBottom: 4 }}>{item.content}</div>
              <div style={{ fontSize: '0.95em', color: '#555' }}>
                {item.sentAt ? new Date(item.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                {item.sentAt ? ` ${new Date(item.sentAt).toLocaleDateString('vi-VN')}` : ''}
                {item.severity ? `  ${item.severity === 'WARNING' || item.severity === 'CRITICAL' ? 'Mức độ: ' + item.severity : ''}` : ''}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
