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
  driverID: number;
  busID: number;
  routeID: number;
}

const PORT_SERVER = 8888;
const itemsPerPage = 5;

// Chuẩn hóa chuỗi để so sánh không phân biệt dấu, hoa thường
const normalizeString = (str: string | undefined): string => {
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

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const [assignRes, driverRes, busRes, routeRes] = await Promise.all([
        fetch(`http://localhost:${PORT_SERVER}/api/assignments`, { cache: 'no-store' }),
        fetch(`http://localhost:${PORT_SERVER}/api/drivers`, { cache: 'no-store' }),
        fetch(`http://localhost:${PORT_SERVER}/api/buses`, { cache: 'no-store' }),
        fetch(`http://localhost:${PORT_SERVER}/api/routes`, { cache: 'no-store' }),
      ]);

      if (!assignRes.ok) throw new Error('Lỗi tải dữ liệu phân công');

      const assignData = await assignRes.json();
      const drivers = await driverRes.json();   // ← BÂY GIỜ CÓ driverID
      const buses = await busRes.json();
      const routes = await routeRes.json();

      // LÀM GIÀU DỮ LIỆU: thêm driverID, busID, routeID đúng chuẩn vào mỗi assignment
      const enrichedAssignments = assignData.map((item: any) => {
        const normalizedDriverName = normalizeString(item.driverName);
        const normalizedBusName = normalizeString(item.busName);
        const normalizedRouteName = normalizeString(item.routeName);

        const driver = drivers.find((d: any) =>
          normalizeString(d.name) === normalizedDriverName
        );
        const bus = buses.find((b: any) =>
          normalizeString(b.licensePlate) === normalizedBusName
        );
        const route = routes.find((r: any) =>
          normalizeString(r.routeName) === normalizedRouteName
        );

        return {
          ...item,
          driverID: driver ? driver.driverID : 0,   // <<< SỬA CHỖ NÀY: dùng driverID thật
          busID: bus?.busID || 0,
          routeID: route?.routeID || 0,
        } as AssignmentItem;
      });

      setAssignments(enrichedAssignments);
    } catch (err: any) {
      console.error('Lỗi fetchAssignments:', err);
      setNotification({ message: err.message || 'Không kết nối được server!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Lọc + phân trang
  const filteredData = assignments.filter(item =>
    normalizeString(item.driverName).includes(normalizeString(searchTerm)) ||
    normalizeString(item.busName).includes(normalizeString(searchTerm)) ||
    normalizeString(item.routeName).includes(normalizeString(searchTerm))
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

  return (
    <div className={styles.container}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <AssignmentForm
        initialData={editingAssignment}
        onSubmit={async (data) => {
          const endpoint = data.id
            ? `http://localhost:${PORT_SERVER}/api/assignments/${data.id}`
            : `http://localhost:${PORT_SERVER}/api/assignments`;
          const method = data.id ? 'PUT' : 'POST';

          try {
            const res = await fetch(endpoint, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                driverID: data.driverID,     // ← giờ là driverID thật (1,2,3...)
                busID: data.busID,
                routeID: data.routeID,
              }),
            });

            if (!res.ok) {
              const err = await res.text();
              throw new Error(err || 'Lỗi lưu phân công');
            }

            await fetchAssignments();
            setEditingAssignment(undefined);
            setNotification({
              message: data.id ? 'Cập nhật phân công thành công!' : 'Thêm phân công thành công!',
              type: 'success',
            });
          } catch (err: any) {
            setNotification({ message: err.message || 'Lưu thất bại!', type: 'error' });
          }
        }}
        onCancel={() => setEditingAssignment(undefined)}
        setNotification={(msg, type) => setNotification({ message: msg, type })}
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
              onEdit={setEditingAssignment}
              onDelete={async (id) => {
                try {
                  const res = await fetch(`http://localhost:${PORT_SERVER}/api/assignments/${id}`, {
                    method: 'DELETE',
                  });
                  if (!res.ok) throw new Error(await res.text() || 'Lỗi xóa');

                  await fetchAssignments();
                  setNotification({ message: 'Xóa phân công thành công!', type: 'success' });
                } catch (err: any) {
                  setNotification({ message: err.message || 'Xóa thất bại!', type: 'error' });
                }
              }}
            />
          </div>

          {totalPages > 1 && (
            <PaginationControlSimple
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          <div className={styles.summary}>
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> • Hiển thị{' '}
            {startItem}-{endItem} / {filteredData.length}
          </div>
        </>
      )}
    </div>
  );
}