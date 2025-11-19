'use client';

import styles from '@/styles/AssignmentTable.module.css';
import { Edit2, Trash2 } from 'lucide-react';

interface AssignmentItem {
  id: string;
  driverName: string;
  busName: string;
  routeName: string;
  assignmentDate: string;
  driverID: number;
  busID: number;
  routeID: number;
}

interface AssignmentTableProps {
  data: AssignmentItem[];
  onEdit: (assignment: AssignmentItem) => void;
  onDelete: (id: string) => void;
}

export default function AssignmentTable({ data, onEdit, onDelete }: AssignmentTableProps) {
  // Format ngày đẹp: 05/04/2025
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
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
            <th className={styles.th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((assignment) => (
              <tr key={assignment.id} className={styles.tr}>
                <td className={styles.td}>
                  <strong>{assignment.driverName}</strong><a></a>
                </td>
                <td className={styles.td}>
                  <span className={styles.busPlate}>{assignment.busName}</span><a></a>
                </td>
                <td className={styles.td}>{assignment.routeName}<a></a></td>
                <td className={styles.td}>
                  <span className={styles.dateBadge}>
                    {formatDate(assignment.assignmentDate)}
                  </span><a></a>
                </td>
                <td className={styles.td}>
                  <div className={styles.actionButtons}>
                    <button
                      onClick={() => {
                        onEdit(assignment);
                      }}
                      className={styles.editBtn}
                      title="Sửa phân công"
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
                  </div><a></a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className={styles.noResults}>
                Chưa có phân công nào
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}