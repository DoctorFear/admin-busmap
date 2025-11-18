'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import OverviewTable from '@/components/OverviewTable';
import PaginationControlSimple from '@/components/PaginationControlSimple'; 
import styles from './page.module.css';

const PORT_SERVER = 8888;
const itemsPerPage = 8;

interface OverviewItem {
  id: string;
  student: string;
  driver: string;
  bus: string;
  route: string;
  status: 'Chờ đón' | 'Đang trên xe' | 'Đã trả' | 'Vắng mặt';
}

export default function Dashboard() {
  const [data, setData] = useState<OverviewItem[]>([]);
  const [filteredData, setFilteredData] = useState<OverviewItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // LẤY DỮ LIỆU TỪ BACKEND
  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/overview`, {
        cache: 'no-store',
      });

      if (!res.ok) throw new Error('Không thể tải dữ liệu chuyến đi');

      const rawData = await res.json();

      const mapped: OverviewItem[] = rawData.map((item: any) => ({
        id: item.id || `${Math.random()}`,
        student: item.student || 'Không xác định',
        driver: item.driver || 'Chưa phân công',
        bus: item.bus || 'Chưa phân công',
        route: item.route || 'Chưa có tuyến',
        status: (item.status as OverviewItem['status']) || 'Chờ đón',
      }));

      setData(mapped);
      setFilteredData(mapped);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối server');
      console.error('Fetch overview error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // TÌM KIẾM AN TOÀN (không lỗi null/undefined)
  useEffect(() => {
    if (data.length === 0) {
      setFilteredData([]);
      return;
    }

    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredData(data);
      setCurrentPage(1);
      return;
    }

    const result = data.filter((item) => {
      return (
        (item.student || '').toLowerCase().includes(term) ||
        (item.driver || '').toLowerCase().includes(term) ||
        (item.bus || '').toLowerCase().includes(term) ||
        (item.route || '').toLowerCase().includes(term)
      );
    });

    setFilteredData(result);
    setCurrentPage(1);
  }, [searchTerm, data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.dashboardContainer}>
      {/* Header + Search */}
      <div className={styles.headerRow}>
        <div className={styles.searchWrapper}>
          <SearchBar
            onSearch={setSearchTerm}
          />
        </div>
      </div>

      {/* Lỗi */}
      {error && (
        <div className="text-center py-8 text-red-600 font-medium bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading & Kết quả */}
      {loading ? (
        <div className="text-center py-16 text-gray-600 text-lg">
          Đang tải dữ liệu chuyến đi...
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-16 text-gray-600 text-lg">
          {searchTerm
            ? 'Không tìm thấy học sinh nào phù hợp'
            : 'Chưa có chuyến đi nào hôm nay hoặc chưa có dữ liệu đón/trả học sinh'}
        </div>
      ) : (
        <>
          <div className={styles.abc}>
            <OverviewTable data={paginatedData} />
          </div>

          {/* PHÂN TRANG 3 NÚT – ĐÚNG NHƯ YÊU CẦU */}
          {totalPages > 1 && (
            <PaginationControlSimple
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* Summary */}
          <div className={styles.summary}>
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> • 
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} • {' '}
            Tổng <strong>{filteredData.length}</strong> học sinh
          </div>
        </>
      )}
    </div>
  );
}