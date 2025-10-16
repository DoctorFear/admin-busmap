// app/schedule/page.tsx
'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import ScheduleForm from '@/components/ScheduleForm';
import ScheduleTable from '@/components/ScheduleTable';
import PaginationControl from '@/components/PaginationControl';
import Notification from '@/components/Notification';
import styles from './page.module.css';
import { ScheduleItem, mockSchedules } from '@/lib/data_schedule';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(mockSchedules); // sử dụng dữ liệu mẫu
  const [searchTerm, setSearchTerm] = useState(''); // thêm trạng thái tìm kiếm
  const [currentPage, setCurrentPage] = useState(1); // thêm trạng thái trang hiện tại
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | undefined>(); // thêm trạng thái lịch trình đang chỉnh sửa
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null); // thêm trạng thái thông báo
  const itemsPerPage = 2; // số mục trên mỗi trang

  // Lọc lịch trình dựa trên từ khóa tìm kiếm

  const filteredSchedules = schedules.filter( // lọc lịch trình
    (schedule) =>
      schedule.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.roads.some((road) => road.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

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

      <div className={styles.headerRow}>
        <div className={styles.searchWrapper}>
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </div>

      <ScheduleTable data={paginatedSchedules} onEdit={handleEdit} onDelete={handleDelete} />

      {totalPages > 1 && (
        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className={styles.paginationControls}
        />
      )}
    </div>
  );
}