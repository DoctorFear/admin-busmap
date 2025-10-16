'use client';

import { useState } from 'react';
import styles from '../styles/AssignmentForm.module.css';
import { mockDrivers, mockBuses, mockRoutes } from '@/lib/data_assignment';

interface AssignmentItem {
  id: string;
  driver: string;
  bus: string;
  route: string;
  startTime: string;
}

interface AssignmentFormProps {
  initialData?: AssignmentItem;
  onSubmit: (data: AssignmentItem) => void;
  onCancel: () => void;
  setNotification: (message: string, type: 'success' | 'error') => void;
}

export default function AssignmentForm({ initialData, onSubmit, onCancel, setNotification }: AssignmentFormProps) {
  const [formData, setFormData] = useState<AssignmentItem>(
    initialData || {
      id: '',
      driver: '',
      bus: '',
      route: '',
      startTime: '',
    }
  );

  const handleSubmit = () => {
    if (!formData.driver || !formData.bus || !formData.route || !formData.startTime) {
      setNotification('Vui lòng điền đầy đủ thông tin.', 'error');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className={styles.formContainer}>
      <h2>{initialData ? 'Chỉnh sửa phân công' : 'Thêm phân công'}</h2>
      <div className={styles.formGroup}>
        <label>Tài xế</label>
        <select
          value={formData.driver}
          onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
          className={styles.input}
        >
          <option value="">Chọn tài xế</option>
          {mockDrivers.map((driver) => (
            <option key={driver} value={driver}>{driver}</option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label>Xe buýt</label>
        <select
          value={formData.bus}
          onChange={(e) => setFormData({ ...formData, bus: e.target.value })}
          className={styles.input}
        >
          <option value="">Chọn xe buýt</option>
          {mockBuses.map((bus) => (
            <option key={bus} value={bus}>{bus}</option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label>Tuyến đường</label>
        <select
          value={formData.route}
          onChange={(e) => setFormData({ ...formData, route: e.target.value })}
          className={styles.input}
        >
          <option value="">Chọn tuyến đường</option>
          {mockRoutes.map((route) => (
            <option key={route} value={route}>{route}</option>
          ))}
        </select>
      </div>
      <div className={styles.formGroup}>
        <label>Thời gian bắt đầu</label>
        <input
          type="time"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          className={styles.input}
        />
      </div>
      <div className={styles.formActions}>
        <button onClick={handleSubmit} className={styles.submitButton}>
          {initialData ? 'Cập nhật' : 'Lưu'}
        </button>
        <button onClick={onCancel} className={styles.cancelButton}>
          Hủy
        </button>
      </div>
    </div>
  );
}