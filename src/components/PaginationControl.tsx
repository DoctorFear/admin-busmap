'use client';

import { cn } from '@/lib/utils';
import styles from '../styles/PaginationControl.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlProps) {
  return (
    <div className={cn(styles.pagination, className)}>
      <button
        className={styles.pageButton}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={18} />
      </button>

      <span className={styles.pageInfo}>
        <strong>{currentPage}</strong>
      </span>

      <button
        className={styles.pageButton} // nút chuyển trang
        disabled={currentPage === totalPages} // vô hiệu hóa nút nếu đang ở trang cuối
        onClick={() => onPageChange(currentPage + 1)} // gọi hàm chuyển trang với trang tiếp theo
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
