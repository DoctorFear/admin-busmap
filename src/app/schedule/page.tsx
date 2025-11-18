// app/schedule/page.tsx
'use client';

const PORT_SERVER = 8888;

import { useEffect, useState } from 'react';
import { ScheduleItem} from '@/lib/data_schedule';
// Components
import SearchBar from '@/components/SearchBar';
import ScheduleForm from '@/components/ScheduleForm';
import ScheduleTable from '@/components/ScheduleTable';
import PaginationControlSimple from '@/components/PaginationControlSimple'; 

import Notification from '@/components/Notification';
// Style
import styles from './page.module.css';
// GG Map
// import BusMap_GG from '@/components/BusMap_GG';

export default function SchedulePage() {
  // const [schedules, setSchedules] = useState<ScheduleItem[]>(mockSchedules); // sử dụng dữ liệu mẫu
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  useEffect(() => {
    // fetch(`http://localhost:8888/api/schedules`)
    fetch(`http://localhost:${PORT_SERVER}/api/schedules`)
      .then((res) => res.json())
      .then((data) => {
        console.log("[Schedule] - All route:\n", data);
        const normalized = data.map((item: any) => ({
          tripID: item.tripID,
          routeName: item.routeName,
          tripDate: item.tripDate,
          startTime: item.startTime?.slice(0, 5),
          endTime: item.endTime?.slice(0, 5),
          licensePlate: item.licensePlate,
          driverName: item.driverName,
          status: item.status,
        }));
        setSchedules(normalized);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  
  const [searchTerm, setSearchTerm] = useState(''); // thêm trạng thái tìm kiếm
  const [currentPage, setCurrentPage] = useState(1); // thêm trạng thái trang hiện tại
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | undefined>(); // thêm trạng thái lịch trình đang chỉnh sửa
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null); // thêm trạng thái thông báo
  
  // Phân trang 
  const itemsPerPage = 5; // số mục trên mỗi trang

  // Lọc lịch trình dựa trên từ khóa tìm kiếm

  const filteredSchedules = schedules.filter((schedule) =>
    schedule.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.roads.some((road) => road.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

  // TÍNH TOÁN ĐỂ HIỂN THỊ SUMMARY ĐẸP
  const startItem = filteredSchedules.length > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(startIndex + itemsPerPage, filteredSchedules.length);

  // Xử lý thêm, sửa, xóa lịch trình
  const handleSubmit = (data: ScheduleItem) => { //   xử lý khi người dùng submit form
    if (editingSchedule) {
      setSchedules(schedules.map((schedule) => (schedule.id === data.id ? data : schedule)));
      setNotification({ message: 'Cập nhật lịch trình thành công!', type: 'success' });
    } else {
      setSchedules([...schedules, { ...data, id: String(schedules.length + 1) }]);
      setNotification({ message: 'Thêm lịch trình thành công!', type: 'success' });
    }
    setEditingSchedule(undefined);
  };

  const handleEdit = (schedule: ScheduleItem) => { // xử lý khi người dùng nhấn nút sửa
    setEditingSchedule(schedule);
  };

  const handleDelete = (id: string) => { // xử lý khi người dùng nhấn nút xóa
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
    setNotification({ message: 'Xóa lịch trình thành công!', type: 'success' });
  };

  const handleCancel = () => {
    setEditingSchedule(undefined);
  };

  return (
    <div className={styles.container}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <ScheduleForm // form thêm/sửa lịch trình
        initialData={editingSchedule} // dữ liệu ban đầu (nếu có)
        onSubmit={handleSubmit} // hàm xử lý khi submit
        onCancel={handleCancel} // hàm xử lý khi hủy
        setNotification={(message, type) => setNotification({ message, type })} // hàm hiển thị thông báo
      />

      {/* Google Maps */}
      <div className={styles.mapArea}>
        {/* <BusMap_GG buses={[]} />  */}
        {/* truyền danh sách tuyến / bus */}
      </div>

      <div className={styles.headerRow}>
        <div className={styles.searchWrapper}>
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </div>

      <ScheduleTable data={paginatedSchedules} onEdit={handleEdit} onDelete={handleDelete} />

      {totalPages > 1 && (
        <PaginationControlSimple
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* DÒNG SUMMARY ĐẸP – ĐÃ ĐƯỢC THÊM NHƯ YÊU CẦU */}
      <div className={styles.summary}>
        Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> • Hiển thị{' '}
        <strong>{startItem}</strong> - <strong>{endItem}</strong> • Tổng{' '}
        <strong>{filteredSchedules.length}</strong> lịch trình
      </div>
    </div>
  );
}