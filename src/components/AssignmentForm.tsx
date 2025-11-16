'use client';

import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import styles from '@/styles/AssignmentForm.module.css';

// Interface cho danh mục (lấy từ API)
interface Driver { userID: number; name: string; } 
interface Bus { busID: number; licensePlate: string; }
interface Route { routeID: number; routeName: string; }

// Interface cho một mục phân công (dùng cho form)
interface AssignmentItem {
  id?: string;
  driverID: number; 
  driverName: string;
  busID: number;
  busName: string;
  routeID: number;
  routeName: string;
  assignmentDate?: string;
}

interface AssignmentFormProps {
  initialData?: AssignmentItem;
  onSubmit: (data: AssignmentItem) => void;
  onCancel: () => void;
  setNotification: (message: string, type: 'success' | 'error') => void;
}

const PORT_SERVER = 8888;

export default function AssignmentForm({
  initialData,
  onSubmit,
  onCancel,
  setNotification,
}: AssignmentFormProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<AssignmentItem>({
    driverID: 0,
    driverName: '',
    busID: 0,
    busName: '',
    routeID: 0,
    routeName: '',
    assignmentDate: initialData?.assignmentDate || today,
  });
  
  // Xác định chế độ hiện tại (Thêm mới / Chỉnh sửa)
  const isEditing = !!initialData;

  // 1. TẢI DỮ LIỆU DANH MỤC (Tài xế, Xe, Tuyến)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, bRes, rRes] = await Promise.all([
          fetch(`http://localhost:${PORT_SERVER}/api/drivers`),
          fetch(`http://localhost:${PORT_SERVER}/api/buses`),
          fetch(`http://localhost:${PORT_SERVER}/api/routes`),
        ]);

        if (!dRes.ok || !bRes.ok || !rRes.ok) throw new Error();

        setDrivers(await dRes.json());
        setBuses(await bRes.json());
        setRoutes(await rRes.json());
      } catch {
        setNotification('Không tải được danh sách Tài xế, Xe, Tuyến!', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setNotification]);

  // 2. CẬP NHẬT FORM KHI BẤM SỬA (hoặc reset khi Thêm mới)
  // Logic này chạy khi `initialData` thay đổi (bấm Sửa) hoặc khi `loading` (dữ liệu danh mục) hoàn tất
  useEffect(() => {
    // Chờ cho danh mục (drivers, buses, routes) tải xong
    if (loading) return; 
    
    if (initialData) {
      // CHẾ ĐỘ CHỈNH SỬA:
      console.log('🔄 Updating form with initialData:', initialData);
      
      setFormData({
        driverID: initialData.driverID || 0,
        driverName: initialData.driverName || '',
        busID: initialData.busID || 0,
        busName: initialData.busName || '',
        routeID: initialData.routeID || 0,
        routeName: initialData.routeName || '',
        assignmentDate: initialData.assignmentDate || today,
      });
    } else {
      // CHẾ ĐỘ THÊM MỚI: Reset form
      console.log('🆕 Resetting form');
      setFormData({
        driverID: 0,
        driverName: '',
        busID: 0,
        busName: '',
        routeID: 0,
        routeName: '',
        assignmentDate: today,
      });
    }
    // Phụ thuộc vào initialData, loading và độ dài của các mảng danh mục
  }, [initialData, today, loading, drivers.length, buses.length, routes.length]); 

  // 3. CHUYỂN ĐỔI DỮ LIỆU DANH MỤC CHO REACT-SELECT
  const driverOptions = useMemo(() => 
    drivers.map(d => ({ value: d.userID, label: d.name })), 
    [drivers]
  );

  const busOptions = useMemo(() => 
    buses.map(b => ({ value: b.busID, label: b.licensePlate })), 
    [buses]
  );

  const routeOptions = useMemo(() => 
    routes.map(r => ({ value: r.routeID, label: r.routeName })), 
    [routes]
  );

  // 4. TÌM GIÁ TRỊ (OBJECT) ĐANG ĐƯỢC CHỌN CHO REACT-SELECT
  const selectedDriver = useMemo(() => {
    // Tìm trong driverOptions giá trị khớp với formData.driverID
    const found = driverOptions.find(opt => opt.value === formData.driverID);
    console.log('👤 Selected driver:', found, 'from driverID:', formData.driverID); // Debug log
    return found || null;
  }, [driverOptions, formData.driverID]);

  const selectedBus = useMemo(() => {
    const found = busOptions.find(opt => opt.value === formData.busID);
    console.log('🚌 Selected bus:', found, 'from busID:', formData.busID); // Debug log
    return found || null;
  }, [busOptions, formData.busID]);

  const selectedRoute = useMemo(() => {
    const found = routeOptions.find(opt => opt.value === formData.routeID);
    console.log('🛣️ Selected route:', found, 'from routeID:', formData.routeID); // Debug log
    return found || null;
  }, [routeOptions, formData.routeID]);

  // 5. XỬ LÝ KHI SUBMIT FORM
  const handleSubmit = () => {
    if (!formData.driverID || !formData.busID || !formData.routeID) {
      setNotification('Vui lòng chọn đầy đủ thông tin Tài xế, Xe buýt và Tuyến đường!', 'error');
      return;
    }

    // Gửi dữ liệu (đã có ID và Name) lên component Cha (Page.tsx)
    onSubmit({
      id: initialData?.id,
      driverID: formData.driverID,
      driverName: formData.driverName,
      busID: formData.busID,
      busName: formData.busName,
      routeID: formData.routeID,
      routeName: formData.routeName,
      assignmentDate: formData.assignmentDate || today, 
    });
  };

  // Trạng thái chờ tải danh mục
  if (loading || drivers.length === 0 || buses.length === 0 || routes.length === 0) {
    return <div className={styles.loading}>Đang tải danh sách tài xế, xe, tuyến...</div>;
  }

  // Tùy chỉnh style cho React-Select
  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '42px',
      borderColor: '#d1d5db', // Màu xám nhạt
      borderRadius: '0.375rem', // rounded-md
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // shadow-sm
      '&:hover': { borderColor: '#3b82f6' }, // blue-500
    }),
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>
        {isEditing ? 'Chỉnh sửa phân công' : 'Thêm phân công mới'}
      </h2>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Tài xế *</label>
          <Select
            options={driverOptions}
            value={selectedDriver}
            onChange={(opt) => {
              setFormData({ 
                ...formData, 
                driverID: opt?.value || 0, // value là userID
                driverName: opt?.label || '' 
              });
            }}
            placeholder="Tìm kiếm tài xế..."
            isSearchable
            isClearable
            styles={customStyles}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Xe buýt *</label>
          <Select
            options={busOptions}
            value={selectedBus}
            onChange={(opt) => {
              setFormData({ 
                ...formData, 
                busID: opt?.value || 0, 
                busName: opt?.label || '' 
              });
            }}
            placeholder="Tìm kiếm biển số..."
            isSearchable
            isClearable
            styles={customStyles}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Tuyến đường *</label>
          <Select
            options={routeOptions}
            value={selectedRoute}
            onChange={(opt) => {
              setFormData({ 
                ...formData, 
                routeID: opt?.value || 0, 
                routeName: opt?.label || '' 
              });
            }}
            placeholder="Tìm kiếm tuyến đường..."
            isSearchable
            isClearable
            styles={customStyles}
          />
        </div>
        {/* Trường "Ngày phân công" đã được ẩn theo yêu cầu */}
      </div>

      <div className={styles.formActions}>
        <button onClick={handleSubmit} className={styles.submitButton}>
          {isEditing ? 'Cập nhật' : 'Lưu phân công'}
        </button>
        {isEditing && (
          <button onClick={onCancel} className={styles.cancelButton}>Hủy</button>
        )}
      </div>
    </div>
  );
}