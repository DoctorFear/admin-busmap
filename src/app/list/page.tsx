'use client';

import { useState, useEffect } from 'react';
import ParentDriverForm from '@/components/ParentDriverForm';
import ParentDriverTable from '@/components/ParentDriverTable';
import ParentDriverToggle from '@/components/ParentDriverToggle';
import PaginationControlSimple from '@/components/PaginationControlSimple';
import Notification from '@/components/Notification';
import SearchBar from '@/components/SearchBar';
import styles from './page.module.css';

const PORT_SERVER = 8888;

// Interface chung cho form (giữ nguyên như cũ)
interface EditingItem {
  id: number;           // userID (dùng cho cả parent & driver)
  name: string;
  studentName?: string;
  address?: string;
  license?: string;
  phone: string;
  username: string;
  password: string;
}

export default function ListPage() {
  const [type, setType] = useState<'parent' | 'driver'>('parent');
  const [parents, setParents] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);

  const itemsPerPage = 5;

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = type === 'parent'
        ? `http://localhost:${PORT_SERVER}/api/parents`
        : `http://localhost:${PORT_SERVER}/api/drivers`;

      const res = await fetch(endpoint, { cache: 'no-store' });
      if (!res.ok) throw new Error('Lỗi tải dữ liệu');

      const data = await res.json();

      if (type === 'parent') setParents(data);
      else setDrivers(data);
    } catch (err: any) {
      setNotification({ message: err.message || 'Lỗi kết nối server!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  // Reset khi đổi tab
  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
    setEditingItem(null);
  }, [type]);

  const data = type === 'parent' ? parents : drivers;

  const filteredData = data.filter((item: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.studentName?.toLowerCase().includes(searchLower) ||
      item.license?.toLowerCase().includes(searchLower) ||
      item.phone?.includes(searchTerm) ||
      item.username?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const togglePassword = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // QUAN TRỌNG: Dùng đúng ID (userID) cho cả Parent & Driver
  const handleEdit = (item: any) => {
    setEditingItem({
      id: item.userID,        // ← luôn dùng userID để edit/delete (backend dùng userID)
      name: item.name || '',
      studentName: item.studentName,
      address: item.address,
      license: item.license,
      phone: item.phone || '',
      username: item.username || '',
      password: ''            // để trống, chỉ nhập nếu muốn đổi mật khẩu
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (formData: any, isEditing: boolean) => {
    const endpoint = type === 'parent' ? '/api/parents' : '/api/drivers';
    const url = `http://localhost:${PORT_SERVER}${endpoint}${isEditing ? `/${editingItem?.id}` : ''}`;

    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Lỗi server');
      }

      setNotification({
        message: isEditing
          ? `Cập nhật ${type === 'parent' ? 'phụ huynh' : 'tài xế'} thành công!`
          : `Thêm ${type === 'parent' ? 'phụ huynh' : 'tài xế'} thành công!`,
        type: 'success'
      });
      setEditingItem(null);
      fetchData();
    } catch (err: any) {
      setNotification({ message: err.message || 'Lưu thất bại!', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Xóa vĩnh viễn ${type === 'parent' ? 'phụ huynh' : 'tài xế'} này? Không thể khôi phục!`)) return;

    const endpoint = type === 'parent' ? `/api/parents/${id}` : `/api/drivers/${id}`;
    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}${endpoint}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text() || 'Xóa thất bại');

      setNotification({ message: 'Xóa thành công!', type: 'success' });
      fetchData();
    } catch (err: any) {
      setNotification({ message: err.message || 'Xóa thất bại!', type: 'error' });
    }
  };

  const handleCancelEdit = () => setEditingItem(null);

  return (
    <div className={styles.container}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Vẫn giữ toggle để chuyển Parent ↔ Driver */}
      <ParentDriverToggle selected={type} onToggle={setType} />

      {/* Form chung */}
      <ParentDriverForm
        type={type}
        editingItem={editingItem}
        onSave={handleSave}
        onCancel={handleCancelEdit}
        setNotification={(msg, t) => setNotification({ message: msg, type: t })}
      />

      <div className={styles.headerRow}>
        <div className={styles.searchWrapper}>
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải dữ liệu...</div>
      ) : filteredData.length === 0 ? (
        <p className="text-center py-10 text-gray-600">
          {searchTerm
            ? 'Không tìm thấy kết quả nào'
            : `Chưa có ${type === 'parent' ? 'phụ huynh' : 'tài xế'} nào`}
        </p>
      ) : (
        <>
          <div className={styles.abc}>
            <ParentDriverTable
              data={paginatedData}
              type={type}
              showPassword={showPassword}
              onTogglePassword={togglePassword}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> • 
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} • 
            Tổng <strong>{filteredData.length}</strong> {type === 'parent' ? 'phụ huynh' : 'tài xế'}
          </div>
        </>
      )}
    </div>
  );
}