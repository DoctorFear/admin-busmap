/**
 * ================================================================================
 * ROUTE DATABASE TYPES - CẤU TRÚC DỮ LIỆU LƯU VÀO DATABASE
 * ================================================================================
 * 
 * File này định nghĩa cấu trúc dữ liệu để lưu route và waypoints vào database
 */

/**
 * Interface cho một waypoint (điểm dừng) trong route
 * Đây là dữ liệu sẽ được lưu vào bảng BusStop hoặc RouteDetails
 */
export interface WaypointData {
  /** 
   * ID của parent nếu địa chỉ này thuộc về một parent
   * null nếu là địa chỉ tự do (không có trong danh sách parent)
   */
  parentID: number | null;
  
  /** 
   * Địa chỉ đầy đủ (text)
   * VD: "763 Hùng Vương, Phường 5, Quận 5, Thành phố Hồ Chí Minh, Việt Nam"
   */
  address: string;
  
  /** 
   * Tọa độ latitude
   * - Nếu có parentID → lấy từ parent data (đã có sẵn)
   * - Nếu không có parentID → lấy từ Google Geocoding API
   */
  lat: number;
  
  /** 
   * Tọa độ longitude
   * - Nếu có parentID → lấy từ parent data (đã có sẵn)
   * - Nếu không có parentID → lấy từ Google Geocoding API
   */
  lng: number;
  
  /** 
   * Thứ tự waypoint trong route (1, 2, 3, ...)
   * - Không bao gồm điểm SGU đầu và cuối
   * - Sequence được tính sau khi Google Directions API optimize (nếu có)
   * - VD: Nếu có 3 waypoints và optimize = true, Google có thể sắp xếp lại:
   *   Original: [A(seq=1), B(seq=2), C(seq=3)]
   *   Optimized: [C(seq=1), A(seq=2), B(seq=3)]
   */
  sequence: number;
}

/**
 * Interface cho Route data hoàn chỉnh (để POST vào API)
 */
export interface RouteDataForDB {
  /** Tên route/tuyến (do người dùng nhập) */
  routeName: string;
  
  /** Danh sách waypoints đã được xử lý */
  waypoints: WaypointData[];
  
  /** Ngày bắt đầu áp dụng route */
  startDate: string;
  
  /** Ngày kết thúc áp dụng route */
  endDate: string;
  
  /** Thời gian bắt đầu hoạt động (HH:mm) */
  startTime: string;
  
  /** Thời gian kết thúc hoạt động (HH:mm) */
  endTime: string;
  
  /** Các ngày trong tuần hoạt động */
  days: string[];
}

/**
 * ================================================================================
 * EXAMPLE - VÍ DỤ DỮ LIỆU THỰC TẾ
 * ================================================================================
 */

export const EXAMPLE_ROUTE_DATA: RouteDataForDB = {
  routeName: "Tuyến A - Quận 5",
  startDate: "2025-01-01",
  endDate: "2025-06-30",
  startTime: "07:00",
  endTime: "18:00",
  days: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"],
  waypoints: [
    {
      // Waypoint 1: Địa chỉ của parent (có parentID)
      parentID: 72,
      address: "763 Hùng Vương, Phường 5, Quận 5, Thành phố Hồ Chí Minh, Việt Nam",
      lat: 10.7320661,
      lng: 106.6095676,
      sequence: 1
    },
    {
      // Waypoint 2: Địa chỉ tự do (không có trong danh sách parent)
      parentID: null,
      address: "123 Đường ABC, Quận 1, Thành phố Hồ Chí Minh, Việt Nam",
      lat: 10.7756,
      lng: 106.7019,
      sequence: 2
    },
    {
      // Waypoint 3: Địa chỉ của parent khác
      parentID: 166,
      address: "460 Phạm Ngũ Lão, Phường 9, Quận 1, Thành phố Hồ Chí Minh, Việt Nam",
      lat: 10.7689,
      lng: 106.6919,
      sequence: 3
    }
  ]
};

/**
 * ================================================================================
 * LƯU Ý KHI LƯU VÀO DATABASE
 * ================================================================================
 * 
 * 1. KHÔNG LƯU ĐIỂM SGU:
 *    - Origin: SGU_ADDRESS (điểm đầu) → KHÔNG lưu vào DB
 *    - Destination: SGU_ADDRESS (điểm cuối) → KHÔNG lưu vào DB
 *    - Chỉ lưu các waypoints giữa đường
 * 
 * 2. SEQUENCE SAU OPTIMIZE:
 *    - Nếu user bật "Tối ưu" → Google Directions API sẽ sắp xếp lại waypoints
 *    - Sequence được cập nhật theo thứ tự tối ưu từ Google
 *    - waypoint_order từ Google: [2, 0, 1] nghĩa là waypoint thứ 2 đi đầu tiên
 * 
 * 3. LAT/LNG:
 *    - Nếu địa chỉ có parentID → dùng lat/lng từ parent data (đã có sẵn)
 *    - Nếu địa chỉ không có parentID → gọi Google Geocoding API để lấy lat/lng
 * 
 * 4. PARENT DATA SOURCE:
 *    - API: http://localhost:8888/api/parents/
 *    - Response format: { userID, name, username, address, lat, lng, ... }
 * 
 * ================================================================================
 * API ENDPOINT ĐỂ LƯU ROUTE (GỢI Ý)
 * ================================================================================
 * 
 * POST /api/routes/create
 * Body: RouteDataForDB
 * 
 * Server sẽ:
 * 1. Tạo record trong bảng Routes (routeName, startDate, endDate, startTime, endTime)
 * 2. Lấy routeID vừa tạo
 * 3. Loop qua waypoints[], mỗi waypoint tạo record trong bảng BusStop hoặc RouteDetails:
 *    - routeID (foreign key)
 *    - parentID (có thể null)
 *    - address
 *    - lat
 *    - lng
 *    - sequence
 * 4. Tạo records trong bảng RouteDays (routeID, day) cho mỗi ngày trong days[]
 * 
 * ================================================================================
 */
