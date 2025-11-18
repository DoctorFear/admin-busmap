'use client';

import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import styles from '@/styles/AssignmentForm.module.css';

// CẬP NHẬT INTERFACE: Driver giờ phải có driverID (lấy từ backend đã sửa)
interface Driver {
  driverID: number;   // ← QUAN TRỌNG: Đây mới là ID dùng để lưu vào DriverAssignment
  userID: number;
  name: string;
  // Các trường khác nếu cần (license, status,...)
}

interface Bus {
  busID: number;
  licensePlate: string;
}

interface Route {
  routeID: number;
  routeName: string;
}

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
    assignmentDate: today,
  });

  const isEditing = !!initialData;

  // 1. TẢI DANH MỤC
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, bRes, rRes] = await Promise.all([
          fetch(`http://localhost:${PORT_SERVER}/api/drivers`),
          fetch(`http://localhost:${PORT_SERVER}/api/buses`),
          fetch(`http://localhost:${PORT_SERVER}/api/routes`),
        ]);

        if (!dRes.ok || !bRes.ok || !rRes.ok) throw new Error('Lỗi tải danh mục');

        const driverData = await dRes.json();
        setDrivers(driverData);
        setBuses(await bRes.json());
        setRoutes(await rRes.json());
      } catch (err) {
        setNotification('Không tải được danh sách Tài xế/Xe/Tuyến!', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setNotification]);

  // 2. CẬP NHẬT FORM KHI CHỈNH SỬA HOẶC THÊM MỚI
  useEffect(() => {
    if (loading) return;

    if (initialData) {
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
  }, [initialData, loading, today]);

  // 3. OPTIONS CHO REACT-SELECT (DÙNG driverID THẬT)
  const driverOptions = useMemo(
    () => drivers.map(d => ({ value: d.driverID, label: d.name })),
    [drivers]
  );

  const busOptions = useMemo(
    () => buses.map(b => ({ value: b.busID, label: b.licensePlate })),
    [buses]
  );

  const routeOptions = useMemo(
    () => routes.map(r => ({ value: r.routeID, label: r.routeName })),
    [routes]
  );

  // 4. SELECTED VALUES
  const selectedDriver = driverOptions.find(o => o.value === formData.driverID) || null;
  const selectedBus = busOptions.find(o => o.value === formData.busID) || null;
  const selectedRoute = routeOptions.find(o => o.value === formData.routeID) || null;

  // 5. SUBMIT
  const handleSubmit = () => {
    if (!formData.driverID || !formData.busID || !formData.routeID) {
      setNotification('Vui lòng chọn đầy đủ Tài xế, Xe buýt và Tuyến đường!', 'error');
      return;
    }

    onSubmit({
      id: initialData?.id,
      driverID: formData.driverID,     // ← ĐÚNG: driverID thật (1,2,3...)
      driverName: formData.driverName,
      busID: formData.busID,
      busName: formData.busName,
      routeID: formData.routeID,
      routeName: formData.routeName,
      assignmentDate: today,
    });
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải danh sách...</div>;
  }

  const customStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: '42px',
      borderColor: '#d1d5db',
      borderRadius: '0.375rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      '&:hover': { borderColor: '#3b82f6' },
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
                driverID: opt?.value || 0,      // ← driverID thật
                driverName: opt?.label || '',
              });
            }}
            placeholder="Chọn tài xế..."
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
                busName: opt?.label || '',
              });
            }}
            placeholder="Chọn xe buýt..."
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
                routeName: opt?.label || '',
              });
            }}
            placeholder="Chọn tuyến đường..."
            isSearchable
            isClearable
            styles={customStyles}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <button onClick={handleSubmit} className={styles.submitButton}>
          {isEditing ? 'Cập nhật' : 'Lưu phân công'}
        </button>
        {isEditing && (
          <button onClick={onCancel} className={styles.cancelButton}>
            Hủy
          </button>
        )}
      </div>
    </div>
  );
}