"use client";

import { useState } from 'react';
import { driverStudents, weeklySchedule, DriverStudent, ScheduleItem } from '@/lib/data';
import styles from './page.module.css';

export default function DriverPage() {
  const [studentList, setStudentList] = useState<DriverStudent[]>(driverStudents);
  const [alertMessage, setAlertMessage] = useState('');
  const [alerts, setAlerts] = useState(['Kẹt xe tại ngã tư Lê Lợi - 6:45 AM, 19/09/2025']);

  const updateStudentStatus = (studentId: string, newStatus: DriverStudent['status']) => {
    setStudentList(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertMessage.trim()) {
      const newAlert = `${alertMessage} - ${new Date().toLocaleString('vi-VN')}`;
      setAlerts(prev => [newAlert, ...prev]);
      setAlertMessage('');
    }
  };

  const getStatusColor = (status: DriverStudent['status']) => {
    const colorMap = {
      'chua-don': '#6b7280',
      'da-don': '#16a34a',
      'dang-tren-xe': '#3b82f6',
      'da-tra': '#22c55e',
      'vang-mat': '#f59e0b',
      'su-co': '#dc2626'
    };
    return colorMap[status];
  };

  const completedStudents = studentList.filter(s => s.status === 'da-don' || s.status === 'dang-tren-xe' || s.status === 'da-tra').length;
  const absentStudents = studentList.filter(s => s.status === 'vang-mat').length;

  return (
    <div className={styles.driverContainer}>
      <div className={styles.mapSection}>
        <h3>Theo dõi hành trình</h3>
        <div className={styles.mapPlaceholder}>
          Bản đồ thời gian thực (Google Maps API sẽ được tích hợp)
          <div className={styles.mapControls}>
            <button>Phóng to</button>
            <button>Thu nhỏ</button>
            <button>Tắt theo dõi</button>
          </div>
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

      <div className={styles.studentList}>
        <h3>Danh sách học sinh</h3>
        <p style={{ marginBottom: '1rem', color: '#374151' }}>
          <strong>Trạng thái:</strong> Đã đón {completedStudents}/{studentList.length} học sinh, {absentStudents} vắng mặt
        </p>
        {studentList.map((student) => (
          <div key={student.id} className={styles.studentItem}>
            <p>{student.name} - Điểm đón: {student.pickupLocation}</p>
            <select 
              value={student.status}
              onChange={(e) => updateStudentStatus(student.id, e.target.value as DriverStudent['status'])}
              style={{ color: getStatusColor(student.status) }}
            >
              <option value="chua-don">Chưa đón</option>
              <option value="da-don">Đã đón</option>
              <option value="dang-tren-xe">Đang trên xe</option>
              <option value="da-tra">Đã trả</option>
              <option value="vang-mat">Vắng mặt</option>
              <option value="su-co">Sự cố</option>
            </select>
          </div>
        ))}
      </div>

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