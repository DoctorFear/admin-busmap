'use client';

import styles from '../styles/IncidentTable.module.css';

interface Incident {
  id: string;
  driver: string;
  bus: string;
  issue: string;
  timestamp: string;
  status?: 'pending' | 'sent';
}

interface IncidentTableProps {
  incidents: Incident[];
  onSendNotification: (incident: Incident) => void;
}

export default function IncidentTable({ incidents, onSendNotification }: IncidentTableProps) {
  return (
    <div className={styles.tableContainer}>
      <h2>Cảnh báo sự cố</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Tài xế</th>
            <th className={styles.th}>Xe buýt</th>
            <th className={styles.th}>Sự cố</th>
            <th className={styles.th}>Thời gian</th>
            <th className={styles.th}>Trạng thái</th>
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {incidents.length > 0 ? (
            incidents.map((incident) => (
              <tr key={incident.id} className={styles.tr}>
                <td className={styles.td} data-no-translate>{incident.driver}</td>
                <td className={styles.td} data-no-translate>{incident.bus}</td>
                <td className={styles.td} data-no-translate>{incident.issue}</td>
                <td className={styles.td} data-no-translate>{new Date(incident.timestamp).toLocaleString()}</td>
                <td className={styles.td}>
                  {incident.status === 'sent' ? 'Đã gửi' : 'Chưa gửi'}
                </td>
                <td className={styles.td}>
                  <button
                    onClick={() => onSendNotification(incident)}
                    className={`${styles.notifyButton} ${incident.status === 'sent' ? styles.sentButton : ''}`}
                    disabled={incident.status === 'sent'}
                  >
                    {incident.status === 'sent' ? 'Đã gửi' : 'Gửi thông báo'}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className={styles.noResults}>
                Không có sự cố nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}