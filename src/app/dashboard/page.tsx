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

interface NotificationRecord {
  notificationID: number;
  toUserID: number;
  fromUserID: number | null;
  type: string;
  title: string | null;
  content: string;
  sentAt: string;
  readAt: string | null;
}

export default function Dashboard() {
  const [data, setData] = useState<OverviewItem[]>([]);
  const [filteredData, setFilteredData] = useState<OverviewItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const ADMIN_USER_ID = 1; // Sửa lại đúng userID admin thực tế

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

  // --- Notification logic (moved to top) ---
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const res = await fetch(`/api/notifications/${ADMIN_USER_ID}`);
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data || []);
        }
      } catch (err) {
        // handle error
      } finally {
        setLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, []);
  const handleMarkAsRead = async (notificationID: number) => {
    try {
      await fetch(`/api/notifications/${notificationID}/read`, {
        method: 'PUT',
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationID === notificationID
            ? { ...n, readAt: new Date().toISOString() }
            : n
        )
      );
    } catch (err) {
      // handle error
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.dashboardContainer}>
      {/* Notification block at top */}
      <div style={{
        background: '#faf7ff',
        // background: 'rgb(255, 185, 185)',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '24px 18px 12px 18px',
        marginBottom: '24px',
        width: '100%',
        maxWidth: 'unset',
        marginLeft: 0,
        marginRight: 0,
      }}>
        <div style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          color: '#222',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span role="img" aria-label="bell" style={{ fontSize: '1.3em' }}>🔔</span>
          <b>Thông báo cho Admin</b>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.length === 0 ? (
            <div style={{ color: '#aaa', fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>Không có thông báo nào</div>
          ) : (
            notifications.slice(0, 10).map((notif) => (
              <div
                key={notif.notificationID}
                style={{
                  // background: '#eaf3fb',
                  background: 'rgb(255, 185, 185)',
                  borderRadius: '6px',
                  padding: '16px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  borderLeft: '4px solid #4b8be4',
                  marginBottom: '0',
                  width: '100%',
                }}
              >
                <div style={{ fontWeight: 600, color: '#2d3a4a', marginBottom: '2px', fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span role="img" aria-label="alert" style={{ fontSize: '1.1em' }}>📢</span>
                  <span>{notif.title}</span>
                </div>
                <div style={{ color: '#3b4a5a', fontSize: '0.98rem' }}>{notif.content}</div>
                <div style={{ color: '#888', fontSize: '0.95rem', marginTop: '4px' }}>
                  {
                    new Date(notif.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  } {new Date(notif.sentAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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