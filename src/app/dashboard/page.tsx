'use client';

import { useState } from 'react';
import { overviewData, OverviewItem } from '@/lib/data';
import SearchBar from '@/components/SearchBar';
import OverviewTable from '@/components/OverviewTable';
import PaginationControl from '@/components/PaginationControl';
import styles from './page.module.css';
import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredData = overviewData.filter(item =>
    item.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bus.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

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
