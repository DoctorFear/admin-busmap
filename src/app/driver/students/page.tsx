"use client";

import { useState } from 'react';
import { driverStudents, DriverStudent } from '@/lib/data1';
import styles from '../page.module.css';

export default function DriverStudentsPage() {
  const [studentList, setStudentList] = useState<DriverStudent[]>(driverStudents);

  const updateStudentStatus = (studentId: string, newStatus: DriverStudent['status']) => {
    setStudentList(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
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

  const completedStudents = studentList.filter(s => 
    s.status === 'da-don' || s.status === 'dang-tren-xe' || s.status === 'da-tra'
  ).length;
  const absentStudents = studentList.filter(s => s.status === 'vang-mat').length;

  return (
    <div className={styles.driverContainer}>
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
    </div>
  );
}
