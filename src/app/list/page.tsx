'use client';

import { useState, useEffect } from 'react';
import ParentDriverForm from '@/components/ParentDriverForm';
import ParentDriverTable from '@/components/ParentDriverTable';
import ParentDriverToggle from '@/components/ParentDriverToggle';
import PaginationControlSimple from '@/components/PaginationControlSimple'; // ← Component mới chỉ 3 nút
import Notification from '@/components/Notification';
import SearchBar from '@/components/SearchBar';
import styles from './page.module.css';

const PORT_SERVER = 8888;

interface EditingItem {
  id: number;
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
    } catch (err) {
      setNotification({ message: 'Lỗi kết nối server!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
    setEditingItem(null);
  }, [type]);

  const data = type === 'parent' ? parents : drivers;
  const filteredData = data.filter((item: any) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.license?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone?.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const togglePassword = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (item: any) => {
    setEditingItem({
      id: item.userID,
      name: item.name,
      studentName: item.studentName,
      address: item.address,
      license: item.license,
      phone: item.phone,
      username: item.username,
      password: item.password
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (formData: any, isEditing: boolean) => {
    const endpoint = type === 'parent' ? '/api/parents' : '/api/drivers';
    const method = isEditing ? 'PUT' : 'POST';
    const url = `http://localhost:${PORT_SERVER}${endpoint}${isEditing ? `/${editingItem?.id}` : ''}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Lỗi server');
      }

      setNotification({
        message: isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!',
        type: 'success'
      });
      setEditingItem(null);
      fetchData();
    } catch (err: any) {
      setNotification({ message: err.message || 'Lỗi khi lưu!', type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa vĩnh viễn người này? Không thể khôi phục!')) return;

    const endpoint = type === 'parent' ? `/api/parents/${id}` : `/api/drivers/${id}`;
    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}${endpoint}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');

      setNotification({ message: 'Xóa thành công!', type: 'success' });
      fetchData();
    } catch (err: any) {
      setNotification({ message: 'Lỗi khi xóa!', type: 'error' });
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

      <ParentDriverToggle selected={type} onToggle={setType} />

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
        <div className={styles.loading}>Đang tải...</div>
      ) : filteredData.length === 0 ? (
        <p style={{ textAlign: 'center', margin: '2rem 0', color: '#666' }}>
          {searchTerm ? 'Không tìm thấy kết quả nào' : `Chưa có ${type === 'parent' ? 'phụ huynh' : 'tài xế'} nào`}
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

          {/* CHỈ 3 NÚT - ĐÚNG YÊU CẦU */}
          {totalPages > 1 && (
            <PaginationControlSimple
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Thông tin tổng quát (tùy chọn) */}
          <div className={styles.summary}>
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> • 
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length ) }  • 
            Trong tổng số <strong>{filteredData.length}</strong> dữ liệu.
          </div>
        </>
      )}
    </div>
  );
}