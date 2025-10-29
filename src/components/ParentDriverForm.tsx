'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/ParentDriverForm.module.css';

interface ParentFormData {
  name: string;
  studentName: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface DriverFormData {
  name: string;
  license: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface FormProps {
  type: 'parent' | 'driver';
  onSubmit: (data: (ParentFormData | DriverFormData) & { id: string }) => void;
  onCancel: () => void;
  setNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function ParentDriverForm({ type, onSubmit, onCancel, setNotification }: FormProps) {
  const [formData, setFormData] = useState<ParentFormData | DriverFormData>(
    type === 'parent'
      ? { name: '', studentName: '', phone: '', username: '', password: '', confirmPassword: '' }
      : { name: '', license: '', phone: '', username: '', password: '', confirmPassword: '' }
  );

  useEffect(() => {
    setFormData(
      type === 'parent'
        ? { name: '', studentName: '', phone: '', username: '', password: '', confirmPassword: '' }
        : { name: '', license: '', phone: '', username: '', password: '', confirmPassword: '' }
    );
  }, [type]);

  const validate = (): boolean => {
    const common = formData as any;
    if (!common.name || !common.phone || !common.username || !common.password || !common.confirmPassword) {
      setNotification('Vui lòng điền đầy đủ thông tin.', 'error');
      return false;
    }

    if (common.password.length < 6) {
      setNotification('Mật khẩu phải có ít nhất 6 ký tự.', 'error');
      return false;
    }

    if (common.password !== common.confirmPassword) {
      setNotification('Mật khẩu và xác nhận mật khẩu không khớp.', 'error');
      return false;
    }

    if (!/^\d{10,11}$/.test(common.phone)) {
      setNotification('Số điện thoại không hợp lệ.', 'error');
      return false;
    }

    if (type === 'parent') {
      const data = formData as ParentFormData;
      if (!data.studentName) {
        setNotification('Vui lòng nhập tên học sinh.', 'error');
        return false;
      }
    } else {
      const data = formData as DriverFormData;
      if (!data.license) {
        setNotification('Vui lòng nhập số bằng lái.', 'error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (validate()) {
      const { confirmPassword, ...dataToSubmit } = formData;
      onSubmit({
        ...dataToSubmit,
        id: Date.now().toString(),
      } as any);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Thêm {type === 'parent' ? 'Phụ huynh' : 'Tài xế'}</h2>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Họ tên</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={styles.input}
          />
        </div>

        {type === 'parent' ? (
          <div className={styles.formGroup}>
            <label>Tên học sinh</label>
            <input
              type="text"
              value={(formData as ParentFormData).studentName}
              onChange={(e) =>
                setFormData({ ...formData, studentName: e.target.value } as ParentFormData)
              }
              className={styles.input}
            />
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label>Bằng lái</label>
            <input
              type="text"
              value={(formData as DriverFormData).license}
              onChange={(e) =>
                setFormData({ ...formData, license: e.target.value } as DriverFormData)
              }
              className={styles.input}
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Số điện thoại</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={styles.input}
            placeholder="0901234567"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value } as ParentFormData | DriverFormData)
            }
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Mật khẩu</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Xác nhận mật khẩu</label>
          <input
            type="password"
            value={formData.confirmPassword || ''}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <button onClick={handleSubmit} className={styles.submitButton}>
          Thêm mới
        </button>
        <button onClick={onCancel} className={styles.cancelButton}>
          Hủy
        </button>
      </div>
    </div>
  );
}