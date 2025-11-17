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
        <p>Chọn một xe trên bản đồ để xem chi tiết</p>
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
        {/* ============================================ */}
        {/* LAYOUT 3 CỘT: ICON - HEADER - CONTENT */}
        {/* ============================================ */}
        
        {/* Tài xế */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '24px 80px 1fr',
          gap: '12px',
          alignItems: 'center',
          padding: '8px 0',
        }}>
          <User size={18} color="#2196F3" />
          <span style={{ fontSize: '13px', color: '#666' }}>Tài xế</span>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{bus.driverName}</span>
        </div>
        
        {/* Tuyến đường */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '24px 80px 1fr',
          gap: '12px',
          alignItems: 'center',
          padding: '8px 0',
        }}>
          <MapPin size={18} color="#FF9800" />
          <span style={{ fontSize: '13px', color: '#666' }}>Tuyến</span>
          <span style={{ fontSize: '14px', fontWeight: 700 }}>{bus.route}</span>
        </div>
        
        {/* Vị trí GPS - GIÁ TRỊ MÀU XANH NƯỚC BIỂN */}
        {bus.lat && bus.lng && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '24px 80px 1fr',
            gap: '12px',
            alignItems: 'center',
            padding: '8px 0',
          }}>
            <MapPin size={18} color="#00BCD4" />
            <span style={{ fontSize: '13px', color: '#666' }}>Vị trí GPS</span>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: 700,
              color: '#00BCD4', // Màu xanh nước biển
              fontFamily: 'monospace',
              letterSpacing: '0.3px',
            }}>
              {Number(bus.lat).toFixed(6)}, {Number(bus.lng).toFixed(6)}
            </span>
          </div>
        )}
        
        {/* Trạng thái di chuyển */}
        {bus.status && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '24px 80px 1fr',
            gap: '12px',
            alignItems: 'center',
            padding: '8px 0',
          }}>
            <div style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 
                bus.status === 'moving' ? '#4CAF50' :
                bus.status === 'stopped' ? '#FF9800' : '#9E9E9E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
            }}>
              {bus.status === 'moving' ? '🚍' : '⏸️'}
            </div>
            <span style={{ fontSize: '13px', color: '#666' }}>Trạng thái</span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 700,
              color: 
                bus.status === 'moving' ? '#4CAF50' :
                bus.status === 'stopped' ? '#FF9800' : '#9E9E9E',
            }}>
              {bus.status === 'moving' ? 'Đang di chuyển' :
               bus.status === 'stopped' ? 'Đã dừng' : 'Bảo trì'}
            </span>
          </div>
        )}
        
        {/* Kết nối */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '24px 80px 1fr',
          gap: '12px',
          alignItems: 'center',
          padding: '8px 0',
        }}>
          <Signal size={18} color={bus.isOnline ? '#4CAF50' : '#F44336'} />
          <span style={{ fontSize: '13px', color: '#666' }}>Kết nối</span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 700,
            color: bus.isOnline ? '#4CAF50' : '#F44336' 
          }}>
            {bus.isOnline ? '✓ Trực tuyến' : '✗ Mất tín hiệu'}
          </span>
        </div>
        
        {/* ETA nếu có */}
        {bus.eta && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '24px 80px 1fr',
            gap: '12px',
            alignItems: 'center',
            padding: '8px 0',
          }}>
            <Clock size={18} color="#9C27B0" />
            <span style={{ fontSize: '13px', color: '#666' }}>ETA</span>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>{bus.eta}</span>
          </div>
        )}
      </div>

      {bus.alerts && bus.alerts.length > 0 && (
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

      {/* THỜI GIAN CẬP NHẬT - PHẦN THỜI GIAN IN ĐẬM */}
      <div className={styles.footer}>
        <small>
          Cập nhật: <strong style={{ fontWeight: 700 }}>
            {bus.lastUpdate ? new Date(bus.lastUpdate).toLocaleTimeString('vi-VN') : 'N/A'}
          </strong>
        </small>
      </div>

      {/* BUTTON TẮT THEO DÕI - FIX LOGIC */}
      {onToggleTracking && bus.id && (
        <button
          onClick={() => {
            console.log('[BusInfoPanel] Click button toggle tracking:', bus.id, 'current:', bus.isTracking);
            onToggleTracking(bus.id);
          }}
          className={`${styles.trackBtn} ${bus.isTracking ? styles.active : ''}`}
        >
           Tắt theo dõi
        </button>
      )}
    </div>
  );
}