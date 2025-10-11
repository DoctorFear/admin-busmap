'use client';

import styles from '../styles/OverviewTable.module.css';

interface OverviewItem {
  id: string;
  student: string;
  driver: string;
  bus: string;
  route: string;
  status: 'Chờ đón' | 'Đang trên xe' | 'Đã trả' | 'Vắng mặt' | 'Sự cố';
}

interface OverviewTableProps {
  data: OverviewItem[];
}

export default function OverviewTable({ data }: OverviewTableProps) {
  return (
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
                {item.status === 'Chờ đón' && (
                  <button className={styles.statusChoDon}>Chờ đón</button>
                )}
                {item.status === 'Đang trên xe' && (
                  <button className={styles.statusDangTrenXe}>Đang trên xe</button>
                )}
                {item.status === 'Đã trả' && (
                  <button className={styles.statusDaTra}>Đã trả</button>
                )}
                {item.status === 'Vắng mặt' && (
                  <button className={styles.statusVangMat}>Vắng mặt</button>
                )}
                {item.status === 'Sự cố' && (
                  <button className={styles.statusSuCo}>Sự cố</button>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className={styles.noResults}>
              Không tìm thấy kết quả
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}