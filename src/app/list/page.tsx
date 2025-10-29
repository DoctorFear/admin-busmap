// app/list/page.tsx
'use client';

import { useState } from 'react';
import ParentDriverForm from '@/components/ParentDriverForm';
import ParentDriverTable from '@/components/ParentDriverTable';
import ParentDriverToggle from '@/components/ParentDriverToggle';
import PaginationControl from '@/components/PaginationControl';
import Notification from '@/components/Notification';
import SearchBar from '@/components/SearchBar';
import { mockParents, mockDrivers, Parent, Driver } from '@/lib/data_parents_drivers';
import styles from './page.module.css';

export default function ListPage() {
  const [type, setType] = useState<'parent' | 'driver'>('parent');
  const [parents, setParents] = useState<Parent[]>(mockParents);
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const itemsPerPage = 5;

  const data = type === 'parent' ? parents : drivers;

  const filteredData = data.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.studentName && item.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.license && item.license.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = (newItem: any) => {
    const { confirmPassword, ...item } = newItem;
    if (type === 'parent') {
      setParents([...parents, item]);
    } else {
      setDrivers([...drivers, item]);
    }
    setNotification({ message: 'Thêm thành công!', type: 'success' });
  };

  const togglePassword = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={styles.container}>
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <ParentDriverToggle selected={type} onToggle={setType} />

      <ParentDriverForm
        type={type}
        onSubmit={handleAdd}
        onCancel={() => {}}
        setNotification={(msg, t) => setNotification({ message: msg, type: t })}
      />

      <div className={styles.headerRow}>
        <div className={styles.searchWrapper}>
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </div>

      <ParentDriverTable
        data={paginatedData}
        type={type}
        showPassword={showPassword}
        onTogglePassword={togglePassword}
      />

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