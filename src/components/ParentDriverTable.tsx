// components/ParentDriverTable.tsx
'use client';

import { Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import styles from '@/styles/ParentDriverTable.module.css';

interface TableProps {
  data: any[];
  type: 'parent' | 'driver';
  showPassword: { [key: string]: boolean };
  onTogglePassword: (id: string) => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}

export default function ParentDriverTable({ 
  data, 
  type, 
  showPassword, 
  onTogglePassword,
  onEdit,
  onDelete 
}: TableProps) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Họ tên</th>
            {type === 'parent' ? (
              <>
                <th className={styles.th}>Tên học sinh</th>
                <th className={styles.th}>Địa chỉ</th>
              </>
            ) : (
              <>
                <th className={styles.th}>Bằng lái</th>
                {/* ĐÃ BỎ CỘT TRẠNG THÁI */}
              </>
            )}
            <th className={styles.th}>SĐT</th>
            <th className={styles.th}>Username</th>
            <th className={styles.th}>Mật khẩu</th>
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.userID} className={styles.tr}>
                <td className={styles.td}>
                  <strong>{item.name}</strong><a></a>
                </td>

                {/* Cột phụ thuộc loại */}
                {type === 'parent' ? (
                  <>
                    <td className={styles.td}>{item.studentName || '-'}</td>
                    <td className={styles.td}>
                      {item.address ? (
                        <span title={item.address}>
                          {item.address.length > 50 
                            ? item.address.substring(0, 50) + '...' 
                            : item.address}
                        </span>
                      ) : (
                        <em style={{color: '#999'}}>Chưa cập nhật</em>
                      )}<a></a>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={styles.td}>{item.license || '-'}<a></a></td>
                    {/* BỎ CỘT TRẠNG THÁI → KHÔNG CÓ TD NÀO Ở ĐÂY */}
                  </>
                )}

                <td className={styles.td}>{item.phone}<a></a></td>
                <td className={styles.td}>{item.username || '-'}<a></a></td>

                {/* Mật khẩu */}
                <td className={styles.td}>
                  <div className={styles.passwordCell}>
                    <span>{showPassword[item.userID] ? item.password : '••••••'}</span>
                    <button
                      onClick={() => onTogglePassword(String(item.userID))}
                      className={styles.eyeBtn}
                      title="Hiện/Ẩn mật khẩu"
                    >
                      {showPassword[item.userID] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div><a></a>
                </td>

                {/* Hành động */}
                <td className={styles.td}>
                  <div className={styles.actionButtons}>
                    <button onClick={() => onEdit(item)} className={styles.editBtn} title="Sửa">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(item.userID)} className={styles.deleteBtn} title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div><a></a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={type === 'parent' ? 7 : 6}  // Parent: 7 cột | Driver: 6 cột (không có trạng thái)
                className={styles.noResults}
              >
                Không có dữ liệu
              <a></a></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}