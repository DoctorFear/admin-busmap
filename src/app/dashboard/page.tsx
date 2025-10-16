'use client'; // Cho phép dùng các hook như useState, useEffect, và xử lý tương tác người dùng.

import { useState } from 'react'; // hook useState để quản lý trạng thái nội bộ của component
import { overviewData, OverviewItem } from '@/lib/data_dashbord'; // Giả lập data
import SearchBar from '@/components/SearchBar';
import OverviewTable from '@/components/OverviewTable';
import PaginationControl from '@/components/PaginationControl';
import styles from './page.module.css'; 

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState(''); // Trạng thái từ khóa tìm kiếm
  const [currentPage, setCurrentPage] = useState(1); //  Trang hiện tại
  const itemsPerPage = 8; // Số mục hiển thị trên mỗi trang

  // Lọc dữ liệu dựa trên từ khóa tìm kiếm
  const filteredData = overviewData.filter(item =>
    item.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bus.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage); // Tính tổng số trang
  const startIndex = (currentPage - 1) * itemsPerPage; // vị trí bắt đầu của trang hiện tại
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage); // Lấy dữ liệu cho trang hiện tại

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerRow}>

        <div className={styles.searchWrapper}>
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </div>

      <OverviewTable data={paginatedData} />

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
