"use client";

import { useState } from 'react';
import styles from '../page.module.css';

export default function DriverAlertsPage() {
  const [alertMessage, setAlertMessage] = useState('');
  const [alerts, setAlerts] = useState(['Kẹt xe tại ngã tư Lê Lợi - 6:45 AM, 19/09/2025']);

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertMessage.trim()) {
      const newAlert = `${alertMessage} - ${new Date().toLocaleString('vi-VN')}`;
      setAlerts(prev => [newAlert, ...prev]);
      setAlertMessage('');
    }
  };

  return (
    <div className={styles.driverContainer}>
      <div className={styles.alerts}>
        <h3>Gửi cảnh báo</h3>
        <form className={styles.alertForm} onSubmit={handleAlertSubmit}>
          <label htmlFor="alert-message">Mô tả sự cố:</label>
          <textarea 
            id="alert-message" 
            placeholder="Ví dụ: Kẹt xe, hỏng xe"
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
          />
          <button type="submit">Gửi cảnh báo</button>
        </form>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Lịch sử cảnh báo</h3>
        {alerts.map((alert, index) => (
          <div key={index} className={styles.alertItem}>{alert}</div>
        ))}
        
        <p className={styles.contactLinks}>
          <a href="mailto:support@ssb1.0.edu.vn">Liên hệ hỗ trợ</a>
        </p>
      </div>
    </div>
  );
}
