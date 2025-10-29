// components/BusInfoPanel.tsx
'use client';

import { Bus } from '@/lib/data_buses';
import { Car, User, MapPin, Clock, AlertTriangle, Signal } from 'lucide-react';
import styles from '@/styles/BusInfoPanel.module.css';

interface Props {
  bus: Bus | null;
  onToggleTracking: (id: string) => void;
}

export default function BusInfoPanel({ bus, onToggleTracking }: Props) {
  if (!bus) {
    return (
      <div className={styles.empty}>
        <p>Chọn một xe để xem chi tiết</p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Car size={24} color={bus.isOnline ? '#4CAF50' : '#999'} />
        <h3>{bus.busNumber}</h3>
      </div>

      <div className={styles.info}>
        <div className={styles.row}>
          <User size={16} />
          <span>{bus.driverName}</span>
        </div>
        <div className={styles.row}>
          <MapPin size={16} />
          <span>{bus.route}</span>
        </div>
        <div className={styles.row}>
          <Clock size={16} />
          <span>ETA: {bus.eta}</span>
        </div>
        <div className={styles.row}>
          <Signal size={16} color={bus.isOnline ? '#4CAF50' : '#F44336'} />
          <span style={{ color: bus.isOnline ? '#4CAF50' : '#F44336' }}>
            {bus.isOnline ? 'Đang kết nối' : 'Mất tín hiệu GPS'}
          </span>
        </div>
      </div>

      {bus.alerts.length > 0 && (
        <div className={styles.alerts}>
          <AlertTriangle size={16} color="#F44336" />
          <div>
            <strong>Cảnh báo:</strong>
            <ul>
              {bus.alerts.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className={styles.footer}>
        <small>
          Cập nhật: {bus.lastUpdate.toLocaleTimeString('vi-VN')}
        </small>
      </div>

      <button
        onClick={() => onToggleTracking(bus.id)}
        className={`${styles.trackBtn} ${!bus.isTracking ? styles.active : ''}`}
      >
        {bus.isTracking ? 'Tắt theo dõi' : 'Bật theo dõi'}
      </button>
    </div>
  );
}