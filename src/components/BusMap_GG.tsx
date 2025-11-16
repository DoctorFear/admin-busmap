// Client component: hiển thị Google Map + tuyến, điểm đón và icon bus
"use client";
import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
// import { Polyline } from "@react-google-maps/api"; // COMMENT: Tạm thời không dùng khi chưa vẽ route


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
type Stop = { lat: number; lng: number; name: string; sequence: number };
// Type cho dữ liệu cluster từ Python service
type ClusterBusStop = { busStopID: number; lat: number; lng: number; parentID: number };


export default function BusMap_GG({ buses }: { buses: any[] }) {
  // State: danh sách tuyến/cụm, tuyến được chọn, danh sách điểm dừng của từng cụm
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<number[]>([]);
  const [routeStops, setRouteStops] = useState<Record<number, Stop[]>>({});
  
  // VẼ ROUTE ĐƯỜNG ĐI
  // const [directionsPaths, setDirectionsPaths] = useState<Record<number, { lat: number; lng: number }[]>>({});

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

        // Lấy dữ liệu từ Python service (cấu trúc: {ok: true, pythonResponse: {...}})
        const pythonResponse = res.pythonResponse;
        
        // Kiểm tra Python service có trả về success không
        if (!pythonResponse || !pythonResponse.success) {
          console.error("[1] !X! Python service trả về lỗi:", pythonResponse?.error);
          console.error("[1] Full pythonResponse:", pythonResponse);
          return;
        }

        // Lấy clusters dictionary từ Python service
        // Format: { "0": [busStop1, busStop2, ...], "1": [...], ... }
        const clusters = pythonResponse.clusters || {};
        const stats = pythonResponse.stats || {};
        
        console.log("[1] ->_<- Nhận được clusters từ Python:", {
          total_clusters: stats.total_clusters,
          total_bus_stops: stats.total_bus_stops,
          cluster_sizes: stats.cluster_sizes,
          cluster_keys: Object.keys(clusters)
        });

        // ============================================================
        // CONVERT CLUSTERS THÀNH ROUTES VÀ ROUTESTOPS
        // ============================================================
        // Mỗi cluster (key là string "0", "1", "2"...) sẽ trở thành một route
        const routesList: Route[] = [];
        const stopsMap: Record<number, Stop[]> = {};

        // Duyệt qua từng cluster
        Object.keys(clusters).forEach((clusterKey) => {
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
          const stops: Stop[] = busStops
            .map((busStop, idx) => {
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
              };
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
  // [2] TỰ ĐỘNG CHỌN MỘT SỐ TUYẾN ĐỂ HIỂN THỊ MẶC ĐỊNH
  // ====================================================================
  // Khi có routes, tự động chọn NUMBER_TRACKING_ROUTES tuyến đầu tiên để hiển thị
  useEffect(() => {
    if (routes.length > 0 && selectedRouteIds.length === 0) {
      // Chọn NUMBER_TRACKING_ROUTES tuyến đầu tiên (mặc định là 2)
      const initial = routes.slice(0, NUMBER_TRACKING_ROUTES).map((r) => r.routeID);
      setSelectedRouteIds(initial);
      console.log("[2] ->_<- Đã tự động chọn các tuyến để hiển thị:", initial);
    }
  }, [routes, selectedRouteIds.length]);


  // ====================================================================
  // [4] COMMENT: TẠM THỜI KHÔNG DÙNG - TẠO ĐƯỜNG ĐI (POLYLINE) THEO ĐƯỜNG PHỐ
  // ====================================================================
  // Phần này sẽ được dùng khi cần vẽ route đường đi giữa các điểm dừng
  // Sử dụng Google DirectionsService để vẽ đường đi thực tế theo đường phố
  // (không phải đường thẳng giữa các điểm)
  /*
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
    
    console.log("[4] Đang tạo đường đi (Directions) cho các tuyến:", idsToBuild);

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
        console.warn(`[4] -_- Tuyến ${id} không đủ stops hợp lệ để tạo Directions`);
        return;
      }
      
      // Origin: điểm đầu tiên
      const origin = { lat: Number(validStops[0].lat), lng: Number(validStops[0].lng) };
      // Destination: điểm cuối cùng
      const destination = { lat: Number(validStops[validStops.length - 1].lat), lng: Number(validStops[validStops.length - 1].lng) };
      // Waypoints: các điểm giữa (nếu có nhiều hơn 2 điểm)
      const waypoints =
        validStops.length > 2
          ? validStops.slice(1, -1).map((s) => ({ 
              location: { lat: Number(s.lat), lng: Number(s.lng) }, 
              stopover: true 
            }))
          : [];

      // Gọi DirectionsService để lấy đường đi
      service.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: g.maps.TravelMode.DRIVING, // Chế độ lái xe
          optimizeWaypoints: false, // Không tối ưu thứ tự waypoints (giữ nguyên thứ tự trong cluster)
        },
        (result: any, status: string) => {
          if (status === "OK" && result?.routes?.[0]?.overview_path) {
            // Thành công: lấy path từ Directions
            const path = result.routes[0].overview_path.map((p: any) => ({
              lat: p.lat(),
              lng: p.lng(),
            }));
            setDirectionsPaths((prev) => ({ ...prev, [id]: path }));
            console.log(`[4] ->_<- Directions OK cho tuyến ${id}, số điểm:`, path.length);
          } else {
            // Fallback: nếu DirectionsService fail → nối thẳng giữa các điểm dừng
            const path = validStops.map((s) => ({ lat: Number(s.lat), lng: Number(s.lng) }));
            setDirectionsPaths((prev) => ({ ...prev, [id]: path }));
            console.warn(`[4] -_- DirectionsService fallback cho tuyến ${id}, status:`, status);
          }
        }
      );
    });
  }, [isLoaded, selectedRouteIds, routeStops, directionsPaths]);
  */

  // ====================================================================
  // [5] COMMENT: TẠM THỜI KHÔNG DÙNG - TẠO POLYLINES CHO CÁC TUYẾN
  // ====================================================================
  // Phần này sẽ được dùng khi cần vẽ đường đi giữa các điểm dừng
  // Mỗi cluster (route) sẽ có một màu riêng biệt cho polyline
  /*
  const polylines = useMemo(() => {
    // Tạo polyline cho mỗi tuyến được chọn
    const out = selectedRouteIds
      .map((id, idx) => {
        // Ưu tiên dùng path từ Directions (đường phố thực tế)
        // Nếu chưa có Directions → dùng path thẳng nối các điểm
        let path: { lat: number; lng: number }[] | null = null;
        
        if (directionsPaths[id] && directionsPaths[id]!.length >= 2) {
          // Dùng path từ Directions (đã validate rồi)
          path = directionsPaths[id]!;
        } else {
          // Dùng stops trực tiếp (cần validate)
          const stops = routeStops[id] || [];
          const validStops = stops.filter((s) => {
            const lat = Number(s.lat);
            const lng = Number(s.lng);
            return Number.isFinite(lat) && Number.isFinite(lng);
          });
          
          if (validStops.length >= 2) {
            path = validStops.map((s) => ({ lat: Number(s.lat), lng: Number(s.lng) }));
          }
        }
        
        // Bỏ qua nếu path không hợp lệ (< 2 điểm)
        if (!path || path.length < 2) {
          console.warn(`[5] -_- Tuyến ${id} không có path hợp lệ để vẽ polyline`);
          return null;
        }
        
        // Gán màu cho tuyến này (mỗi tuyến có màu riêng, dùng ROUTE_COLORS chung)
        const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];
        
        return { id, path, color };
      })
      .filter(Boolean) as { id: number; path: { lat: number; lng: number }[]; color: string }[];
    
    console.log("[5] ->_<- Đã tạo polylines cho", out.length, "tuyến");
    return out;
  }, [selectedRouteIds, routeStops, directionsPaths]);
  */

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
        {(console.log("[6] Số lượng marker xe buýt:", buses?.length ?? 0), null)}
        {buses
          ?.filter((bus) => {
            // VALIDATE: Chỉ render bus có lat/lng hợp lệ
            const lat = Number(bus.lat);
            const lng = Number(bus.lng);
            const isValid = Number.isFinite(lat) && Number.isFinite(lng);
            if (!isValid) {
              console.warn("[6] -_- Bỏ qua bus có tọa độ không hợp lệ:", bus);
            }
            return isValid;
          })
          .map((bus) => {
            const lat = Number(bus.lat);
            const lng = Number(bus.lng);
            return (
              <Marker
                key={bus.id || `${lat}-${lng}`}
                position={{ lat, lng }}
                label={bus.busNumber || ""}
              />
            );
          })}

        {/* ============================================================ */}
        {/* [7] COMMENT: TẠM THỜI KHÔNG DÙNG - VẼ POLYLINE (ĐƯỜNG ĐI) CHO MỖI TUYẾN/CỤM */}
        {/* ============================================================ */}
        {/* Phần này sẽ được dùng khi cần vẽ đường đi giữa các điểm dừng */}
        {/* Mỗi cluster được vẽ bằng một polyline với màu riêng biệt */}
        {/* 
        {(console.log("[7] Đang render", polylines.length, "polylines"), null)}
        {polylines.map((pl) => (
          <Polyline
            key={pl.id}
            path={pl.path}
            options={{
              strokeColor: pl.color, // Màu riêng cho mỗi cluster
              strokeOpacity: 0.9, // Độ trong suốt
              strokeWeight: 4, // Độ dày đường
            }}
          />
        ))}
        */}

        {/* ============================================================ */}
        {/* [8] HIỂN THỊ ĐIỂM ĐÓN (MARKER) CHO MỖI CỤM */}
        {/* ============================================================ */}
        {/* Mỗi cluster hiển thị:
            - Các marker tròn với số thứ tự cho mỗi điểm đón
            - Mỗi cụm có màu riêng biệt để dễ phân biệt */}
        {(console.log("[8] Đang render điểm đón cho", selectedRouteIds.length, "cụm"), null)}
        {selectedRouteIds.map((routeId, idx) => {
          const stops = routeStops[routeId] || [];
          
          // VALIDATE: Bỏ qua nếu không có stops hoặc stops không hợp lệ
          if (!stops || stops.length === 0) {
            console.warn(`[8] -_- Cụm ${routeId} không có stops hợp lệ`);
            return null;
          }
          
          // VALIDATE: Filter chỉ lấy stops có lat/lng hợp lệ
          const validStops = stops.filter((s) => {
            const lat = Number(s.lat);
            const lng = Number(s.lng);
            const isValid = Number.isFinite(lat) && Number.isFinite(lng);
            if (!isValid) {
              console.warn(`[8] -_- Bỏ qua stop có tọa độ không hợp lệ:`, s);
            }
            return isValid;
          });
          
          if (validStops.length === 0) {
            console.warn(`[8] -_- Cụm ${routeId} không có stops hợp lệ nào sau khi filter`);
            return null;
          }
          
          // Màu cho cluster này (mỗi cụm có màu riêng biệt)
          const color = ROUTE_COLORS[idx % ROUTE_COLORS.length];

          return (
            <div key={`layer-${routeId}`}>
              {/* Các điểm đón (pickup points) - marker tròn với số thứ tự */}
              {/* Mỗi điểm đón được đánh dấu bằng marker tròn với màu của cụm */}
              {validStops.map((s) => {
                const lat = Number(s.lat);
                const lng = Number(s.lng);
                return (
                  <Marker
                    key={`${routeId}-${s.sequence}`}
                    position={{ lat, lng }}
                    label={{
                      text: String(s.sequence), // Hiển thị số thứ tự (1, 2, 3, ...)
                      color: "#111",
                      fontSize: "12px",
                    }}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE, // Marker hình tròn
                      scale: 8, // Kích thước marker (tăng lên để dễ nhìn hơn)
                      fillColor: color, // Màu fill theo cụm (mỗi cụm một màu)
                      fillOpacity: 1,
                      strokeColor: "#ffffff", // Viền trắng
                      strokeWeight: 2,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
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
