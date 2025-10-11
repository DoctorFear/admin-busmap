'use client';

import styles from '../styles/ScheduleTable.module.css';

interface ScheduleItem {
  id: string;
  routeName: string;
  roads: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  days: string[];
}

interface ScheduleTableProps {
  data: ScheduleItem[];
  onEdit: (schedule: ScheduleItem) => void;
  onDelete: (id: string) => void;
}

export default function ScheduleTable({ data, onEdit, onDelete }: ScheduleTableProps) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Tên tuyến</th>
          <th className={styles.th}>Đường đi qua</th>
          <th className={styles.th}>Thời gian áp dụng</th>
          <th className={styles.th}>Thời gian hoạt động</th>
          <th className={styles.th}>Ngày hoạt động</th>
          <th className={styles.th}>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((schedule) => (
            <tr key={schedule.id} className={styles.tr}>
              <td className={styles.td}>{schedule.routeName}</td>
              <td className={styles.td}>{schedule.roads.join(', ')}</td>
              <td className={styles.td}>{`${schedule.startDate} - ${schedule.endDate}`}</td>
              <td className={styles.td}>{`${schedule.startTime} - ${schedule.endTime}`}</td>
              <td className={styles.td}>{schedule.days.join(', ')}</td>
              <td className={styles.td}>
                <button
                  onClick={() => onEdit(schedule)}
                  className={styles.editButton}
                >
                  Sửa
                </button>
                <button
                  onClick={() => onDelete(schedule.id)}
                  className={styles.deleteButton}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className={styles.noResults}>
              Không tìm thấy lịch trình
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}