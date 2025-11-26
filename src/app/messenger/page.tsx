'use client';

import { useState, useEffect } from 'react';
import MessagingForm from '@/components/MessagingForm';
// import IncidentTable from '@/components/IncidentTable';
import Notification from '@/components/Notification';
import styles from './page.module.css';

import {
  Recipient,
  Incident,
  mockParents,
  mockDrivers,
  mockIncidents,
} from '@/lib/data_messaging';

interface NotificationRecord {
  notificationID: number;
  toUserID: number;
  fromUserID: number | null;
  type: 'ARRIVAL' | 'PICKUP' | 'INCIDENT' | 'SYSTEM' | 'REMINDER';
  title: string | null;
  content: string;
  sentAt: string;
  readAt: string | null;
}

export default function MessagingPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([
    ...mockParents,
    ...mockDrivers,
  ]);

  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [userID, setUserID] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Load userID từ localStorage
  useEffect(() => {
    const storedUserID = localStorage.getItem('userID');
    if (storedUserID) {
      setUserID(parseInt(storedUserID));
    }
  }, []);

  // Fetch danh sách thông báo
  useEffect(() => {
    if (userID) fetchNotifications();
  }, [userID]);

  const fetchNotifications = async () => {
    if (!userID) return;

    try {
      setLoadingNotifications(true);
      const res = await fetch(`/api/notifications/${userID}`);
      const data = await res.json();

      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Đánh dấu đã đọc
  const handleMarkAsRead = async (notificationID: number) => {
    try {
      await fetch(`/api/notifications/${notificationID}/read`, {
        method: 'PUT',
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationID === notificationID
            ? { ...n, readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Filter người nhận
  const filteredRecipients = recipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!recipient.availableDates ||
        recipient.availableDates.includes(selectedDate))
  );

  // Fake nhận incident mỗi 60s
  useEffect(() => {
    const interval = setInterval(() => {
      const newIncident: Incident = {
        id: String(incidents.length + 1),
        driver: mockDrivers[Math.floor(Math.random() * mockDrivers.length)].name,
        bus: `Xe ${Math.floor(Math.random() * 10) + 1}`,
        issue: ['Kẹt xe', 'Hỏng xe', 'Trễ giờ'][Math.floor(Math.random() * 3)],
        timestamp: new Date().toISOString(),
        status: 'pending',
      };

      setIncidents((prev) => [newIncident, ...prev]);
    }, 60000);

    return () => clearInterval(interval);
  }, [incidents]);

  const handleSendMessage = (recipientIds: string[], message: string) => {
    if (recipientIds.length === 0 || !message) {
      setNotification({
        message: 'Vui lòng chọn ít nhất một người nhận và nhập nội dung tin nhắn.',
        type: 'error',
      });
      return;
    }

    console.log('Sending message to:', recipientIds, 'Message:', message);
    setNotification({ message: 'Gửi tin nhắn thành công!', type: 'success' });
  };

  const handleSendIncidentNotification = (incident: Incident) => {
    const parentsForBus = mockParents.filter(
      (parent) => parent.bus === incident.bus
    );

    if (parentsForBus.length === 0) {
      setNotification({
        message: 'Không có phụ huynh nào liên kết với xe này.',
        type: 'error',
      });
      return;
    }

    console.log('Sending notification:', parentsForBus, incident);

    setNotification({
      message: 'Gửi thông báo sự cố đến phụ huynh thành công!',
      type: 'success',
    });

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incident.id ? { ...inc, status: 'sent' } : inc
      )
    );
  };

  return (
    <div className={styles.container}>
      {/* Alert nhỏ hiện ra khi gửi tin */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* GỬI TIN NHẮN */}
      <MessagingForm
        recipients={filteredRecipients}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSend={handleSendMessage}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      {/* BẢNG SỰ CỐ */}
      {/* <IncidentTable
        incidents={incidents}
        onSendNotification={handleSendIncidentNotification}
      /> */}

      {/* THÔNG BÁO NHẬN ĐƯỢC */}
      {/* <div style={{ marginTop: '2rem', padding: '1rem' }}>
        <h3>
          Thông báo nhận được (
          {notifications.filter((n) => !n.readAt).length} chưa đọc)
        </h3>

        {loadingNotifications ? (
          <p>Đang tải...</p>
        ) : notifications.length === 0 ? (
          <p style={{ color: '#999' }}>Không có thông báo nào</p>
        ) : (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {notifications.slice(0, 10).map((notif) => (
              <div
                key={notif.notificationID}
                style={{
                  padding: '0.75rem',
                  backgroundColor: notif.readAt ? '#f5f5f5' : '#fffbf0',
                  borderLeft:
                    '4px solid ' +
                    (notif.type === 'INCIDENT' ? '#FF5722' : '#2196F3'),
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong>{notif.title || notif.type}</strong>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9em' }}>
                    {notif.content}
                  </p>
                  <span style={{ fontSize: '0.8em', color: '#999' }}>
                    {new Date(notif.sentAt).toLocaleString('vi-VN')}
                  </span>
                </div>

                {!notif.readAt && (
                  <button
                    onClick={() => handleMarkAsRead(notif.notificationID)}
                    style={{
                      padding: '0.5rem 1rem',
                      marginLeft: '1rem',
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div> */}
    </div>
  );
}
