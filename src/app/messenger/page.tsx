'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import MessagingForm from '@/components/MessagingForm';
import IncidentTable from '@/components/IncidentTable';
import Notification from '@/components/Notification';
import styles from './page.module.css';
import { Recipient, Incident, mockParents, mockDrivers, mockIncidents } from '@/lib/data_messaging';

export default function MessagingPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([...mockParents, ...mockDrivers]);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Filter recipients based on search term and date
  const filteredRecipients = recipients.filter(
    (recipient) =>
      recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!recipient.availableDates || recipient.availableDates.includes(selectedDate))
  );

  // Simulate receiving new incidents from drivers
  useEffect(() => {
    // Mock API call to fetch new incidents
    const interval = setInterval(() => {
      const newIncident: Incident = {
        id: String(incidents.length + 1),
        driver: mockDrivers[Math.floor(Math.random() * mockDrivers.length)].name,
        bus: `Xe ${Math.floor(Math.random() * 10) + 1}`,
        issue: ['Kẹt xe', 'Hỏng xe', 'Trễ giờ'][Math.floor(Math.random() * 3)],
        timestamp: new Date().toISOString(),
      };
      setIncidents((prev) => [newIncident, ...prev]);
    }, 60000); // Simulate new incident every minute
    return () => clearInterval(interval);
  }, [incidents]);

  // Handle sending message
  const handleSendMessage = (recipientIds: string[], message: string) => {
    if (recipientIds.length === 0 || !message) {
      setNotification({ message: 'Vui lòng chọn ít nhất một người nhận và nhập nội dung tin nhắn.', type: 'error' });
      return;
    }
    // Simulate API call to send message
    console.log('Sending message to:', recipientIds, 'Message:', message);
    setNotification({ message: 'Gửi tin nhắn thành công!', type: 'success' });
  };

  // Handle sending incident notification to parents
  const handleSendIncidentNotification = (incident: Incident) => {
    // Simulate fetching parents linked to the bus
    const parentsForBus = mockParents.filter((parent) => parent.bus === incident.bus);
    if (parentsForBus.length === 0) {
      setNotification({ message: 'Không có phụ huynh nào liên kết với xe này.', type: 'error' });
      console.error('No parents linked to bus:', incident.bus);
      return;
    }
    // Simulate sending push notification
    console.log('Sending push notification to parents:', parentsForBus, 'Incident:', incident);
    setNotification({ message: 'Gửi thông báo sự cố đến phụ huynh thành công!', type: 'success' });
  };

  return (
    <div className={styles.container}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className={styles.headerRow}>
        <h1>Gửi Tin Nhắn</h1>
        <div className={styles.searchWrapper}>
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </div>

      <MessagingForm
        recipients={filteredRecipients}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onSend={handleSendMessage}
      />

      <IncidentTable incidents={incidents} onSendNotification={handleSendIncidentNotification} />
    </div>
  );
}