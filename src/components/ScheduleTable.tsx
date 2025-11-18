
'use client';

import styles from '../styles/ScheduleTable.module.css';
import { Edit2, Trash2 } from 'lucide-react';

interface ScheduleItem {
  tripID: number;
  routeName: string;
  tripDate: string;
  startTime: string;
  endTime: string;
  licensePlate?: string;
  driverName?: string;
  status?: string;
}

interface ScheduleTableProps {
  data: ScheduleItem[];
  onEdit: (schedule: ScheduleItem) => void;
  onDelete: (id: number) => void;
}

export default function ScheduleTable({ data, onEdit, onDelete }: ScheduleTableProps) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Tuyến</th>
          <th className={styles.th}>Ngày chạy</th>
          <th className={styles.th}>Giờ hoạt động</th>
          <th className={styles.th}>Xe buýt</th>
          <th className={styles.th}>Tài xế</th>
          <th className={styles.th}>Trạng thái</th>
          <th className={styles.th}>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((schedule) => (
            <tr key={schedule.tripID} className={styles.tr}>
              <td className={styles.td}>{schedule.routeName}</td>
              <td className={styles.td}>
                {new Date(schedule.tripDate).toLocaleDateString('vi-VN')}
              </td>
              <td className={styles.td}>
                {schedule.startTime} - {schedule.endTime}
              </td>
              <td className={styles.td}>{schedule.licensePlate || '—'}</td>
              <td className={styles.td}>{schedule.driverName || '—'}</td>
              <td className={styles.td}>
                <span
                  className={`${styles.status} ${
                    schedule.status === 'RUNNING'
                      ? styles.running
                      : schedule.status === 'COMPLETED'
                      ? styles.completed
                      : styles.planned
                  }`}
                >
                  {schedule.status}
                </span>
              </td>
              <td className={styles.td}>
                <div className={styles.actionButtons}>
                <button
                  onClick={() => onEdit(schedule)}
                  className={styles.editButton}
                      title="Sửa lịch trình"
                    >
                      <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(schedule.tripID)}
                  className={styles.deleteButton}
                      title="Xóa lịch trình"
                    >
                      <Trash2 size={16} />
                </button>
                </div>

              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={7} className={styles.noResults}>
              Không có lịch trình nào
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}




// ----------------------OLD---------------------\\
// 'use client';

// import styles from '../styles/ScheduleTable.module.css';

// interface ScheduleItem {
//   id: string;
//   routeName: string;
//   roads: string[];
//   startDate: string;
//   endDate: string;
//   startTime: string;
//   endTime: string;
//   days: string[];
// }

// interface ScheduleTableProps {
//   data: ScheduleItem[];
//   onEdit: (schedule: ScheduleItem) => void;
//   onDelete: (id: string) => void;
// }

// export default function ScheduleTable({ data, onEdit, onDelete }: ScheduleTableProps) {
//   return (
//     <table className={styles.table}>
//       <thead>
//         <tr>
//           <th className={styles.th}>Tên tuyến</th>
//           <th className={styles.th}>Đường đi qua</th>
//           <th className={styles.th}>Thời gian áp dụng</th>
//           <th className={styles.th}>Thời gian hoạt động</th>
//           <th className={styles.th}>Ngày hoạt động</th>
//           <th className={styles.th}>Hành động</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.length > 0 ? (
//           data.map((schedule) => (
//             <tr key={schedule.id} className={styles.tr}>
//               <td className={styles.td}>{schedule.routeName}</td>
//               <td className={styles.td}>{schedule.roads.join(', ')}</td>
//               <td className={styles.td}>{`${schedule.startDate} - ${schedule.endDate}`}</td>
//               <td className={styles.td}>{`${schedule.startTime} - ${schedule.endTime}`}</td>
//               <td className={styles.td}>{schedule.days.join(', ')}</td>
//               <td className={styles.td}>
//                 <button
//                   onClick={() => onEdit(schedule)}
//                   className={styles.editButton}
//                 >
//                   Sửa
//                 </button>
//                 <button
//                   onClick={() => onDelete(schedule.id)}
//                   className={styles.deleteButton}
//                 >
//                   Xóa
//                 </button>
//               </td>
//             </tr>
//           ))
//         ) : (
//           <tr>
//             <td colSpan={6} className={styles.noResults}>
//               Không tìm thấy lịch trình
//             </td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   );
// }