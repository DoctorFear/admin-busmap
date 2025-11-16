// components/PaginationControlSimple.tsx
'use client';

import { cn } from '@/lib/utils';
import styles from '../styles/PaginationControl.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, KeyboardEvent } from 'react';

interface PaginationControlSimpleProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function PaginationControlSimple({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationControlSimpleProps) {
  const [inputValue, setInputValue] = useState<string>('');

  const handleJump = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt(inputValue, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
      setInputValue(''); // xóa ô nhập sau khi nhảy
    }
  };

  return (
    <div className={cn(styles.pagination, className)}>
      {/* Nút lùi */}
      <button
        className={styles.pageButton}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Ô nhập số trang - chỉ hiện số trang hiện tại */}
      <div className={styles.currentPageInputWrapper}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
          onKeyDown={handleJump}
          placeholder={`${currentPage}`}
          className={styles.currentPageInput}
          aria-label="Nhập số trang và nhấn Enter"
        />
        {/* ĐÃ XÓA DÒNG NÀY: <span className={styles.totalPages}> / {totalPages}</span> */}
      </div>

      {/* Nút tiến */}
      <button
        className={styles.pageButton}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight size={20} />
      </button>

      
    </div>
    
  );
}