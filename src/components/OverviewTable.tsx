'use client';

import styles from '@/styles/OverviewTable.module.css';

interface OverviewItem {
  id: string;
  student: string;
  driver: string;
  bus: string;
  route: string;
  status: 'Chờ đón' | 'Đang trên xe' | 'Đã trả' | 'Vắng mặt';
}

interface OverviewTableProps {
  data: OverviewItem[];
}

export default function OverviewTable({ data }: OverviewTableProps) {
  const getStatusClass = (status: OverviewItem['status']) => {
    switch (status) {
      case 'Chờ đón':
        return styles.statusChoDon;
      case 'Đang trên xe':
        return styles.statusDangTrenXe;
      case 'Đã trả':
        return styles.statusDaTra;
      case 'Vắng mặt':
        return styles.statusVangMat;
      default:
        return styles.statusChoDon;
    }
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>HỌC SINH</th>
            <th className={styles.th}>TÀI XẾ</th>
            <th className={styles.th}>XE BUÝT</th>
            <th className={styles.th}>TUYẾN ĐƯỜNG</th>
            <th className={styles.th}>TRẠNG THÁI</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id} className={styles.tr}>
                <td className={styles.td}>{item.student}</td>
                <td className={styles.td}>{item.driver}</td>
                <td className={styles.td}>{item.bus}</td>
                <td className={styles.td}>{item.route}</td>
                <td className={styles.td}>
                  <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className={styles.noResults}>
                Không có dữ liệu chuyến đi hôm nay
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}