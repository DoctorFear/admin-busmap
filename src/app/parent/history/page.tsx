'use client';

import React, { JSX } from 'react';
import { Plus } from 'lucide-react';
import styles from './page.module.css';
import { historyData, HistoryItem } from '@/lib/history';

export default function HistoryPage(): JSX.Element {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const dateVal = (form.querySelector<HTMLInputElement>('#history-date'))?.value ?? '';
    console.log('Tải dữ liệu ngày:', dateVal);
  };

  const History: HistoryItem[] = historyData;

  return (
    <div className={styles.container}>
      <div className={styles.historyCard}>
        <h3 className={styles.title}>Lịch sử hành trình</h3>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="history-date">Ngày/Tháng/Năm</label>
          <div className={styles.formRow}>
            <input type="date" id="history-date" name="history-date" required />
            <button type="submit" className={styles.submitBtn}>
              <Plus size={18} />
              <span>Tải về PDF</span>
            </button>
          </div>
        </form>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Tuyến đường</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {History.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.date)}</td>
                <td>{item.route}</td>
                <td>{item.time}</td>
                <td>{item.activity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <button>Trước</button>
          <button>1</button>
          <button>Sau</button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
}
