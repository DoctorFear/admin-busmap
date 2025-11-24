"use client";

import { useState, useEffect } from 'react';
import styles from '../page.module.css';

interface Trip {
  tripID: number;
  routeName: string;
  tripDate: string;
  startTime: string;
  studentCount: number;
  status: string;
}

interface Alert {
  alertID: number;
  tripID: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  createdAt: string;
  resolvedAt: string | null;
  routeName: string;
  affectedStudents: number;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function DriverAlertsPage() {
  const [driverID, setDriverID] = useState<number | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripID, setSelectedTripID] = useState<number | null>(null);
  const [alertType, setAlertType] = useState('OTHER');
  const [severity, setSeverity] = useState('WARNING');
  const [alertMessage, setAlertMessage] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTrips, setFetchingTrips] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Get driverID from localStorage
  useEffect(() => {
    const storedDriverID = localStorage.getItem('driverID');
    if (storedDriverID) {
      setDriverID(parseInt(storedDriverID));
    }
  }, []);

  // Fetch driver's trips
  useEffect(() => {
    if (driverID) {
      fetchTrips();
      fetchAlertHistory();
    }
  }, [driverID]);

  const fetchTrips = async () => {
    if (!driverID) return;
    try {
      setFetchingTrips(true);
      const res = await fetch(`/api/driver-alerts/my-trips/${driverID}`);
      const data = await res.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Hiển thị tất cả chuyến xe từ ngày hôm nay trở đi (không lọc by status)
        const filteredTrips = data.data.filter((trip: Trip) => {
          const tripDate = new Date(trip.tripDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return tripDate >= today;
        });
        
        if (filteredTrips.length > 0) {
          setTrips(filteredTrips);
        } else {
          // Nếu không có chuyến nào từ hôm nay, hiển thị tất cả chuyến (để test)
          setTrips(data.data.slice(0, 20));
          showNotification('⚠️ Không có chuyến xe từ hôm nay, hiển thị tất cả chuyến để test', 'info');
        }
      } else {
        setTrips([]);
        showNotification('Không có chuyến xe', 'info');
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      showNotification('Lỗi tải danh sách chuyến xe', 'error');
    } finally {
      setFetchingTrips(false);
    }
  };

  const fetchAlertHistory = async () => {
    if (!driverID) return;
    try {
      const res = await fetch(`/api/driver-alerts/history/${driverID}`);
      const data = await res.json();
      
      if (data.success) {
        setAlerts(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching alert history:', err);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTripID || !alertMessage.trim()) {
      showNotification('Vui lòng chọn chuyến xe và nhập nội dung cảnh báo', 'error');
      return;
    }

    if (!driverID) {
      showNotification('Không tìm thấy ID tài xế', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/driver-alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverID,
          tripID: selectedTripID,
          alertType,
          message: alertMessage,
          severity,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showNotification(`✅ Cảnh báo đã gửi tới ${data.data.notificationCount} phụ huynh`, 'success');
        setAlertMessage('');
        setSelectedTripID(null);
        setAlertType('OTHER');
        setSeverity('WARNING');
        // Refresh alert history
        fetchAlertHistory();
      } else {
        showNotification(data.message || 'Lỗi gửi cảnh báo', 'error');
      }
    } catch (err) {
      console.error('Error sending alert:', err);
      showNotification('Lỗi gửi cảnh báo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '#FF5252';
      case 'WARNING':
        return '#FF9800';
      case 'INFO':
        return '#2196F3';
      default:
        return '#999';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '🔴 Nghiêm trọng';
      case 'WARNING':
        return '🟠 Cảnh báo';
      case 'INFO':
        return '🔵 Thông tin';
      default:
        return severity;
    }
  };

  return (
    <div className={styles.driverContainer}>
      {notification && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            backgroundColor:
              notification.type === 'success'
                ? '#E8F5E9'
                : notification.type === 'error'
                ? '#FFEBEE'
                : '#E3F2FD',
            color:
              notification.type === 'success'
                ? '#2E7D32'
                : notification.type === 'error'
                ? '#C62828'
                : '#1565C0',
            border: `1px solid ${
              notification.type === 'success'
                ? '#4CAF50'
                : notification.type === 'error'
                ? '#F44336'
                : '#2196F3'
            }`,
          }}
        >
          {notification.message}
        </div>
      )}

      <div className={styles.alerts}>
        <h3>📢 Gửi cảnh báo</h3>
        
        <form className={styles.alertForm} onSubmit={handleAlertSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Chuyến xe (đang chạy):</label>
            <select
              value={selectedTripID || ''}
              onChange={(e) => setSelectedTripID(e.target.value ? parseInt(e.target.value) : null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                backgroundColor: !selectedTripID ? '#f9f9f9' : 'white',
              }}
              disabled={fetchingTrips || trips.length === 0}
            >
              <option value="">-- Chọn chuyến xe --</option>
              {trips.map((trip) => {
                const tripDate = new Date(trip.tripDate);
                const dateStr = tripDate.toLocaleDateString('vi-VN', { 
                  month: '2-digit', 
                  day: '2-digit' 
                });
                return (
                  <option key={trip.tripID} value={trip.tripID}>
                    {trip.routeName} • {dateStr} {trip.startTime} - {trip.endTime} ({trip.studentCount} học sinh)
                  </option>
                );
              })}
            </select>
            {fetchingTrips && (
              <p style={{ color: '#2196F3', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                ⏳ Đang tải danh sách chuyến xe...
              </p>
            )}
            {trips.length === 0 && !fetchingTrips && (
              <p style={{ color: '#FF9800', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                ⚠️ Không có chuyến xe trong ngày hôm nay ({new Date().toLocaleDateString('vi-VN')})
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Loại sự cố:</label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            >
              <option value="TRAFFIC">🚦 Tắc đường</option>
              <option value="ENGINE_BREAKDOWN">🚗 Xe hỏng</option>
              <option value="ACCIDENT">⚠️ Tai nạn</option>
              <option value="DELAY">⏱️ Trễ giờ</option>
              <option value="OTHER">📢 Thông báo khác</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>Mức độ:</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            >
              <option value="INFO">ℹ️ Thông tin</option>
              <option value="WARNING">⚠️ Cảnh báo</option>
              <option value="CRITICAL">🔴 Nghiêm trọng</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="alert-message">Mô tả sự cố:</label>
            <textarea 
              id="alert-message" 
              placeholder="Vd: Kẹt xe, hỏng xe..."
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                minHeight: '80px',
                fontSize: '1rem',
              }}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#E63946',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Đang gửi...' : '📤 Gửi cảnh báo'}
          </button>
        </form>
        
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>📋 Lịch sử cảnh báo (50 gần nhất)</h3>
        {alerts.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic' }}>Chưa có cảnh báo nào</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {alerts.map((alert) => (
              <div
                key={alert.alertID}
                style={{
                  padding: '1rem',
                  borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1.05rem' }}>{alert.routeName}</strong>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.95rem' }}>{alert.description}</p>
                    <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                      <span>Mức độ: {getSeverityLabel(alert.severity)}</span>
                      {' • '}
                      <span>Học sinh: {alert.affectedStudents}</span>
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#999', marginTop: '0.5rem' }}>
                      {new Date(alert.createdAt).toLocaleString('vi-VN')}
                      {alert.resolvedAt && ` • Giải quyết: ${new Date(alert.resolvedAt).toLocaleString('vi-VN')}`}
                    </div>
                  </div>
                  {alert.resolvedAt ? (
                    <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                      ✅ Đã giải quyết
                    </span>
                  ) : (
                    <span style={{ backgroundColor: '#FFF3E0', color: '#E65100', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.8rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                      ⏳ Đang xử lý
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
