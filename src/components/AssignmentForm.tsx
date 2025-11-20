'use client';

import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import styles from '@/styles/AssignmentForm.module.css';

interface AssignmentItem {
  id?: string;
  driverID: number;
  driverName: string;
  busID: number;
  busName: string;
  routeID?: number | null;
  routeName: string;
  assignmentDate: string;
}

interface AssignmentFormProps {
  initialData?: AssignmentItem;
  onSubmit: (data: AssignmentItem & { id?: string }) => void;
  onCancel: () => void;
  setNotification: (message: string, type: 'success' | 'error') => void;
}

const PORT_SERVER = 8888;

// FIX TIMEZONE HOÀN HẢO
const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export default function AssignmentForm({
  initialData,
  onSubmit,
  onCancel,
  setNotification,
}: AssignmentFormProps) {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [formData, setFormData] = useState<AssignmentItem>({
    driverID: 0,
    driverName: '',
    busID: 0,
    busName: '',
    routeID: null,
    routeName: '',
    assignmentDate: today,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dRes, bRes, rRes] = await Promise.all([
          fetch(`http://localhost:${PORT_SERVER}/api/drivers`),
          fetch(`http://localhost:${PORT_SERVER}/api/buses`),
          fetch(`http://localhost:${PORT_SERVER}/api/routes`),
        ]);

        if (!dRes.ok || !bRes.ok || !rRes.ok) throw new Error('Lỗi tải danh mục');

        setDrivers(await dRes.json());
        setBuses(await bRes.json());
        setRoutes(await rRes.json());
      } catch {
        setNotification('Không tải được danh sách!', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setNotification]);

  // FIX CHÍNH: Reset form đúng cách, không bị ghi đè
  useEffect(() => {
    if (initialData) {
      const formattedDate = formatDateForInput(initialData.assignmentDate);
      
      setFormData({
        driverID: initialData.driverID || 0,
        driverName: initialData.driverName || '',
        busID: initialData.busID || 0,
        busName: initialData.busName || '',
        routeID: initialData.routeID ?? null,
        routeName: initialData.routeName || '',
        assignmentDate: formattedDate || today,
      });
    } else {

      setFormData({
        driverID: 0,
        driverName: '',
        busID: 0,
        busName: '',
        routeID: null,
        routeName: '',
        assignmentDate: today,
      });
    }
  }, [initialData, today]);

  const driverOptions = drivers.map(d => ({ value: d.driverID, label: d.name || d.fullName }));
  const busOptions = buses.map(b => ({ value: b.busID, label: b.licensePlate }));
  const routeOptions = routes.map(r => ({ value: r.routeID, label: r.routeName }));

  const selectedDriver = driverOptions.find(o => o.value === formData.driverID) || null;
  const selectedBus = busOptions.find(o => o.value === formData.busID) || null;
  const selectedRoute = formData.routeID ? routeOptions.find(o => o.value === formData.routeID) || null : null;

  const handleSubmit = () => {

    if (!formData.driverID || !formData.busID) {
      setNotification('Vui lòng chọn tài xế và xe!', 'error');
      return;
    }
    if (!formData.assignmentDate) {
      setNotification('Vui lòng chọn ngày!', 'error');
      return;
    }

    onSubmit({
      id: initialData?.id,
      ...formData,
    });
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>
        {initialData?.id ? 'Chỉnh sửa phân công' : 'Thêm phân công mới'}
      </h2>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tài xế *</label>
          <Select options={driverOptions} value={selectedDriver} onChange={(opt) => setFormData({ ...formData, driverID: opt?.value || 0, driverName: opt?.label || '' })} placeholder="Chọn tài xế..." data-no-translate isSearchable />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Xe buýt *</label>
          <Select options={busOptions} value={selectedBus} onChange={(opt) => setFormData({ ...formData, busID: opt?.value || 0, busName: opt?.label || '' })} placeholder="Chọn xe..." data-no-translate isSearchable />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tuyến đường *</label>
          <Select options={routeOptions} value={selectedRoute} onChange={(opt) => setFormData({ ...formData, routeID: opt?.value ?? null, routeName: opt?.label || '' })} placeholder="Chọn tuyến..." data-no-translate isSearchable isClearable />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Ngày phân công *</label>
          <input
            type="date"
            value={formData.assignmentDate}
            min={today}
            onChange={(e) => {

              setFormData({ ...formData, assignmentDate: e.target.value });
            }}
            className={styles.input}
            required
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <button onClick={handleSubmit} className={styles.submitButton}>
          {initialData?.id ? 'Cập nhật' : 'Lưu'}
        </button>
        {initialData?.id && <button onClick={onCancel} className={styles.cancelButton}>Hủy</button>}
      </div>
    </div>
  );
}