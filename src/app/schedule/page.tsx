'use client';

import { useState } from 'react';
import styles from './ScheduleForm.module.css';

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
}

export default function ScheduleForm({ initialData, onSubmit, onCancel }: ScheduleFormProps) {
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
  const [newRoad, setNewRoad] = useState('');
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    if (!formData.routeName) {
      setError('Tên tuyến không được để trống.');
      return false;
    }
    if (formData.roads.length === 0) {
      setError('Phải có ít nhất một đường đi qua.');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      setError('Ngày bắt đầu và kết thúc không được để trống.');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
      return false;
    }
    if (!formData.startTime || !formData.endTime) {
      setError('Thời gian bắt đầu và kết thúc không được để trống.');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setError('Thời gian bắt đầu phải trước thời gian kết thúc.');
      return false;
    }
    if (formData.days.length === 0) {
      setError('Phải chọn ít nhất một ngày hoạt động.');
      return false;
    }
    if (formData.roads.some((road, index) => formData.roads.indexOf(road) !== index)) {
      setError('Danh sách đường không được trùng lặp.');
      return false;
    }
    return true;
  };

  const handleAddRoad = () => {
    if (!newRoad) {
      setError('Tên đường không được để trống.');
      return;
    }
    if (formData.roads.includes(newRoad)) {
      setError('Tên đường đã tồn tại trong danh sách.');
      return;
    }
    setFormData({ ...formData, roads: [...formData.roads, newRoad] });
    setNewRoad('');
    setError('');
  };

  const handleRemoveRoad = (road: string) => {
    setFormData({ ...formData, roads: formData.roads.filter((r) => r !== road) });
  };

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      days: formData.days.includes(day)
        ? formData.days.filter((d) => d !== day)
        : [...formData.days, day],
    });
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(formData);
    setError('');
  };

  return (
    <div className={styles.formContainer}>
      <h2>{initialData ? 'Chỉnh sửa lịch trình' : 'Tạo lịch trình mới'}</h2>
      {error && <div className={styles.error}>{error}</div>}
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
        <div className={styles.roadInput}>
          <input
            type="text"
            value={newRoad}
            onChange={(e) => setNewRoad(e.target.value)}
            placeholder="Nhập tên đường"
            className={styles.input}
          />
          <button onClick={handleAddRoad} className={styles.addButton}>Thêm</button>
        </div>
        <ul className={styles.roadList}>
          {formData.roads.map((road, index) => (
            <li key={index} className={styles.roadItem}>
              {road}
              <button
                onClick={() => handleRemoveRoad(road)}
                className={styles.removeButton}
              >
                Xóa
              </button>
            </li>
          ))}
        </ul>
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
  );
}