// components/ParentDriverForm.tsx
'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/ParentDriverForm.module.css';

interface ParentFormData {
  name: string;
  studentName: string;
  address: string;
  phone: string;
  username: string;
  password: string;
}

interface DriverFormData {
  name: string;
  license: string;
  phone: string;
  username: string;
  password: string;
}

interface EditingItem {
  id: number;
  name: string;
  studentName?: string;
  address?: string;
  license?: string;
  phone: string;
  username: string;
  password: string;
}

interface FormProps {
  type: 'parent' | 'driver';
  editingItem: EditingItem | null;
  onSave: (data: ParentFormData | DriverFormData, isEditing: boolean) => void;
  onCancel: () => void;
  setNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function ParentDriverForm({
  type,
  editingItem,
  onSave,
  onCancel,
  setNotification
}: FormProps) {
  const isEditing = !!editingItem;

  const [formData, setFormData] = useState<ParentFormData | DriverFormData>(
    type === 'parent'
      ? { name: '', studentName: '', address: '', phone: '', username: '', password: '' }
      : { name: '', license: '', phone: '', username: '', password: '' }
  );

  // Điền dữ liệu khi bấm Sửa hoặc reset khi thêm mới
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        phone: editingItem.phone || '',
        username: editingItem.username || '',
        password: editingItem.password || '',
        ...(type === 'parent'
          ? {
              studentName: editingItem.studentName || '',
              address: editingItem.address || ''
            }
          : {
              license: editingItem.license || ''
            })
      });
    } else {
      setFormData(
        type === 'parent'
          ? { name: '', studentName: '', address: '', phone: '', username: '', password: '' }
          : { name: '', license: '', phone: '', username: '', password: '' }
      );
    }
  }, [editingItem, type]);

  // Validate form
  const validate = (): boolean => {
    const data = formData as any;

    if (!data.name?.trim()) {
      setNotification('Vui lòng nhập họ tên.', 'error');
      return false;
    }

    if (!data.phone?.match(/^\d{10,11}$/)) {
      setNotification('Số điện thoại phải có 10-11 chữ số.', 'error');
      return false;
    }

    if (!data.username?.trim()) {
      setNotification('Vui lòng nhập username.', 'error');
      return false;
    }

    // Chỉ bắt buộc mật khẩu khi THÊM MỚI
    if (!isEditing && data.password.length < 6) {
      setNotification('Mật khẩu phải có ít nhất 6 ký tự.', 'error');
      return false;
    }

    if (type === 'parent') {
      if (!data.studentName?.trim()) {
        setNotification('Vui lòng nhập tên học sinh.', 'error');
        return false;
      }
      if (!data.address?.trim()) {
        setNotification('Vui lòng nhập địa chỉ.', 'error');
        return false;
      }
    } else {
      if (!data.license?.trim()) {
        setNotification('Vui lòng nhập số bằng lái.', 'error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData, isEditing);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>
        {isEditing
          ? `Chỉnh sửa ${type === 'parent' ? 'Phụ huynh' : 'Tài xế'}`
          : `Thêm mới ${type === 'parent' ? 'Phụ huynh' : 'Tài xế'}`}
      </h2>

      <div className={styles.formGrid}>
        {/* Họ tên */}
        <div className={styles.formGroup}>
          <label>Họ tên <span className={styles.required}>*</span></label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={styles.input}
            placeholder="Nguyễn Văn A"
          />
        </div>

        {/* Tên học sinh hoặc Bằng lái */}
        {type === 'parent' ? (
          <div className={styles.formGroup}>
            <label>Tên học sinh <span className={styles.required}>*</span></label>
            <input
              type="text"
              value={(formData as ParentFormData).studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value } as ParentFormData)}
              className={styles.input}
              placeholder="Nguyễn Văn Bé"
            />
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label>Số bằng lái <span className={styles.required}>*</span></label>
            <input
              type="text"
              value={(formData as DriverFormData).license}
              onChange={(e) => setFormData({ ...formData, license: e.target.value } as DriverFormData)}
              className={styles.input}
              placeholder="B2-123456"
            />
          </div>
        )}

        {/* Địa chỉ (chỉ phụ huynh) */}
        {type === 'parent' && (
          <div className={styles.formGroup}>
            <label>Địa chỉ <span className={styles.required}>*</span></label>
            <input
              type="text"
              value={(formData as ParentFormData).address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value } as ParentFormData)}
              className={styles.input}
              placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
            />
          </div>
        )}

        {/* Số điện thoại */}
        <div className={styles.formGroup}>
          <label>Số điện thoại <span className={styles.required}>*</span></label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            className={styles.input}
            placeholder="0901234567"
            maxLength={11}
          />
        </div>

        {/* Username */}
        <div className={styles.formGroup}>
          <label>Username <span className={styles.required}>*</span></label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
            className={styles.input}
            placeholder="parent001"
            disabled={isEditing} // Không cho sửa username khi chỉnh sửa
            style={isEditing ? { background: '#f3f4f6', cursor: 'not-allowed' } : {}}
          />
        </div>

        {/* Mật khẩu */}
        <div className={styles.formGroup}>
          <label>
            Mật khẩu {isEditing ? '(để trống nếu không đổi)' : <span className={styles.required}>*</span>}
          </label>
          <input

            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={styles.input}
            placeholder={isEditing ? 'Nhập mật khẩu mới nếu muốn đổi' : 'Ít nhất 6 ký tự'}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <button onClick={handleSubmit} className={styles.submitButton}>
          {isEditing ? 'Lưu thay đổi' : 'Thêm mới'}
        </button>
        {isEditing && (
          <button onClick={onCancel} className={styles.cancelButton}>
            Hủy
          </button>
        )}
      </div>
    </div>
  );
}