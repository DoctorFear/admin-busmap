'use client';

import { useState, useEffect, useCallback } from 'react';
import RoadInput from './RoadInput';
import MapForm from './MapForm';
import styles from '../styles/ScheduleForm.module.css';

interface ScheduleItem {
  id: string;
  routeName: string;
  roads: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  days: string[];
  waypoints?: WaypointData[];  // Thêm waypoints data để lưu vào DB
}

// Interface cho dữ liệu waypoint sẽ lưu vào database
interface WaypointData {
  parentID: number | null;
  address: string;
  lat: number;
  lng: number;
  sequence: number;
}

interface ScheduleFormProps {
  initialData?: ScheduleItem;
  onSubmit: (data: ScheduleItem) => void;
  onCancel: () => void;
  setNotification: (message: string, type: 'success' | 'error') => void;
}


const API_BASE = "http://localhost:8888";


export default function ScheduleForm({ initialData, onSubmit, onCancel, setNotification }: ScheduleFormProps) {
  // ----------------------------------------- Form state & handlers --------------------------------- \\
  interface Parent {
    userID: number;
    name: string;
    username: string;
    password: string;
    phone: string;
    studentName: string;
    address: string;
  }

  // Interface cho existing route từ BusStop
  interface ExistingRouteStop {
    routeID: number;
    parentID: number;
  }
  
  const [existingRoutes, setExistingRoutes] = useState<ExistingRouteStop[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);

  // ----------------------------------------- Fetch Parent data --------------------------------- \\
  // Get all Parent: parentID and addresses from DB to select
  useEffect(() => {
    console.log("[1] Fetch parents data...");

    fetch(`${API_BASE}/api/parents`)
      .then((res) => res.json())
      .then((data) => {
        console.log("[Parent] Fetch --> Number of parents:\n", data.length);
        setParents(data);
      })
      .catch((err) => console.error("Fetch parents error:", err));
  }, []); // Only for initial load

  // ----------------------------------------- Fetch Routes data --------------------------------- \\

  // Get all existing routes from BusStop to check duplication
  useEffect(() => {
    console.log("[2] Fetch existing routes data...");

    fetch(`${API_BASE}/api/routes/bus-stops`)
      .then((res) => res.json())
      .then((data) => {
        console.log("[Route] Fetch --> Existing routes in BusStop:\n", data.length);
        setExistingRoutes(data);
      })
      .catch((err) => console.error("Fetch existing routes error:", err));
  }, []); // Only for initial load


  const [formData, setFormData] = useState<ScheduleItem>(
    initialData || {
      id: '',
      routeName: '',
      roads: [],
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      days: [],
      waypoints: [],
    }
  );
  const [roadError, setRoadError] = useState('');

  const validateForm = (): boolean => {
    if (!formData.routeName) {
      setNotification('Tên tuyến không được để trống.', 'error');
      return false;
    }
    if (formData.roads.length === 0) {
      setNotification('Phải có ít nhất một đường đi qua.', 'error');
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      setNotification('Ngày bắt đầu và kết thúc không được để trống.', 'error');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setNotification('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.', 'error');
      return false;
    }
    if (!formData.startTime || !formData.endTime) {
      setNotification('Thời gian bắt đầu và kết thúc không được để trống.', 'error');
      return false;
    }
    if (formData.startTime >= formData.endTime) {
      setNotification('Thời gian bắt đầu phải trước thời gian kết thúc.', 'error');
      return false;
    }
    if (formData.days.length === 0) {
      setNotification('Phải chọn ít nhất một ngày hoạt động.', 'error');
      return false;
    }
    if (formData.roads.some((road, index) => formData.roads.indexOf(road) !== index)) {
      setNotification('Danh sách đường không được trùng lặp.', 'error');
      return false;
    }
    return true;
  };

  /**
   * Kiểm tra xem route mới có trùng với route đã tồn tại không
   * @returns { isDuplicate: boolean, matchedRouteID: number | null }
   */
  const checkDuplicateRoute = (): { isDuplicate: boolean; matchedRouteID: number | null } => {
    // Không kiểm tra nếu chưa có waypoints
    if (!formData.waypoints || formData.waypoints.length === 0) {
      console.log("[Check Duplicate] Chưa có waypoints để kiểm tra");
      return { isDuplicate: false, matchedRouteID: null };
    }

    // Lấy danh sách parentID từ waypoints mới (chỉ lấy những waypoint có parentID)
    const newParentIDs = formData.waypoints
      .filter(wp => wp.parentID !== null)
      .map(wp => wp.parentID)
      .sort((a, b) => a! - b!); // Sort để so sánh dễ dàng

    console.log("[Check Duplicate] ===== BẮT ĐẦU KIỂM TRA TRÙNG LẶP =====");
    console.log("[Check Duplicate] Route mới có:", newParentIDs.length, "waypoints với parentID");
    console.log("[Check Duplicate] ParentIDs mới (đã sort):", newParentIDs);

    // Nếu không có parentID nào → không thể trùng (vì route mới toàn địa chỉ tự do)
    if (newParentIDs.length === 0) {
      console.log("[Check Duplicate] ❌ Route mới không có parentID nào → Không trùng");
      return { isDuplicate: false, matchedRouteID: null };
    }

    // Group existing routes theo routeID
    const routeGroups: Record<number, number[]> = {};
    existingRoutes.forEach(stop => {
      if (!routeGroups[stop.routeID]) {
        routeGroups[stop.routeID] = [];
      }
      routeGroups[stop.routeID].push(stop.parentID);
    });

    console.log("[Check Duplicate] Số lượng routes hiện có:", Object.keys(routeGroups).length);

    // Kiểm tra từng route hiện có
    for (const [routeID, parentIDs] of Object.entries(routeGroups)) {
      const sortedExistingParentIDs = parentIDs.sort((a, b) => a - b);
      
      console.log(`[Check Duplicate] --- Kiểm tra với Route ${routeID} ---`);
      console.log(`[Check Duplicate]   Route ${routeID} có:`, sortedExistingParentIDs.length, "stops");
      console.log(`[Check Duplicate]   ParentIDs (đã sort):`, sortedExistingParentIDs);

      // Điều kiện trùng:
      // 1. Số lượng waypoints bằng nhau
      // 2. Tất cả parentID giống nhau (đã sort)
      if (sortedExistingParentIDs.length === newParentIDs.length) {
        console.log(`[Check Duplicate]   ✓ Số lượng bằng nhau (${sortedExistingParentIDs.length})`);
        
        const isIdentical = sortedExistingParentIDs.every((id, index) => id === newParentIDs[index]);
        
        if (isIdentical) {
          console.log(`[Check Duplicate]   ✓ Tất cả parentID giống nhau`);
          console.log(`[Check Duplicate] ⚠️  TRÙNG LẶP VỚI ROUTE ${routeID}!`);
          console.log("[Check Duplicate] ===== KẾT THÚC KIỂM TRA =====");
          return { isDuplicate: true, matchedRouteID: parseInt(routeID) };
        } else {
          console.log(`[Check Duplicate]   ✗ ParentIDs khác nhau`);
        }
      } else {
        console.log(`[Check Duplicate]   ✗ Số lượng khác nhau (${sortedExistingParentIDs.length} vs ${newParentIDs.length})`);
      }
    }

    console.log("[Check Duplicate] ✓ Không trùng với route nào");
    console.log("[Check Duplicate] ===== KẾT THÚC KIỂM TRA =====");
    return { isDuplicate: false, matchedRouteID: null };
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    // ====================================================================
    // KIỂM TRA TRÙNG LẶP ROUTE
    // ====================================================================
    const duplicateCheck = checkDuplicateRoute();
    
    if (duplicateCheck.isDuplicate) {
      console.log("=".repeat(60));
      console.log("❌ CẢNH BÁO: ROUTE TRÙNG LẶP!");
      console.log("=".repeat(60));
      console.log("Route mới TRÙNG với Route ID:", duplicateCheck.matchedRouteID);
      console.log("Thông tin route mới:");
      console.log("  - Tên tuyến:", formData.routeName);
      console.log("  - Số waypoints:", formData.waypoints?.length || 0);
      console.log("  - ParentIDs:", formData.waypoints?.filter(wp => wp.parentID !== null).map(wp => wp.parentID).sort());
      console.log("=".repeat(60));
      
      setNotification(
        `Tuyến đường này đã tồn tại (trùng với Route ID: ${duplicateCheck.matchedRouteID}). Vui lòng kiểm tra lại!`,
        'error'
      );
      return;
    }
    
    // ====================================================================
    // ROUTE HỢP LỆ - TIẾP TỤC LƯU
    // ====================================================================
    console.log("=".repeat(60));
    console.log("✓ ROUTE HỢP LỆ - KHÔNG TRÙNG LẶP");
    console.log("=".repeat(60));
    console.log("[ScheduleForm] Submit data:", {
      routeName: formData.routeName,
      waypointsCount: formData.waypoints?.length || 0,
      waypoints: formData.waypoints,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      days: formData.days
    });
    console.log("=".repeat(60));
    
    onSubmit(formData);
    setNotification(initialData ? 'Cập nhật lịch trình thành công!' : 'Tạo lịch trình thành công!', 'success');
  };

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      days: formData.days.includes(day)
        ? formData.days.filter((d) => d !== day)
        : [...formData.days, day],
    });
  };

  // FIXED: useCallback để tránh tạo function mới mỗi lần render
  const handleWaypointsChange = useCallback((waypoints: WaypointData[]) => {
    console.log("[ScheduleForm] Nhận waypoints từ MapForm:", waypoints);
    setFormData(prev => ({ ...prev, waypoints }));
  }, []);

  return (
    <div className={styles.formWrapper}>
      {/*LEFT:  From tạo/chỉnh sửa lịch trình */}
      <div className={styles.formContainer}>
        <h2 className={styles.h2css}>{initialData ? 'Chỉnh sửa lịch trình' : 'Tạo lịch trình mới'}</h2>
        <div className={styles.formGroup}>
          <label>Tên tuyến</label>
          <input
            type="text"
            value={formData.routeName}
            onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
            placeholder="Nhập tên tuyến"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Các điểm đến</label>
          <RoadInput
            roads={formData.roads}
            onAddRoad={(road) => setFormData({ ...formData, roads: [...formData.roads, road] })}
            onRemoveRoad={(road) => setFormData({ ...formData, roads: formData.roads.filter((r) => r !== road) })}
            onReorderRoad={(fromIndex, toIndex) => {
              const newRoads = [...formData.roads];
              const [removed] = newRoads.splice(fromIndex, 1);
              newRoads.splice(toIndex, 0, removed);
              setFormData({ ...formData, roads: newRoads });
            }}
            error={roadError}
            setError={setRoadError}
            parents={parents}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Khoảng thời gian áp dụng</label>
          <div className={styles.dateRange}>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={styles.input}
            />
            <span>đến</span>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Thời gian hoạt động</label>
          <div className={styles.timeRange}>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={styles.input}
            />
            <span>đến</span>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Ngày hoạt động</label>
          <div className={styles.days}>
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day) => (
              <label key={day} className={styles.dayLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={formData.days.includes(day)}
                  onChange={() => handleDayToggle(day)}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
        <div className={styles.formActions}>
          <button onClick={handleSubmit} className={styles.submitButton}>
            {initialData ? 'Cập nhật' : 'Lưu'}
          </button>
          <button onClick={onCancel} className={styles.cancelButton}>
            Hủy
          </button>
        </div>
      </div>

      {/*RIGHT: GG Map */}
      <MapForm 
        roads={formData.roads} 
        parents={parents}
        onWaypointsChange={handleWaypointsChange}
      />

    </div>
  );
}