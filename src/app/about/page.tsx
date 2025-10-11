'use client';

import { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ScheduleForm from '@/components/ScheduleForm';
import ScheduleTable from '@/components/ScheduleTable';
import PaginationControl from '@/components/PaginationControl';
import Notification from '@/components/Notification';
import styles from './page.module.css';

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

const mockSchedules: ScheduleItem[] = [
  {
    id: '1',
    routeName: 'Tuyến 1',
    roads: ['Đường Lê Lợi', 'Đường Nguyễn Huệ'],
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    startTime: '06:00',
    endTime: '18:00',
    days: ['Thứ 2', 'Thứ 3', 'Thứ 4'],
  },
  {
    id: '2',
    routeName: 'Tuyến 2',
    roads: ['Đường Hai Bà Trưng', 'Đường Đồng Khởi'],
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    startTime: '07:00',
    endTime: '17:00',
    days: ['Thứ 5', 'Thứ 6'],
  },
  {
    id: '3',
    routeName: 'Tuyến 2',
    roads: ['Đường Hai Bà Trưng', 'Đường Đồng Khởi'],
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    startTime: '07:00',
    endTime: '17:00',
    days: ['Thứ 5', 'Thứ 6'],
  },
  
];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(mockSchedules);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | undefined>();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const itemsPerPage = 2;

  const filteredSchedules = schedules.filter(
    (schedule) =>
      schedule.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.roads.some((road) => road.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

  const handleSubmit = (data: ScheduleItem) => {
    if (editingSchedule) {
      setSchedules(schedules.map((schedule) => (schedule.id === data.id ? data : schedule)));
    } else {
      setSchedules([...schedules, { ...data, id: String(schedules.length + 1) }]);
    }
    setEditingSchedule(undefined);
  };

  const handleEdit = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
  };

  const handleDelete = (id: string) => {
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


      <ScheduleForm
        initialData={editingSchedule}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        setNotification={(message, type) => setNotification({ message, type })}
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