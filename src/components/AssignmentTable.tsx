'use client';

import styles from '../styles/AssignmentTable.module.css';

interface AssignmentItem {
  id: string;
  driver: string;
  bus: string;
  route: string;
  startTime: string;
}

interface AssignmentTableProps {
  data: AssignmentItem[];
  onEdit: (assignment: AssignmentItem) => void;
  onDelete: (id: string) => void;
}

export default function AssignmentTable({ data, onEdit, onDelete }: AssignmentTableProps) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Tài xế</th>
          <th className={styles.th}>Xe buýt</th>
          <th className={styles.th}>Tuyến đường</th>
          <th className={styles.th}>Thời gian bắt đầu</th>
          <th className={styles.th}>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((assignment) => (
            <tr key={assignment.id} className={styles.tr}>
              <td className={styles.td}>{assignment.driver}</td>
              <td className={styles.td}>{assignment.bus}</td>
              <td className={styles.td}>{assignment.route}</td>
              <td className={styles.td}>{assignment.startTime}</td>
              <td className={styles.td}>
                <button
                  onClick={() => onEdit(assignment)}
                  className={styles.editButton}
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(assignment.id)}
                  className={styles.deleteButton}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className={styles.noResults}>
              Không tìm thấy phân công
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}