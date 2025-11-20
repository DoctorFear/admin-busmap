'use client';

import styles from '@/styles/AssignmentTable.module.css';
import { Edit2, Trash2 } from 'lucide-react';

// Interface AssignmentItem ĐÃ ĐƯỢC SỬA ĐÚNG – DÙNG CHUNG CHO TOÀN BỘ MODULE
interface AssignmentItem {
  id: string;
  driverName: string;
  busName: string;
  routeName: string;
  assignmentDate: string;
  createdAt?: string;
  driverID: number;
  busID: number;
  routeID?: number | null;   // ← Quan trọng: cho phép null & không bắt buộc
}

interface AssignmentTableProps {
  data: AssignmentItem[];
  onEdit: (assignment: AssignmentItem) => void;
  onDelete: (id: string) => void;
}

export default function AssignmentTable({ data, onEdit, onDelete }: AssignmentTableProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Tài xế</th>
            <th className={styles.th}>Biển số xe</th>
            <th className={styles.th}>Tuyến đường</th>
            <th className={styles.th}>Ngày phân công</th>
            <th className={styles.th}>Ngày tạo</th>
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((assignment) => (
              <tr key={assignment.id} className={styles.tr}>
                {/* Tài xế */}
                <td className={styles.td}data-no-translate>
                  <strong>{assignment.driverName}</strong>
                </td>

                {/* Biển số xe */}
                <td className={styles.td}data-no-translate>
                  <span className={styles.busPlate}>{assignment.busName}</span>
                </td>

                {/* Tuyến đường – hiển thị "Chưa gán tuyến" nếu null */}
                <td className={styles.td}data-no-translate>
                  {assignment.routeName && assignment.routeName !== 'Chưa gán tuyến' 
                    ? assignment.routeName 
                    : 'Chưa gán tuyến'}
                </td>

                {/* Ngày phân công */}
                <td className={styles.td}data-no-translate>
                  <span className={styles.dateBadge}>
                    {formatDate(assignment.assignmentDate)}
                  </span>
                </td>

                {/* Ngày tạo */}
                <td className={styles.td}data-no-translate>
                  <span className={styles.dateBadge}>
                    {assignment.createdAt 
                      ? formatDate(assignment.createdAt) 
                      : formatDate(assignment.assignmentDate)}
                  </span>
                </td>

                {/* Nút Sửa / Xóa */}
                <td className={styles.td}data-no-translate>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => onEdit(assignment)}
                      className={styles.editBtn}
                      title="Chỉnh sửa phân công"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(assignment.id)}
                      className={styles.deleteBtn}
                      title="Xóa phân công"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className={styles.noResults}>
                Chưa có phân công nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}