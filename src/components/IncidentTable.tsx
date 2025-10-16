'use client';

import styles from '../styles/IncidentTable.module.css';

interface Incident {
  id: string;
  driver: string;
  bus: string;
  issue: string;
  timestamp: string;
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
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {incidents.length > 0 ? (
            incidents.map((incident) => (
              <tr key={incident.id} className={styles.tr}>
                <td className={styles.td}>{incident.driver}</td>
                <td className={styles.td}>{incident.bus}</td>
                <td className={styles.td}>{incident.issue}</td>
                <td className={styles.td}>{new Date(incident.timestamp).toLocaleString()}</td>
                <td className={styles.td}>
                  <button
                    onClick={() => onSendNotification(incident)}
                    className={styles.notifyButton}
                  >
                    Gửi thông báo
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className={styles.noResults}>
                Không có sự cố nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}