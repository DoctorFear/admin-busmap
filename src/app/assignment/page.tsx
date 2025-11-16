'use client';

import { useState, useEffect } from 'react';
import AssignmentForm from '@/components/AssignmentForm';
import AssignmentTable from '@/components/AssignmentTable';
import SearchBar from '@/components/SearchBar';
import PaginationControlSimple from '@/components/PaginationControlSimple';
import Notification from '@/components/Notification';
import styles from './page.module.css';

// Định nghĩa giao diện AssignmentItem, bao gồm cả các ID cần thiết cho Form chỉnh sửa
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

// HÀM CHUẨN HÓA CHUỖI ĐỂ SO SÁNH (Case-Insensitive & Diacritic-Insensitive)
// Sử dụng hàm này để đối chiếu tên/biển số từ dữ liệu Phân công với danh mục (Drivers, Buses, Routes)
const normalizeString = (str: string | undefined): string => {
  if (!str) return '';
  // Chuyển về chữ thường, loại bỏ khoảng trắng và chuẩn hóa (loại bỏ dấu)
  return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
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
      // 1. Fetch tất cả dữ liệu cần thiết
      const [assignRes, driverRes, busRes, routeRes] = await Promise.all([
        fetch(`http://localhost:${PORT_SERVER}/api/assignments`, { cache: 'no-store' }),
        fetch(`http://localhost:${PORT_SERVER}/api/drivers`, { cache: 'no-store' }),
        fetch(`http://localhost:${PORT_SERVER}/api/buses`, { cache: 'no-store' }),
        fetch(`http://localhost:${PORT_SERVER}/api/routes`, { cache: 'no-store' }),
      ]);

      if (!assignRes.ok) throw new Error('Lỗi tải dữ liệu phân công');

      const assignData = await assignRes.json();
      const drivers = await driverRes.json();
      const buses = await busRes.json();
      const routes = await routeRes.json();
      
      // 2. LOGIC LÀM GIÀU DỮ LIỆU (Enrichment):
      // Ghép nối (join) để thêm các trường ID (driverID, busID, routeID) vào mỗi mục phân công.
      const enrichedAssignments = assignData.map((item: any) => {
        
        const normalizedDriverName = normalizeString(item.driverName);
        const normalizedBusName = normalizeString(item.busName);
        const normalizedRouteName = normalizeString(item.routeName);

        // Tìm đối tượng khớp trong danh mục dựa trên tên/biển số
        const driver = drivers.find((d: any) => 
          normalizeString(d.name) === normalizedDriverName
        );
        const bus = buses.find((b: any) => 
          normalizeString(b.licensePlate) === normalizedBusName
        );
        const route = routes.find((r: any) => 
          normalizeString(r.routeName) === normalizedRouteName
        );
        
        // Lấy userID/ID tương ứng từ đối tượng tìm được. userID của tài xế được dùng làm driverID
        const actualDriverID = driver ? (driver as any).userID || 0 : 0; 

        return {
          ...item,
          driverID: actualDriverID,
          busID: bus?.busID || 0,
          routeID: route?.routeID || 0,
        } as AssignmentItem; 
      });

      setAssignments(enrichedAssignments);
    } catch (err: any) {
      console.error('Lỗi fetchAssignments:', err);
      // Hiển thị thông báo lỗi chi tiết
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
    item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.routeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

  return (
    <div className={styles.container}>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <AssignmentForm
        // Truyền dữ liệu đã được làm giàu (có đủ ID) vào form chỉnh sửa
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
              // Gửi các ID cần thiết + assignmentDate (ngày hiện tại)
              body: JSON.stringify({
                driverID: data.driverID,
                busID: data.busID,
                routeID: data.routeID,
                assignmentDate: new Date().toISOString().split('T')[0], // Luôn gửi ngày hiện tại
              }),
            });

            if (!res.ok) {
              const err = await res.text();
              throw new Error(err || 'Lỗi lưu');
            }

            // Tải lại dữ liệu (bao gồm cả làm giàu ID)
            await fetchAssignments(); 
            setEditingAssignment(undefined);
            setNotification({ message: data.id ? 'Cập nhật thành công!' : 'Thêm thành công!', type: 'success' });
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
                  const res = await fetch(`http://localhost:${PORT_SERVER}/api/assignments/${id}`, { method: 'DELETE' });
                  if (!res.ok) {
                    const err = await res.text();
                    throw new Error(err || 'Lỗi xóa');
                  }
                  await fetchAssignments();
                  setNotification({ message: 'Xóa thành công!', type: 'success' });
                } catch (err: any) {
                  console.error('Lỗi xóa:', err);
                  setNotification({ message: 'Xóa thất bại!', type: 'error' });
                }
              }}
            />
          </div>

          {totalPages > 1 && (
            <PaginationControlSimple currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}

          <div className={styles.summary}>
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> • Hiển thị {startItem}-{endItem} / {filteredData.length}
          </div>
        </>
      )}
    </div>
  );
}