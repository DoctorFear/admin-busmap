'use client';

import { useState } from 'react';
import AssignmentForm from '@/components/AssignmentForm';
import AssignmentTable from '@/components/AssignmentTable';
import SearchBar from '@/components/SearchBar';
import PaginationControl from '@/components/PaginationControl';
import Notification from '@/components/Notification';
import styles from './page.module.css';
import { AssignmentItem, mockAssignments } from '@/lib/data_assignment';

export default function AssignmentPage() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>(mockAssignments);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentItem | undefined>();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const itemsPerPage = 5;

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.bus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  // Handle form submission
  const handleSubmit = (data: AssignmentItem) => {
    // Check availability
    const isAvailable = !assignments.some(
      (assignment) =>
        assignment.id !== data.id &&
        (assignment.driver === data.driver || assignment.bus === data.bus) &&
        assignment.startTime === data.startTime
    );

    if (!isAvailable) {
      setNotification({ message: 'Tài xế hoặc xe đã được phân công cho tuyến khác tại thời điểm này.', type: 'error' });
      return;
    }

    if (editingAssignment) {
      setAssignments(assignments.map((assignment) => (assignment.id === data.id ? data : assignment)));
      setNotification({ message: 'Cập nhật phân công thành công!', type: 'success' });
    } else {
      setAssignments([...assignments, { ...data, id: String(assignments.length + 1) }]);
      setNotification({ message: 'Thêm phân công thành công!', type: 'success' });
    }
    setEditingAssignment(undefined);
  };

  const handleEdit = (assignment: AssignmentItem) => {
    setEditingAssignment(assignment);
  };

  const handleDelete = (id: string) => {
    setAssignments(assignments.filter((assignment) => assignment.id !== id));
    setNotification({ message: 'Xóa phân công thành công!', type: 'success' });
  };

  const handleCancel = () => {
    setEditingAssignment(undefined);
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

      <AssignmentForm
        initialData={editingAssignment}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        setNotification={setNotification}
      />

      <div className={styles.headerRow}>
        <div className={styles.searchWrapper}>
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </div>

      <AssignmentTable data={paginatedAssignments} onEdit={handleEdit} onDelete={handleDelete} />

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