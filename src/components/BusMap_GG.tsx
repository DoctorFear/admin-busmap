// Client component: hiển thị Google Map + tuyến, điểm đón và icon bus
"use client";
// ================================================================================
// BUSMAP_GG.TSX - GOOGLE MAPS INTEGRATION WITH REAL ADDRESSES
// ================================================================================
//
// TỔNG QUAN:
// Component này hiển thị bản đồ Google Maps với các tuyến xe buýt được phân cụm.
// Các tuyến được vẽ theo ĐƯỜNG PHỐ THỰC TẾ (không phải đường chim bay) bằng cách
// sử dụng Google Directions API với địa chỉ thật từ realAddressLocation.json.
//
// ================================================================================
// GOOGLE APIs SỬ DỤNG:
// ================================================================================
//
// 1. GOOGLE MAPS JAVASCRIPT API (@react-google-maps/api)
//    - GoogleMap: Component render bản đồ
//    - Marker: Component đánh dấu điểm trên bản đồ (bus, bus stops)
//    - Polyline: Component vẽ đường kẻ nối các điểm
//    - useJsApiLoader: Hook load Google Maps API với API key
//
// 2. GOOGLE DIRECTIONS API (google.maps.DirectionsService)
//    - Mục đích: Tìm đường đi tối ưu giữa nhiều điểm theo đường phố thực tế
//    - Input: origin (điểm đầu), destination (điểm cuối), waypoints (điểm giữa)
//    - Output: routes[0].overview_path = array of {lat, lng} theo đường phố
//    - Quan trọng: Ưu tiên dùng STRING ADDRESS thay vì lat/lng để chính xác hơn
//
// ================================================================================
// FLOW HOẠT ĐỘNG:
// ================================================================================
//
// [1] LOAD DATA:
//     - Fetch clusters từ Python service (hoặc dùng realAddressLocation.json)
//     - Convert clusters thành routes/stops với realAddress field
//     - Lưu vào state: routes[], routeStops{}
//
// [2] AUTO-SELECT:
//     - Tự động chọn tuyến đầu tiên để hiển thị
//
// [3] (RESERVED)
//
// [4] DIRECTIONS API:
//     - Với mỗi tuyến được chọn, gọi DirectionsService.route()
//     - Request parameters:
//       * origin: realAddress hoặc {lat, lng} của điểm đầu
//       * destination: realAddress hoặc {lat, lng} của điểm cuối
//       * waypoints: Array of {location: realAddress or {lat,lng}, stopover: true}
//       * travelMode: DRIVING (có thể đổi WALKING, BICYCLING, TRANSIT)
//       * optimizeWaypoints: false (giữ nguyên thứ tự)
//     - Response: routes[0].overview_path = array of LatLng objects
//     - Lưu path vào directionsPaths{} state
//
// [5] CREATE POLYLINES:
//     - Tạo polyline objects từ directionsPaths
//     - Mỗi tuyến có màu riêng (ROUTE_COLORS)
//     - Fallback về stops nếu chưa có Directions
//
// [6] RENDER BUS MARKERS:
//     - Hiển thị vị trí realtime của xe buýt (nếu có)
//
// [7] RENDER POLYLINES:
//     - Vẽ các đường đi trên map bằng Polyline component
//     - Path từ Directions API → đường phố thực tế
//
// [8] RENDER STOP MARKERS:
//     - Hiển thị điểm đón với marker tròn có số thứ tự
//     - Mỗi cụm có màu riêng
//
// ================================================================================
// LƯU Ý QUAN TRỌNG:
// ================================================================================
//
// 1. Ưu tiên dùng REAL ADDRESS (string) thay vì lat/lng khi gọi Directions API
//    → Google Maps tìm đường chính xác hơn với địa chỉ văn bản
//
// 2. Fallback về lat/lng nếu không có realAddress
//
// 3. Fallback về đường thẳng nếu Directions API fail
//
// 4. Validate tất cả lat/lng trước khi sử dụng (Number.isFinite)
//
// 5. API Key được load từ NEXT_PUBLIC_GG_MAPS_KEY environment variable
//
// ================================================================================

import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Polyline } from "@react-google-maps/api"; // Import Polyline để vẽ đường đi

// Lấy data read address từ realAddressLocation.json
const realAddressLocation = require("./realAddressLocation.json");
// ==========================
// Thử nghiệm với realAddressLocation.json
// ==========================


const API_BASE = "http://localhost:8888"; // API base URL
const API_OPTIMIZER_CLUSTER_ROUTE = "http://localhost:5111"; // API optimizer cluster route URL
const NUMBER_TRACKING_ROUTES = 2; // Number of tracking routes by default
const MAP_LIBRARIES: ("places")[] = ["places"]; // Fix reload warning: libraries const should be stable
const containerStyle = { width: "100%", height: "700px" };  // Map container style
const center = { lat: 10.759983082120561, lng: 106.68225725256899 }; // Center: SGU

// Mảng màu cho các cluster (mỗi cụm một màu riêng biệt cho markers)
const ROUTE_COLORS = [
  "#f44336", // Đỏ
  "#2196f3", // Xanh dương
  "#4caf50", // Xanh lá
  "#ff9800", // Cam
  "#9c27b0", // Tím
  "#00bcd4", // Cyan
  "#ff5722", // Đỏ cam
  "#795548", // Nâu
  "#607d8b", // Xanh xám
  "#e91e63", // Hồng
];


// Type định nghĩa cho Route (tuyến đường)
type Route = { routeID: number; routeName: string; estimatedTime?: number | null };
// Type định nghĩa cho Stop (điểm dừng)
// IMPORTANT: Thêm realAddress để dùng cho Google Directions API
type Stop = { 
  lat: number; 
  lng: number; 
  name: string; 
  sequence: number;
  realAddress?: string; // Địa chỉ thật để query Google Directions API
};
// Type cho dữ liệu cluster từ Python service
type ClusterBusStop = { busStopID: number; lat: number; lng: number; parentID: number };


export default function BusMap_GG({ buses }: { buses: any[] }) {
  // State: danh sách tuyến/cụm, tuyến được chọn, danh sách điểm dừng của từng cụm
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<number[]>([]);
  const [routeStops, setRouteStops] = useState<Record<number, Stop[]>>({});
  
  // VẼ ROUTE ĐƯỜNG ĐI
  const [directionsPaths, setDirectionsPaths] = useState<Record<number, { lat: number; lng: number }[]>>({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GG_MAPS_KEY as string,
    libraries: MAP_LIBRARIES,
  });

  // ====================================================================
  // [1] LẤY DỮ LIỆU PHÂN CỤM TỪ PYTHON SERVICE VÀ CONVERT THÀNH ROUTES/STOPS
  // ====================================================================
  // Flow: Gọi NodeJS endpoint (/test-python) → NodeJS gọi Python service → Nhận clusters → Convert thành routes/stops
  useEffect(() => {
    console.log("[1] Đang fetch dữ liệu phân cụm từ Python service...");
    
    // Gọi endpoint NodeJS, NodeJS sẽ gọi Python service thay cho frontend
    fetch(`${API_BASE}/test-python`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`);
        }
        return r.json();
      })
      .then((res: any) => {
        console.log("[1] Raw response từ server:", res);
        
        // Kiểm tra response có thành công không
        if (!res.ok) {
          console.error("[1] !X! Lỗi từ server:", res.error);
          return;
        }

        // Lấy dữ liệu từ Python service 
        const pythonResponse = res.pythonResponse;
        
        // Kiểm tra Python service có trả về success không
        if (!pythonResponse || !pythonResponse.success) {
          console.error("[1] !X! Python service trả về lỗi:", pythonResponse?.error);
          console.error("[1] Full pythonResponse:", pythonResponse);
          return;
        }

        // Lấy clusters dictionary từ Python service
        // Format: { "0": [busStop1, busStop2, ...], "1": [...], ... }

        // const clusters = realAddressLocation || {};
        const clusters = pythonResponse.optimizedRoutes || {};
        const stats = pythonResponse.stats || {};
        
        console.log("[1] ->_<- Nhận được clusters từ Python service:", {
          total_clusters: stats.total_clusters,
          total_bus_stops: stats.total_bus_stops,
          cluster_sizes: stats.cluster_sizes
        });

        // ============================================================
        // CONVERT CLUSTERS THÀNH ROUTES VÀ ROUTESTOPS
        // ============================================================
        // Mỗi cluster (key là string "0", "1", "2"...) sẽ trở thành một route
        const routesList: Route[] = [];
        const stopsMap: Record<number, Stop[]> = {};

        // Duyệt qua từng cluster
        Object.keys(clusters).forEach((clusterKey) => {
          // Chuyển sang số nguyên để không bị lỗi dtype
          const clusterId = parseInt(clusterKey); // Convert "0" → 0, "1" → 1, ...
          
          // Validate clusterId
          if (isNaN(clusterId)) {
            console.warn(`[1] -_- Bỏ qua cluster key không hợp lệ: ${clusterKey}`);
            return;
          }
          
          const busStops: ClusterBusStop[] = clusters[clusterKey] || [];

          if (busStops.length === 0) {
            console.warn(`[1] -_- Cluster ${clusterId} rỗng, bỏ qua`);
            return;
          }

          // Tạo route object cho cluster này
          routesList.push({
            routeID: clusterId,
            routeName: `Tuyến ${clusterId + 1} (${busStops.length} điểm đón)`, // Tên tuyến: "Tuyến 1 (10 điểm đón)"
          });

          // Convert các bus stops trong cluster thành Stop[] với sequence
          // Sequence = thứ tự trong cluster (1, 2, 3, ...)
          // VALIDATE: Chỉ lấy stops có lat/lng hợp lệ (là số và không phải NaN)
          // IMPORTANT: Lưu cả realAddress để dùng cho Google Directions API
          const stops: Stop[] = busStops
            .map((busStop: any, idx: number) => {
              const lat = Number(busStop.lat);
              const lng = Number(busStop.lng);
              
              // Validate lat/lng
              if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                console.warn(`[1] -_- Bỏ qua bus stop có tọa độ không hợp lệ:`, busStop);
                return null;
              }
              
              return {
                lat,
                lng,
                name: `Điểm đón ${idx + 1}`, // Tên điểm dừng
                sequence: idx + 1, // Thứ tự trong tuyến (bắt đầu từ 1)
                realAddress: busStop.realAddress || undefined, // Lưu địa chỉ thật để query Directions API
              } as Stop;
            })
            .filter((stop): stop is Stop => stop !== null); // Loại bỏ null

          // Chỉ lưu stops nếu có ít nhất 1 điểm hợp lệ
          if (stops.length > 0) {
            stopsMap[clusterId] = stops;
          } else {
            console.warn(`[1] -_- Cluster ${clusterId} không có stops hợp lệ nào`);
          }
        });

        // Sắp xếp routes theo routeID để hiển thị đẹp
        routesList.sort((a, b) => a.routeID - b.routeID);

        console.log("[1] ->_<- Đã convert thành công:", {
          total_routes: routesList.length,
          total_stops: Object.values(stopsMap).reduce((sum, stops) => sum + stops.length, 0),
          routes: routesList.map(r => ({ id: r.routeID, name: r.routeName, stops: stopsMap[r.routeID]?.length || 0 }))
        });

        // Cập nhật state
        setRoutes(routesList);
        setRouteStops(stopsMap); // Lưu tất cả stops của tất cả routes vào state
      })
      .catch((e) => {
        console.error("[1] !X! Lỗi khi fetch clusters:", e);
        console.error("[1] Error details:", {
          message: e.message, 
          stack: e.stack
        });
      });
  }, []);

  // ====================================================================
  // [2] TỰ ĐỘNG CHỌN TUYẾN ĐẦU TIÊN ĐỂ HIỂN THỊ MẶC ĐỊNH
  // ====================================================================
  // Khi có routes, tự động chọn tuyến đầu tiên để hiển thị
  // Điều này giúp user thấy kết quả ngay khi load page
  // useEffect(() => {
  //   if (routes.length > 0 && selectedRouteIds.length === 0) {
  //     // Chọn tuyến đầu tiên (index 0)
  //     const initial = [1];
  //     setSelectedRouteIds(initial);
  //     console.log("[2] ->_<- Đã tự động chọn tuyến để hiển thị:", initial);
  //   }
  // }, [routes, selectedRouteIds.length]);


  // ====================================================================
  // [4] TẠO ĐƯỜNG ĐI (POLYLINE) THEO ĐƯỜNG PHỐ THỰC TẾ
  // ====================================================================
  // Sử dụng Google Directions API để vẽ đường đi theo đường phố thực tế
  // Không phải đường thẳng (chim bay) giữa các điểm
  // 
  // FLOW:
  // 1. Lấy stops của route đã chọn
  // 2. Tạo request với origin, destination, waypoints
  // 3. Gọi DirectionsService.route() - Google API
  // 4. API trả về route object với overview_path (array of lat/lng points)
  // 5. Lưu path vào state để render Polyline
  //
  // GOOGLE DIRECTIONS API:
  // - Input: origin (điểm đầu), destination (điểm cuối), waypoints (điểm giữa)
  // - Mỗi điểm có thể là: { lat, lng } hoặc string địa chỉ
  // - Output: routes[0].overview_path = array of LatLng objects
  // - overview_path là đường đi đã được tối ưu theo đường phố thực tế
  //
  // QUAN TRỌNG:
  // - Ưu tiên dùng STRING ADDRESS (realAddress) thay vì lat/lng
  // - Google Maps tìm đường chính xác hơn với địa chỉ văn bản
  // - Nếu không có realAddress → fallback về lat/lng
  useEffect(() => {
    // Chờ Google Maps API load xong
    if (!isLoaded) return;
    
    const g = google as any;
    const service = new g.maps.DirectionsService();

    // Tìm các route cần build Directions (chưa có trong directionsPaths và có ít nhất 2 stops)
    const idsToBuild = selectedRouteIds.filter(
      (id) => !directionsPaths[id] && (routeStops[id]?.length || 0) >= 2
    );
    
    if (idsToBuild.length === 0) return;
    
    console.log("[4.1] Đang tạo đường đi (Directions) cho các tuyến:", idsToBuild);

    // Duyệt qua từng route cần build Directions
    idsToBuild.forEach((id) => {
      const stops = routeStops[id]!;
      
      // VALIDATE: Filter chỉ lấy stops có lat/lng hợp lệ
      const validStops = stops.filter((s) => {
        const lat = Number(s.lat);
        const lng = Number(s.lng);
        return Number.isFinite(lat) && Number.isFinite(lng);
      });
      
      if (validStops.length < 2) {
        console.warn(`[4.1] -_- Tuyến ${id} không đủ stops hợp lệ để tạo Directions`);
        return;
      }
      
      // ========================================================================
      // CÁCH 1: Dùng REAL ADDRESS STRING
      // Google Maps tìm đường chính xác hơn với địa chỉ văn bản thay vì lat/lng
      // ========================================================================
      
      // Origin: điểm đầu tiên (ưu tiên dùng realAddress, fallback về lat/lng)
      const origin = validStops[0].realAddress || 
        { lat: Number(validStops[0].lat), lng: Number(validStops[0].lng) };
      
      // Destination: điểm cuối cùng (ưu tiên dùng realAddress, fallback về lat/lng)
      const destination = validStops[validStops.length - 1].realAddress || 
        { lat: Number(validStops[validStops.length - 1].lat), lng: Number(validStops[validStops.length - 1].lng) };
      
      // Waypoints: các điểm giữa (ưu tiên dùng realAddress)
      const waypoints =
        validStops.length > 2
          ? validStops.slice(1, -1).map((s) => ({ 
              location: s.realAddress || { lat: Number(s.lat), lng: Number(s.lng) },
              stopover: true // true = dừng tại điểm này, false = chỉ đi qua
            }))
          : [];

      console.log(`[4.2] Gọi DirectionsService cho tuyến ${id}:`, {
        origin: typeof origin === 'string' ? origin.substring(0, 50) + '...' : origin,
        destination: typeof destination === 'string' ? destination.substring(0, 50) + '...' : destination,
        waypoints: waypoints.length,
      });

      // ========================================================================
      // GỌI GOOGLE DIRECTIONS API
      // ========================================================================
      // DirectionsService.route() parameters:
      // - origin: Điểm bắt đầu (string address hoặc {lat, lng})
      // - destination: Điểm kết thúc (string address hoặc {lat, lng})
      // - waypoints: Các điểm dừng giữa đường (array of {location, stopover})
      // - travelMode: DRIVING | WALKING | BICYCLING | TRANSIT
      // - optimizeWaypoints: true = tối ưu thứ tự waypoints, false = giữ nguyên
      //
      // API Response:
      // - routes[]: Array of route objects
      // - routes[0].overview_path: Array of LatLng points (đường đi đã tối ưu)
      // - routes[0].legs[]: Array of legs (mỗi leg là đoạn đường giữa 2 waypoints)
      service.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: g.maps.TravelMode.DRIVING, // Chế độ lái xe (có thể đổi thành WALKING, BICYCLING, TRANSIT)
          // Tối ưu waypoints: thứ tự đón/trả (kiểm tra sau, bởi vì đã tối ưu trước đó với OR-Tools)
          optimizeWaypoints: false, // false = giữ nguyên thứ tự waypoints (theo cluster), true = tối ưu thứ tự
        },
        (result: any, status: string) => {
          // ========================================================================
          // XỬ LÝ KẾT QUẢ TỪ GOOGLE DIRECTIONS API
          // ========================================================================
          // 
          // RESPONSE FORMAT:
          // {
          //   routes: [
          //     {
          //       overview_path: [LatLng, LatLng, ...], // 100+ điểm theo đường phố
          //       legs: [
          //         {
          //           distance: { value: 1234, text: "1.2 km" },
          //           duration: { value: 180, text: "3 phút" },
          //           steps: [...] // Chi tiết từng bước rẽ
          //         }
          //       ]
          //     }
          //   ],
          //   status: "OK" hoặc "ZERO_RESULTS", "NOT_FOUND", etc.
          // }
          //
          
          console.log(`[4.3] ->_<- API Response cho tuyến ${id}:`, { status, hasRoutes: !!result?.routes?.[0] });
          
          if (status === "OK" && result?.routes?.[0]?.overview_path) {
            // ===================================================================
            // SUCCESS: API trả về đường đi hợp lệ
            // ===================================================================
            
            // Log toàn bộ response để debug 
            console.log("[4.4] Full API Response:", result);
            
            // OVERVIEW_PATH = đường đi tổng quát (simplified)
            // Là array of LatLng objects (google.maps.LatLng)
            // VD: [LatLng(10.76, 106.68), LatLng(10.761, 106.681), ...]
            const overviewPath = result.routes[0].overview_path;
            
            // CONVERT: LatLng objects → plain {lat, lng} objects
            // Vì: LatLng có methods .lat() và .lng(), không phải properties
            const path = overviewPath.map((p: any) => ({
              lat: p.lat(), // Gọi method .lat() để lấy giá trị latitude
              lng: p.lng(), // Gọi method .lng() để lấy giá trị longitude
            }));
            
            // Lưu path vào state
            // → Trigger re-render → useMemo [5] chạy lại → tạo polylines → render [7]
            setDirectionsPaths((prev) => ({ ...prev, [id]: path }));
            
            // Tính tổng khoảng cách và thời gian từ legs
            const totalDistance = result.routes[0].legs.reduce(
              (sum: number, leg: any) => sum + leg.distance.value, 
              0
            ); // meters
            const totalDuration = result.routes[0].legs.reduce(
              (sum: number, leg: any) => sum + leg.duration.value, 
              0
            ); // seconds
            
            console.log(`[4.5] ->_<- SUCCESS: Tuyến ${id} đã có path:`, {
              totalPoints: path.length,        // Số điểm trong path (100+)
              distance: `${(totalDistance / 1000).toFixed(2)} km`, // Khoảng cách
              duration: `${Math.round(totalDuration / 60)} phút`,  // Thời gian
            });
            
          } else {
            // ===================================================================
            // FAILED: API không trả về đường đi (có thể quá xa, không tìm được, etc.)
            // ===================================================================
            
            console.warn(`[4.5] -_- FAILED: DirectionsService cho tuyến ${id}:`, {
              status,
              message: "API không thể tìm đường đi giữa các điểm",
            });
            
            // FALLBACK: Dùng đường thẳng nối các stops
            // Không đẹp nhưng ít nhất vẫn hiển thị được
            const path = validStops.map((s) => ({ 
              lat: Number(s.lat), 
              lng: Number(s.lng) 
            }));
            setDirectionsPaths((prev) => ({ ...prev, [id]: path }));
            
            console.log(`[4.5] Fallback: Dùng đường thẳng với ${path.length} điểm`);
          }
        }
      );
    });
  }, [isLoaded, selectedRouteIds, routeStops, directionsPaths]);

  // ====================================================================
  // [5] TẠO POLYLINES CHO CÁC TUYẾN ĐỂ RENDER TRÊN MAP
  // ====================================================================
  // 
  // MỤC ĐÍCH:
  // Tạo danh sách polylines để vẽ đường đi trên map
  // 
  // FLOW:
  // 1. Duyệt qua các tuyến được chọn (selectedRouteIds)
  // 2. Kiểm tra xem tuyến đó đã có path từ Directions API chưa (directionsPaths)
  // 3. Nếu ĐÃ CÓ → tạo polyline object với path từ API (đường phố thực tế)
  // 4. Nếu CHƯA CÓ → bỏ qua (đợi Directions API trả về)
  // 5. Gán màu riêng cho mỗi tuyến
  // 
  // QUAN TRỌNG:
  // - CHỈ tạo polyline khi đã có directionsPaths (từ Directions API)
  // - KHÔNG dùng fallback (đường thẳng) để tránh duplicate polylines
  // - Khi Directions API hoàn thành → directionsPaths update → useMemo chạy lại → tạo polyline mới
  //
  const polylines = useMemo(() => {
    console.log("[5] Bắt đầu tạo polylines...", {
      selectedRouteIds,
      availableDirections: Object.keys(directionsPaths),
    });

    // Duyệt qua các tuyến được chọn và tạo polyline
    const out = selectedRouteIds
      .map((id, idx) => {
        // ====================================================================
        // CHỈ TẠO POLYLINE NẾU ĐÃ CÓ PATH TỪ DIRECTIONS API
        // ====================================================================
        // Kiểm tra: tuyến này đã có path từ Directions API chưa?
        const path = directionsPaths[id];
        
        // Nếu CHƯA CÓ path hoặc path không hợp lệ → BỎ QUA
        if (!path || path.length < 2) {
          console.log(`[5] -_- Tuyến ${id}: Chưa có Directions path, bỏ qua`);
          return null; // Không tạo polyline, đợi Directions API
        }
        
        // ĐÃ CÓ path từ Directions API → TẠO POLYLINE
        console.log(`[5] ->_<- Tuyến ${id}: Dùng Directions path (${path.length} điểm)`);
        
        // Gán màu cho tuyến này (mỗi tuyến có màu riêng)
        // ROUTE_COLORS = ["#f44336", "#2196f3", "#4caf50", ...]
        const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
        
        // Trả về object chứa thông tin polyline
        return { 
          id,           // ID của tuyến
          path,         // Array of {lat, lng} từ Directions API (100+ điểm)
          color         // Màu của polyline
        };
      })
      .filter(Boolean) as { id: number; path: { lat: number; lng: number }[]; color: string }[];
    
    console.log("[5] ->_<- Đã tạo", out.length, "polylines");
    return out;
  }, [selectedRouteIds, directionsPaths]); // CHỈ phụ thuộc vào selectedRouteIds và directionsPaths

  const toggleRoute = (id: number) => {
    setSelectedRouteIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  if (!isLoaded) {
    return <div style={{ padding: 8 }}>Đang tải bản đồ...</div>;
  }

  return (
    <div style={{ position: "relative" }}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        {/* ============================================================ */}
        {/* [6] HIỂN THỊ MARKER XE BUÝT REALTIME (NẾU CÓ) */}
        {/* ============================================================ */}
        {/* Các marker này hiển thị vị trí realtime của các xe buýt */}
        {
          // (console.log("[6] Số lượng marker xe buýt:", buses?.length ?? 0), null)
        }
        {
        // buses
        //   ?.filter((bus) => {
        //     // VALIDATE: Chỉ render bus có lat/lng hợp lệ
        //     const lat = Number(bus.lat);
        //     const lng = Number(bus.lng);
        //     const isValid = Number.isFinite(lat) && Number.isFinite(lng);
        //     if (!isValid) {
        //       console.warn("[6] -_- Bỏ qua bus có tọa độ không hợp lệ:", bus);
        //     }
        //     return isValid;
        //   })
        //   .map((bus) => {
        //     const lat = Number(bus.lat);
        //     const lng = Number(bus.lng);
        //     return (
        //       <Marker
        //         key={bus.id || `${lat}-${lng}`}
        //         position={{ lat, lng }}
        //         label={bus.busNumber || ""}
        //       />
        //     );
        //   })
        }

        {/* ============================================================ */}
        {/* [7] VẼ POLYLINE (ĐƯỜNG ĐI) CHO MỖI TUYẾN */}
        {/* ============================================================ */}
        {/* 
        POLYLINE LÀ GÌ?
        - Polyline = đường kẻ (line) trên map nối nhiều điểm với nhau
        - Component từ @react-google-maps/api
        
        CÁCH HOẠT ĐỘNG:
        1. Nhận prop "path" = array of {lat, lng} (100+ điểm)
        2. Google Maps API tự động vẽ đường nối các điểm này
        3. Đường được vẽ theo path từ Directions API (đã tối ưu theo đường phố)
        
        PROPS:
        - key: ID duy nhất của polyline (để React track)
        - path: Array of {lat, lng} - danh sách tọa độ để nối
        - options.strokeColor: Màu của đường (hex color)
        - options.strokeOpacity: Độ trong suốt (0 = trong suốt, 1 = đậm)
        - options.strokeWeight: Độ dày của đường (pixels)
        
        LƯU Ý QUAN TRỌNG:
        - Path từ Directions API có 100+ điểm → đường mượt theo đường phố
        - KHÔNG phải chỉ 5 điểm stops → tránh đường chim bay
        - Mỗi polyline có màu riêng để phân biệt các tuyến
        */}
        {(console.log("[7] ->_<- Render", polylines.length, "polylines trên map"), null)}
        {polylines.map((pl) => (
          <Polyline
            key={`polyline-${pl.id}`}
            path={pl.path}
            options={{
              strokeColor: pl.color,    // Màu đường (vd: "#f44336" = đỏ)
              strokeOpacity: 0.8,        // Độ trong suốt (0.8 = 80% đậm)
              strokeWeight: 5,           // Độ dày đường (5px - dễ nhìn)
            }}
          />
        ))}

        {/* ============================================================ */}
        {/* [8] HIỂN THỊ ĐIỂM ĐÓN (MARKER) CHO MỖI CỤM */}
        {/* ============================================================ */}
        {/* Mỗi cluster hiển thị:
            - Các marker tròn với số thứ tự cho mỗi điểm đón
            - Mỗi cụm có màu riêng biệt để dễ phân biệt */}
        {
          // (console.log("[8] Đang render điểm đón cho", selectedRouteIds.length, "cụm"), null)
        }
        {
          // selectedRouteIds.map((routeId, idx) => {
          //   const stops = routeStops[routeId] || [];
            
          //   // VALIDATE: Bỏ qua nếu không có stops hoặc stops không hợp lệ
          //   if (!stops || stops.length === 0) {
          //     console.warn(`[8] -_- Cụm ${routeId} không có stops hợp lệ`);
          //     return null;
          //   }
            
          //   // VALIDATE: Filter chỉ lấy stops có lat/lng hợp lệ
          //   const validStops = stops.filter((s) => {
          //     const lat = Number(s.lat);
          //     const lng = Number(s.lng);
          //     const isValid = Number.isFinite(lat) && Number.isFinite(lng);
          //     if (!isValid) {
          //       console.warn(`[8] -_- Bỏ qua stop có tọa độ không hợp lệ:`, s);
          //     }
          //     return isValid;
          //   });
            
          //   if (validStops.length === 0) {
          //     console.warn(`[8] -_- Cụm ${routeId} không có stops hợp lệ nào sau khi filter`);
          //     return null;
          //   }
            
          //   // Màu cho cluster này (mỗi cụm có màu riêng biệt)
          //   const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];

          //   return (
          //     <div key={`layer-${routeId}`}>
          //       {/* Các điểm đón (pickup points) - marker tròn với số thứ tự */}
          //       {/* Mỗi điểm đón được đánh dấu bằng marker tròn với màu của cụm */}
          //       {validStops.map((s) => {
          //         const lat = Number(s.lat);
          //         const lng = Number(s.lng);
          //         return (
          //           <Marker
          //             key={`${routeId}-${s.sequence}`}
          //             position={{ lat, lng }}
          //             label={{
          //               text: String(s.sequence), // Hiển thị số thứ tự (1, 2, 3, ...)
          //               color: "#111",
          //               fontSize: "12px",
          //             }}
          //             icon={{
          //               path: google.maps.SymbolPath.CIRCLE, // Marker hình tròn
          //               scale: 8, // Kích thước marker (tăng lên để dễ nhìn hơn)
          //               fillColor: color, // Màu fill theo cụm (mỗi cụm một màu)
          //               fillOpacity: 1,
          //               strokeColor: "#ffffff", // Viền trắng
          //               strokeWeight: 2,
          //             }}
          //           />
          //         );
          //       })}
          //     </div>
          //   );
          // })
        }
      </GoogleMap>

      {/* 
      Overlay: Route list/selector 
      - Hiển thị danh sách tuyến đường và cho phép chọn/bỏ chọn
      - Khi chọn tuyến đường, hiển thị đường đi của tuyến đó trên bản đồ
      */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: 12,
          maxHeight: 280,
          width: 280,
          overflow: "auto",
          fontSize: 14,
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Tuyến đường</div>
        {routes.length === 0 ? (
          <div style={{ color: "#666" }}>Không có dữ liệu tuyến</div>
        ) : (
          routes.map((r) => (
            <label
              key={r.routeID}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 4px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selectedRouteIds.includes(r.routeID)}
                onChange={() => toggleRoute(r.routeID)}
              />
              <span>{r.routeName}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
