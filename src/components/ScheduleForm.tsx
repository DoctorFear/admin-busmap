'use client';

import { useState } from 'react';
import RoadInput from './RoadInput';
import MapForm from './MapForm';
import styles from '../styles/ScheduleForm.module.css';

interface ScheduleItem {
  id: string;
  routeName: string;
  roads: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  days: string[];
}

interface ScheduleFormProps {
  initialData?: ScheduleItem;
  onSubmit: (data: ScheduleItem) => void;
  onCancel: () => void;
  setNotification: (message: string, type: 'success' | 'error') => void;
}

export default function ScheduleForm({ initialData, onSubmit, onCancel, setNotification }: ScheduleFormProps) {
  const [formData, setFormData] = useState<ScheduleItem>(
    initialData || {
      id: '',
      routeName: '',
      roads: [],
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      days: [],
    }
  );
  const [roadError, setRoadError] = useState('');

  const validateForm = (): boolean => {
    if (!formData.routeName) {
      setNotification('Tên tuyến không được để trống.', 'error');
      return false;
    }
    if (formData.roads.length === 0) {
      setNotification('Phải có ít nhất một đường đi qua.', 'error');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      setNotification('Ngày bắt đầu và kết thúc không được để trống.', 'error');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setNotification('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.', 'error');
      return false;
    }
    if (!formData.startTime || !formData.endTime) {
      setNotification('Thời gian bắt đầu và kết thúc không được để trống.', 'error');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setNotification('Thời gian bắt đầu phải trước thời gian kết thúc.', 'error');
      return false;
    }
    if (formData.days.length === 0) {
      setNotification('Phải chọn ít nhất một ngày hoạt động.', 'error');
      return false;
    }
    if (formData.roads.some((road, index) => formData.roads.indexOf(road) !== index)) {
      setNotification('Danh sách đường không được trùng lặp.', 'error');
      return false;
    }
    // Mock route validation (in production, integrate with OpenStreetMap API)
    if (formData.roads.length < 2) {
      setNotification('Tuyến đường không hợp lệ (cần ít nhất 2 điểm để tạo tuyến).', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(formData);
    setNotification(initialData ? 'Cập nhật lịch trình thành công!' : 'Tạo lịch trình thành công!', 'success');
  };

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      days: formData.days.includes(day)
        ? formData.days.filter((d) => d !== day)
        : [...formData.days, day],
    });
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formContainer}>
        <h2 className={styles.h2css}>{initialData ? 'Chỉnh sửa lịch trình' : 'Tạo lịch trình mới'}</h2>
        <div className={styles.formGroup}>
          <label>Tên tuyến</label>
          <input
            type="text"
            value={formData.routeName}
            onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
            placeholder="Nhập tên tuyến"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Đường đi qua</label>
          <RoadInput
            roads={formData.roads}
            onAddRoad={(road) => setFormData({ ...formData, roads: [...formData.roads, road] })}
            onRemoveRoad={(road) => setFormData({ ...formData, roads: formData.roads.filter((r) => r !== road) })}
            error={roadError}
            setError={setRoadError}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Khoảng thời gian áp dụng</label>
          <div className={styles.dateRange}>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={styles.input}
            />
            <span>đến</span>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Thời gian hoạt động</label>
          <div className={styles.timeRange}>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={styles.input}
            />
            <span>đến</span>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Ngày hoạt động</label>
          <div className={styles.days}>
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day) => (
              <label key={day} className={styles.dayLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.days.includes(day)}
                  onChange={() => handleDayToggle(day)}
                />
                {day}
              </label>
            ))}
          </div>
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
      <MapForm roads={formData.roads} />
    </div>
  );
}