'use client';

import { useState } from 'react';
import styles from '../styles/MessagingForm.module.css';

interface Recipient {
  id: string;
  name: string;
  type: 'parent' | 'driver';
  bus?: string;
  availableDates?: string[];
}

interface MessagingFormProps {
  recipients: Recipient[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSend: (recipientIds: string[], message: string) => void;
}

export default function MessagingForm({ recipients, selectedDate, onDateChange, onSend }: MessagingFormProps) {
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const handleRecipientToggle = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((recipientId) => recipientId !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    onSend(selectedRecipientIds, message);
    setSelectedRecipientIds([]);
    setMessage('');
  };

  return (
    <div className={styles.formContainer}>
      <h2>Soạn Tin Nhắn</h2>
      <div className={styles.formGroup}>
        <label>Lọc theo ngày</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Người nhận</label>
        <div className={styles.recipientList}>
          {recipients.length > 0 ? (
            recipients.map((recipient) => (
              <label key={recipient.id} className={styles.recipientItem}>
                <input
                  type="checkbox"
                  checked={selectedRecipientIds.includes(recipient.id)}
                  onChange={() => handleRecipientToggle(recipient.id)}
                  className={styles.checkbox}
                />
                {recipient.name} ({recipient.type === 'parent' ? 'Phụ huynh' : 'Tài xế'})
              </label>
            ))
          ) : (
            <p className={styles.noResults}>Không tìm thấy người nhận</p>
          )}
        </div>
      </div>
      <div className={styles.formGroup}>
        <label>Nội dung tin nhắn</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập nội dung tin nhắn..."
          className={styles.textarea}
        />
      </div>
      <div className={styles.formActions}>
        <button onClick={handleSubmit} className={styles.submitButton}>
          Gửi
        </button>
      </div>
    </div>
  );
}