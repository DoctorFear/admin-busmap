'use client';

import { useState, useEffect } from 'react';
import styles from '../styles/MessagingForm.module.css';

interface User {
  userID: number;
  fullName: string;
  email?: string;
  phone?: string;
  role: 'parent' | 'driver' | 'admin';
}

interface MessagingFormProps {
  recipients?: User[];
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  onSend: (recipientIds: string[], message: string) => void;
}

export default function MessagingForm({ recipients = [], selectedDate = '', onDateChange, onSend }: MessagingFormProps) {
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'parent' | 'driver'>('parent');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationType, setNotificationType] = useState('SYSTEM');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users từ API khi component mount hoặc recipientType thay đổi
  useEffect(() => {
    fetchUsers(recipientType);
  }, [recipientType]);

  const fetchUsers = async (role: 'parent' | 'driver') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications/users/${role}`);
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientToggle = (userID: number) => {
    const idStr = String(userID);
    setSelectedRecipientIds((prev) =>
      prev.includes(idStr) ? prev.filter((id) => id !== idStr) : [...prev, idStr]
    );
  };

  const handleSelectAll = (checked: boolean, list: User[]) => {
    if (checked) {
      setSelectedRecipientIds(list.map(u => String(u.userID)));
    } else {
      setSelectedRecipientIds([]);
    }
  };

  const handleSendMessage = async () => {
    if (selectedRecipientIds.length === 0 || !message.trim()) {
      alert('Vui lòng chọn ít nhất một người nhận và nhập nội dung tin nhắn');
      return;
    }

    try {
      setLoading(true);
      for (const userID of selectedRecipientIds) {
        await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toUserID: parseInt(userID),
            type: notificationType,
            title: notificationTitle || `Tin nhắn từ quản lý`,
            content: message,
          }),
        });
      }
      
      onSend(selectedRecipientIds, message);
      setSelectedRecipientIds([]);
      setMessage('');
      setNotificationTitle('');
      alert(`Gửi thành công tới ${selectedRecipientIds.length} người`);
    } catch (err) {
      console.error('Error sending notifications:', err);
      alert('Lỗi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  // Lọc users theo search term
  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.formContainer}>
      <h2>Soạn Tin Nhắn</h2>

      {/* Loại người nhận */}
      <div className={styles.formGroup}>
        <label>Loại người nhận</label>
        <select
          value={recipientType}
          onChange={(e) => setRecipientType(e.target.value as 'parent' | 'driver')}
          className={styles.input}
        >
          <option value="parent">Phụ huynh</option>
          <option value="driver">Tài xế</option>
        </select>
      </div>

      {/* Loại thông báo */}
      <div className={styles.formGroup}>
        <label>Loại thông báo</label>
        <select
          value={notificationType}
          onChange={(e) => setNotificationType(e.target.value)}
          className={styles.input}
        >
          <option value="SYSTEM">Hệ thống</option>
          <option value="ARRIVAL">Đến nơi</option>
          <option value="PICKUP">Đón học sinh</option>
          <option value="INCIDENT">Sự cố</option>
          <option value="REMINDER">Nhắc nhở</option>
        </select>
      </div>

      {/* Tiêu đề */}
      <div className={styles.formGroup}>
        <label>Tiêu đề (tùy chọn)</label>
        <input
          type="text"
          value={notificationTitle}
          onChange={(e) => setNotificationTitle(e.target.value)}
          placeholder="Tiêu đề thông báo..."
          className={styles.input}
          style={{
            borderColor: '#edbe80'
          }}
        />
      </div>

      {/* Ô tìm kiếm */}
      <div className={styles.formGroup}>
        <label>Tìm kiếm</label>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
          style={{
            borderColor: '#edbe80'
          }}
        />
      </div>

      {/* Người nhận */}
      <div className={styles.formGroup}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>Người nhận ({selectedRecipientIds.length} được chọn)</label>
          <label style={{ fontSize: '0.9em', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filteredUsers.length > 0 && selectedRecipientIds.length === filteredUsers.length}
              onChange={(e) => handleSelectAll(e.target.checked, filteredUsers)}
              style={{ marginRight: '0.3rem' }}
            />
            Chọn tất cả
          </label>
        </div>

        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem' }}>
          {loading ? (
            <p style={{ color: '#999' }}>Đang tải...</p>
          ) : filteredUsers.length === 0 ? (
            <p style={{ color: '#999' }}>Không có {recipientType === 'parent' ? 'phụ huynh' : 'tài xế'} phù hợp</p>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.userID} style={{ padding: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedRecipientIds.includes(String(user.userID))}
                    onChange={() => handleRecipientToggle(user.userID)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ flex: 1 }}>
                    <strong>{user.fullName}</strong>
                    <br />
                    <span style={{ fontSize: '0.85em', color: '#666' }}>
                      {user.email || ''} {user.phone ? `| ${user.phone}` : ''}
                    </span>
                  </span>
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Nội dung tin nhắn */}
      <div className={styles.formGroup}>
        <label>Nội dung tin nhắn</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập nội dung tin nhắn..."
          className={styles.textarea}
          style={{ minHeight: '100px', width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      {/* Nút gửi */}
      <div className={styles.formActions} style={{ marginTop: '1rem' }}>
        <button
          onClick={handleSendMessage}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: loading ? '#ccc' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1em',
            fontWeight: 'bold',
          }}
        >
          {loading ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
        </button>
      </div>
    </div>
  );
}
