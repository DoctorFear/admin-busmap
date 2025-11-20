"use client";

import { useState, useEffect } from 'react';
import styles from '../page.module.css';

interface Trip {
  tripID: number;
  routeID: number;
  startTime: string;
  endTime: string;
  studentCount: number;
  status: string;
}

interface AlertRecord {
  alertID: number;
  tripID: number;
  severity: string;
  description: string;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: number | null;
  routeName: string;
  affectedStudents: number;
}

export default function DriverAlertsPage() {
  const [alertMessage, setAlertMessage] = useState('');
  const [alerts, setAlerts] = useState(['Kẹt xe tại ngã tư Lê Lợi - 6:45 AM, 19/09/2025']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [driverID, setDriverID] = useState<number | null>(null);
  const [tripID, setTripID] = useState<number | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertRecord[]>([]);
  const [busID, setBusID] = useState(null);
  const [alertType, setAlertType] = useState('OTHER');
  const [severity, setSeverity] = useState('WARNING');

  // Lấy driverID từ localStorage khi component mount
  useEffect(() => {
    const storedDriverID = localStorage.getItem('userID');
    if (storedDriverID) {
      const id = parseInt(storedDriverID);
      setDriverID(id);
      fetchDriverTrips(id);
      fetchAlertHistory(id);
    } else {
      setError('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
    }
  }, []);

  // Lấy danh sách chuyến xe của driver
  const fetchDriverTrips = async (id: number) => {
    try {
      const res = await fetch(`/api/driver-alerts/my-trips/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTrips(data.data);
        // Auto select first active trip
        const activeTrip = data.data.find((t: Trip) => t.status === 'ONGOING' || t.status === 'IN_PROGRESS');
        if (activeTrip) {
          setTripID(activeTrip.tripID);
        }
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  // Lấy lịch sử cảnh báo
  const fetchAlertHistory = async (id: number) => {
    try {
      const res = await fetch(`/api/driver-alerts/history/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setAlertHistory(data.data);
      }
    } catch (err) {
      console.error('Error fetching alert history:', err);
    }
  };

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMessage.trim()) {
      setError('Vui lòng nhập mô tả sự cố');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/driver-alerts/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverID: parseInt(String(driverID)),
          tripID: parseInt(String(tripID)),
          busID: busID ? parseInt(String(busID)) : null,
          alertType,
          severity,
          description: alertMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi gửi cảnh báo');
      }

      // Thêm vào danh sách hiển thị
      const newAlert = `${alertMessage} - ${new Date().toLocaleString('vi-VN')} ✅`;
      setAlerts(prev => [newAlert, ...prev]);
      setAlertMessage('');

      // Hiển thị thông báo thành công
      alert(`Cảnh báo đã gửi tới ${data.data.notificationCount} phụ huynh`);
      
      // Refresh lịch sử
      if (driverID) {
        fetchAlertHistory(driverID);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(`Lỗi: ${errorMessage}`);
      console.error('Alert submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Đánh dấu alert đã giải quyết
  const handleResolveAlert = async (alertID: number) => {
    console.log('Resolve alert:', { alertID, driverID });
    
    if (!driverID) {
      alert('Lỗi: Không tìm thấy ID tài xế. Vui lòng đăng nhập lại.');
      return;
    }
    
    try {
      const response = await fetch(`/api/driver-alerts/resolve/${alertID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolvedBy: driverID }),
      });

      const data = await response.json();
      console.log('Resolve response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi');
      }

      alert('Cảnh báo đã được đánh dấu là đã giải quyết');
      // Refresh lịch sử
      if (driverID) {
        fetchAlertHistory(driverID);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      alert(`Lỗi: ${errorMessage}`);
      console.error('Resolve alert error:', err);
    }
  };

  return (
    <div className={styles.driverContainer}>
      <div className={styles.alerts}>
        <h3>Gửi cảnh báo</h3>
        <form className={styles.alertForm} onSubmit={handleAlertSubmit}>
          <label htmlFor="trip-id">Chuyến xe (đang chạy):</label>
          <select 
            id="trip-id" 
            value={tripID ?? ''}
            onChange={(e) => setTripID(parseInt(e.target.value) || null)}
            disabled={loading || trips.length === 0}
          >
            <option value="">-- Chọn chuyến xe --</option>
            {trips.map((trip) => (
              <option key={trip.tripID} value={trip.tripID}>
                Chuyến {trip.tripID} - Route {trip.routeID} ({trip.studentCount} học sinh) - {trip.status}
              </option>
            ))}
          </select>

          {trips.length === 0 && (
            <div style={{ color: 'orange', marginBottom: '10px', fontSize: '0.9em' }}>
              Không có chuyến xe đang chạy
            </div>
          )}

          <label htmlFor="alert-type">Loại sự cố:</label>
          <select 
            id="alert-type" 
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
          >
            <option value="ENGINE_BREAKDOWN">Hỏng máy</option>
            <option value="TRAFFIC_ACCIDENT">Tai nạn giao thông</option>
            <option value="TRAFFIC_DELAY">Tắc đường</option>
            <option value="VEHICLE_BREAKDOWN">Sự cố xe</option>
            <option value="DELAYED_START">Khởi hành muộn</option>
            <option value="OTHER">Khác</option>
          </select>

          <label htmlFor="severity">Mức độ:</label>
          <select 
            id="severity" 
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="INFO">Thông tin</option>
            <option value="WARNING">Cảnh báo</option>
            <option value="CRITICAL">Nghiêm trọng</option>
          </select>

          <label htmlFor="alert-message">Mô tả sự cố:</label>
          <textarea 
            id="alert-message" 
            placeholder="Ví dụ: Kẹt xe, hỏng xe"
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            disabled={loading}
          />

          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi cảnh báo'}
          </button>
        </form>
        
<<<<<<< HEAD
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Lịch sử cảnh báo</h3>
        {alerts.map((alert, index) => (
          <div key={index} className={styles.alertItem} data-no-translate>{alert}</div>
        ))}
      
=======
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Lịch sử cảnh báo (50 gần nhất)</h3>
        {alertHistory.length === 0 ? (
          <p style={{ color: '#666' }}>Chưa có cảnh báo nào</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9em',
              marginTop: '1rem'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Chuyến</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Mô tả</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Mức độ</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Thời gian gửi</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Trạng thái</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Giải quyết lúc</th>
                  <th style={{ padding: '8px', textAlign: 'center' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {alertHistory.map((alert) => (
                  <tr key={alert.alertID} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>#{alert.tripID}</td>
                    <td style={{ padding: '8px' }}>{alert.description}</td>
                    <td style={{
                      padding: '8px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: alert.severity === 'CRITICAL' ? 'red' : alert.severity === 'WARNING' ? 'orange' : 'green'
                    }}>
                      {alert.severity}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {new Date(alert.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {alert.resolvedAt ? (
                        <span style={{ color: 'green' }}>✅ Đã giải quyết</span>
                      ) : (
                        <span style={{ color: 'orange' }}>⏳ Đang xử lý</span>
                      )}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {alert.resolvedAt ? (
                        <span style={{ fontSize: '0.85em' }}>
                          {new Date(alert.resolvedAt).toLocaleString('vi-VN')}
                          {alert.resolvedBy && <div style={{ color: '#666' }}>by ID: {alert.resolvedBy}</div>}
                        </span>
                      ) : (
                        <span style={{ color: '#ccc' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {!alert.resolvedAt && (
                        <button
                          onClick={() => handleResolveAlert(alert.alertID)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85em'
                          }}
                        >
                          Đã xử lý
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <p className={styles.contactLinks}>
          <a href="mailto:support@ssb1.0.edu.vn">Liên hệ hỗ trợ</a>
        </p>
>>>>>>> 0be1c5a (xong phần thông báo ( có sửa 1 it đăng nhập để test))
      </div>
    </div>
  );
}
