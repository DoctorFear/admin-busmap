'use client';

import { useState, useEffect } from 'react';
import AssignmentForm from '@/components/AssignmentForm';
import AssignmentTable from '@/components/AssignmentTable';
import SearchBar from '@/components/SearchBar';
import PaginationControlSimple from '@/components/PaginationControlSimple';
import Notification from '@/components/Notification';
import styles from './page.module.css';

interface AssignmentItem {
  id: string;
  driverName: string;
  busName: string;
  routeName: string;
  assignmentDate: string;
  createdAt?: string;
  driverID: number;
  busID: number;
  routeID?: number | null;
}

const PORT_SERVER = 8888;
const itemsPerPage = 5;

const normalizeString = (str?: string): string => {
  if (!str) return '';
  return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentItem | undefined>();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Ngày hiện tại (yyyy-MM-dd)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Ngày mai (dùng để kiểm tra điều kiện sửa/xóa)
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/assignments`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Lỗi tải dữ liệu phân công');
      const data: AssignmentItem[] = await res.json();
      setAssignments(data);
    } catch (err: any) {
      setNotification({ message: err.message || 'Không kết nối được server!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filteredData = assignments.filter(item =>
    normalizeString(item.driverName).includes(normalizeString(searchTerm)) ||
    normalizeString(item.busName).includes(normalizeString(searchTerm)) ||
    normalizeString(item.routeName).includes(normalizeString(searchTerm))
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className={styles.container}>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <AssignmentForm
        initialData={editingAssignment}
        onSubmit={async (data: any) => {
          const isEditing = !!data.id;

          // 1. Thêm mới: Không cho chọn ngày quá khứ
          if (!isEditing && data.assignmentDate < todayStr) {
            setNotification({ message: 'Không thể thêm phân công cho ngày đã qua!', type: 'error' });
            return;
          }

          // 2. Chỉnh sửa: Chỉ cho phép nếu ngày phân công >= ngày mai
          if (isEditing && data.assignmentDate < tomorrowStr) {
            setNotification({ message: 'Không thể chỉnh sửa phân công đã qua hoặc đang diễn ra!', type: 'error' });
            return;
          }

          const endpoint = data.id
            ? `http://localhost:${PORT_SERVER}/api/assignments/${data.id}`
            : `http://localhost:${PORT_SERVER}/api/assignments`;
          const method = data.id ? 'PUT' : 'POST';

          try {
            const res = await fetch(endpoint, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                driverID: data.driverID,
                busID: data.busID,
                routeID: data.routeID || null,
                assignmentDate: data.assignmentDate,
              }),
            });

            if (!res.ok) {
              const errText = await res.text();
              throw new Error(errText || 'Lỗi lưu phân công');
            }

            await fetchAssignments();
            setEditingAssignment(undefined);
            setNotification({
              message: isEditing ? 'Cập nhật phân công thành công!' : 'Thêm phân công thành công!',
              type: 'success',
            });
          } catch (err: any) {
            setNotification({ message: err.message || 'Lưu thất bại!', type: 'error' });
          }
        }}
        onCancel={() => setEditingAssignment(undefined)}
        setNotification={(msg: string, type: 'success' | 'error') => setNotification({ message: msg, type })}
      />

      <div className={styles.headerRow}>
        <div className={styles.searchWrapper}>
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải phân công...</div>
      ) : filteredData.length === 0 ? (
        <p className="text-center text-gray-500 py-16">Chưa có phân công nào</p>
      ) : (
        <>
          <div className={styles.abc}>
            <AssignmentTable
              data={paginatedData}
              onEdit={(assignment) => {
                // CHỈ CHO PHÉP SỬA NẾU NGÀY >= NGÀY MAI
                if (assignment.assignmentDate < tomorrowStr) {
                  setNotification({ message: 'Không thể chỉnh sửa phân công đã qua hoặc đang diễn ra!', type: 'error' });
                  return;
                }
                setEditingAssignment(assignment);
              }}
              onDelete={async (id) => {
                const assignment = assignments.find(a => a.id === id);

                // CHỈ CHO PHÉP XÓA NẾU NGÀY >= NGÀY MAI
                if (!assignment || assignment.assignmentDate < tomorrowStr) {
                  setNotification({ message: 'Không thể xóa phân công đã qua hoặc đang diễn ra!', type: 'error' });
                  return;
                }

                if (!confirm('Xóa phân công này?')) return;

                try {
                  const res = await fetch(`http://localhost:${PORT_SERVER}/api/assignments/${id}`, { method: 'DELETE' });
                  if (!res.ok) throw new Error(await res.text());

                  await fetchAssignments();
                  setNotification({ message: 'Xóa phân công thành công!', type: 'success' });
                } catch (err: any) {
                  setNotification({ message: err.message || 'Xóa thất bại!', type: 'error' });
                }
              }}
            />
          </div>

          {totalPages > 1 && (
            <PaginationControlSimple currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}

          <div className={styles.summary}>
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> • Tổng <strong>{filteredData.length}</strong> phân công
          </div>
        </>
      )}
    </div>
  );
}