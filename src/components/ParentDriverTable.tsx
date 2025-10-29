// components/ParentDriverTable.tsx
'use client';

import { Eye, EyeOff } from 'lucide-react';
import styles from '@/styles/ParentDriverTable.module.css';

interface TableProps {
  data: any[];
  type: 'parent' | 'driver';
  showPassword: { [key: string]: boolean };
  onTogglePassword: (id: string) => void;
}

export default function ParentDriverTable({ data, type, showPassword, onTogglePassword }: TableProps) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>ID</th>
          <th className={styles.th}>Họ tên</th>
          {type === 'parent' ? (
            <>
              <th className={styles.th}>Tên học sinh</th>
              <th className={styles.th}>SĐT</th>
            </>
          ) : (
            <>
              <th className={styles.th}>Bằng lái</th>
              <th className={styles.th}>SĐT</th>
            </>
          )}
          <th className={styles.th}>Username</th>
          <th className={styles.th}>Mật khẩu</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((item) => (
            <tr key={item.id} className={styles.tr}>
              <td className={styles.td}>{item.id}</td>
              <td className={styles.td}>{item.name}</td>

              {/* Cột phụ thuộc vào loại */}
              {type === 'parent' ? (
                <>
                  <td className={styles.td}>{item.studentName}</td>
                  <td className={styles.td}>{item.phone}</td>
                </>
              ) : (
                <>
                  <td className={styles.td}>{item.license}</td>
                  <td className={styles.td}>{item.phone}</td>
                </>
              )}

              {/* Cột Username - luôn hiển thị */}
              <td className={styles.td}>{item.username || '-'}</td>

              {/* Cột Mật khẩu */}
              <td className={styles.td}>
                <div className={styles.passwordCell}>
                  <span>{showPassword[item.id] ? item.password : '••••••'}</span>
                  <button
                    onClick={() => onTogglePassword(item.id)}
                    className={styles.eyeBtn}
                  >
                    {showPassword[item.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={type === 'parent' ? 6 : 6} // Cả 2 loại đều có 6 cột
              className={styles.noResults}
            >
              Không có dữ liệu
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}