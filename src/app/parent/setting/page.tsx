'use client';

import React, { JSX, FormEvent, useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import styles from './page.module.css';
import { useRouter } from "next/navigation";

interface ParentProfile {
  userID: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  address: string;
  workInfo: string;
}

export default function Setting(): JSX.Element {
  const router = useRouter();
  // Lấy parentID từ localStorage
  const [parentID, setParentID] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    notificationDistance: 500
  });

  const PORT_SERVER = 8888;

  // Kiểm tra authentication và lấy parentID
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const storedParentID = localStorage.getItem('userID');
      
    if (role !== 'parent' || !storedParentID) {
      alert('Vui lòng đăng nhập với tài khoản phụ huynh!');
      router.push('/login');
      return;
    }
      
    setParentID(parseInt(storedParentID));
    setIsAuthLoading(false);
  }, [router]);

  useEffect(() => {
    if (!parentID) return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:${PORT_SERVER}/api/parents/profile/${parentID}`);
        
        if (!res.ok) {
          throw new Error('Không thể tải thông tin profile');
        }
        
        const data: ParentProfile = await res.json();
        setProfile(data);
        
        setFormData({
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          notificationDistance: 500
        });
        
        setError(null);
      } catch (err: any) {
        console.error('Lỗi fetch profile:', err);
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [parentID]);

  //const viewBusDetails = (busId: string) => {
    //console.log(`Viewing details for bus: ${busId}`);
    // TODO: Thêm logic hiển thị chi tiết xe tại đây (modal, API,...)
  //};

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  // Handle submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!parentID) {
      alert('Không tìm thấy thông tin parent!');
      return;
    }
    
    try {
      setSaving(true);
      
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/parents/profile/${parentID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        })
      });
      
      if (!res.ok) {
        throw new Error('Không thể cập nhật thông tin');
      }
      
      const result = await res.json();
      alert(result.message || 'Cập nhật thành công!');
      
    } catch (err: any) {
      console.error('Lỗi cập nhật:', err);
      alert(err.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className={styles.mainContent}>
        <p>Đang tải thông tin phụ huynh...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.mainContent}>
        <p>Đang tải thông tin cài đặt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mainContent}>
        <p style={{ color: 'red' }}>Lỗi: {error}</p>
      </div>
    );
  }
  return (
    <div className={styles.mainContent}>
      <div className={styles.settingsCard}>
        <h3 className={styles.title}>Cài đặt</h3>

        <form onSubmit={handleSubmit} className={styles.form}>


          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input} data-no-translate
          />

          <label htmlFor="phone">Số điện thoại:</label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className={styles.input} data-no-translate
          />

          <label htmlFor="notification-distance">Khoảng cách thông báo:</label>
          <div className={styles.inlineInput}>
            <input
              type="number"
              id="notification-distance"
              value={formData.notificationDistance}
              onChange={handleChange}
              className={styles.inputSmall} data-no-translate
            />
            <span>mét</span>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={saving}>
            <Save size={18} />
            <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
