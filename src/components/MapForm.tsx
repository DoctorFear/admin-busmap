'use client';

import { useEffect, useState, useMemo } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import styles from "../styles/MapForm.module.css";

interface MapFormProps {
  roads: string[];
  parents?: Parent[];
  onWaypointsChange?: (waypoints: WaypointData[]) => void;
}

interface Coordinate {
  lat: number;
  lng: number;
}

// Interface cho Parent data
interface Parent {
  userID: number;
  name: string;
  username: string;
  password: string;
  phone: string;
  studentName: string;
  address: string;
  lat?: string;
  lng?: string;
}

// Interface cho dữ liệu waypoint sẽ lưu vào database
interface WaypointData {
  parentID: number | null;  // null nếu không phải địa chỉ parent
  address: string;          // Địa chỉ text đầy đủ
  lat: number;              // Tọa độ latitude
  lng: number;              // Tọa độ longitude
  sequence: number;         // Thứ tự waypoint (1, 2, 3, ...)
}

// --------------------------------- Google Map settings --------------------------------- \\
const SGU_ADDRESS = "Trường Đại học Sài Gòn, 273 An Dương Vương, Phường Chợ Quán, Thành phố Hồ Chí Minh 700000, Việt Nam";
const SGU_NEAR_ADDRESS_FOR_MARKER = "286 An Dương Vương, Phường 2, 5, Thành phố Hồ Chí Minh, Việt Nam";
const SGU_LAT_LNG = { lat: 10.759983082120561, lng: 106.68225725256899 }; // Center: SGU

const API_BASE = "http://localhost:8888";
const containerStyle = { width: "100%", height: "850px" };
// -------------------------------------------------------------------------------------- \\


export default function MapForm({ roads, parents = [], onWaypointsChange }: MapFormProps) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizeWaypoints, setOptimizeWaypoints] = useState(false);
  
  // Lưu thông tin waypoints để chuẩn bị cho database
  const [waypointsData, setWaypointsData] = useState<WaypointData[]>([]);

  // Get GG_MAPS_KEY from env.local
  const googleApiKey = process.env.NEXT_PUBLIC_GG_MAPS_KEY as string;

  /**
   * [1] Geocode thật để lấy lat/lng cho từng đường
   */
  const geocodeRoad = async (road: string): Promise<Coordinate | null> => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          road + ", Hồ Chí Minh, Việt Nam"
        )}&key=${googleApiKey}`
      );
      const data = await res.json();
      if (data.status === "OK" && data.results[0]) {
        return data.results[0].geometry.location;
      }
      console.warn("Không tìm thấy:", road);
      return null;
    } catch (err) {
      console.error("Lỗi Geocoding:", err);
      return null;
    }
  };

  /**
   * [2] Khi danh sách roads thay đổi → geocode và vẽ tuyến
   * UPDATED: Chỉ cần 1 địa chỉ (hoặc 0) để route
   * - Origin: SGU_ADDRESS (tự động)
   * - Destination: SGU_ADDRESS (tự động)
   * - Waypoints: các địa chỉ người dùng nhập
   * 
   * IMPORTANT: Xây dựng waypointsData để lưu vào database
   */
  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
      const coords: Coordinate[] = [];
      const waypointsInfo: WaypointData[] = [];

      // Geocode các địa chỉ người dùng nhập (sẽ là waypoints)
      for (let i = 0; i < roads.length; i++) {
        const road = roads[i];
        
        // Kiểm tra xem địa chỉ này có phải của parent không
        const matchedParent = parents.find(p => p.address === road);
        
        let coord: Coordinate | null = null;
        
        if (matchedParent && matchedParent.lat && matchedParent.lng) {
          // Nếu là địa chỉ parent và đã có lat/lng → dùng luôn
          coord = {
            lat: parseFloat(matchedParent.lat),
            lng: parseFloat(matchedParent.lng)
          };
          console.log(`[MapForm] Dùng tọa độ parent cho: ${road}`);
        } else {
          // Không phải parent hoặc parent không có lat/lng → geocode
          coord = await geocodeRoad(road);
        }
        
        if (coord) {
          coords.push(coord);
          
          // Tạo waypoint data để lưu vào DB
          waypointsInfo.push({
            parentID: matchedParent ? matchedParent.userID : null,
            address: road,
            lat: coord.lat,
            lng: coord.lng,
            sequence: i + 1  // Sequence bắt đầu từ 1
          });
        }
      }

      setCoordinates(coords);
      setWaypointsData(waypointsInfo);
      
      console.log("[MapForm] Waypoints data chuẩn bị cho DB:", waypointsInfo);
      
      setLoading(false);
    };

    fetchRoute();
  }, [roads, parents]);

  /**
   * [3] Tính trung tâm bản đồ
   */
  const mapCenter = useMemo(() => {
    if (coordinates.length === 0) return SGU_LAT_LNG; // FIXED: Dùng constant thay vì tạo object mới
    const avgLat =
      coordinates.reduce((sum, c) => sum + c.lat, 0) / coordinates.length;
    const avgLng =
      coordinates.reduce((sum, c) => sum + c.lng, 0) / coordinates.length;
    return { lat: avgLat, lng: avgLng };
  }, [coordinates]);

  /**
   * [4] Khi có đủ điểm → gọi DirectionsService để vẽ đường thật
   * UPDATED:
   * - Origin: SGU_ADDRESS (cố định)
   * - Destination: SGU_ADDRESS (cố định)
   * - Waypoints: tất cả địa chỉ người dùng nhập
   */
  useEffect(() => {
    // Không route nếu không có coordinates
    if (coordinates.length === 0) {
      setDirections(null);
      return;
    }

    const service = new google.maps.DirectionsService();

    // Origin và Destination đều là SGU
    const origin = SGU_ADDRESS;
    const destination = SGU_NEAR_ADDRESS_FOR_MARKER; 
    // const destination = SGU_ADDRESS; 
    
    // Waypoints: tất cả địa chỉ người dùng nhập (hoặc empty nếu chưa có)
    const waypoints = coordinates.map((coord) => ({ 
      location: coord,
      stopover: true 
    }));

    console.log("[MapForm] Routing with:", {
      origin,
      destination,
      waypoints: waypoints.length,
      optimize: optimizeWaypoints
    });

    service.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: optimizeWaypoints,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
          console.log("[MapForm] Route thành công!");
          
          // ====================================================================
          // CẬP NHẬT SEQUENCE SAU KHI OPTIMIZE (NẾU CÓ)
          // ====================================================================
          if (optimizeWaypoints && result.routes[0]?.waypoint_order && waypointsData.length > 0) {
            // Google trả về thứ tự tối ưu trong waypoint_order
            const optimizedOrder = result.routes[0].waypoint_order;
            console.log("[MapForm] Google optimized order:", optimizedOrder);
            
            // Sắp xếp lại waypointsData theo thứ tự tối ưu
            const reorderedWaypoints = optimizedOrder.map((originalIndex, newIndex) => ({
              ...waypointsData[originalIndex],
              sequence: newIndex + 1  // Sequence mới sau khi tối ưu
            }));
            
            console.log("[MapForm] Waypoints sau khi tối ưu:", reorderedWaypoints);
            
            // Gửi dữ liệu về parent component
            if (onWaypointsChange) {
              onWaypointsChange(reorderedWaypoints);
            }
          } else if (waypointsData.length > 0) {
            // Không optimize → giữ nguyên thứ tự
            if (onWaypointsChange) {
              onWaypointsChange(waypointsData);
            }
          }
        } else {
          console.warn("[MapForm] Lỗi Directions API:", status);
          setDirections(null);
        }
      }
    );
  }, [coordinates, optimizeWaypoints]); // FIXED: Bỏ waypointsData và onWaypointsChange khỏi dependencies

  const isRouteValid = directions !== null;

  /**
   * [5] Render map (giữ nguyên layout)
   */
  return (
    <div className={styles.mapContainer}>
      {/* <h3>Tuyến đường</h3> */}
      <div className={styles.validationStatus}>
        <div>
          {loading ? (
            <span style={{ color: "#888" }}>⏳ Đang tải tuyến đường thật...</span>
          ) : isRouteValid ? (
            <span className={styles.valid}>🟢 Tuyến hợp lệ (SGU → Waypoints → SGU)</span>
          ) : (
            <span className={styles.invalid}>🟡 Chưa có tuyến đường</span>
          )}
        </div>
        <label className={styles.optimizeToggle}>
          <input
            type="checkbox"
            checked={optimizeWaypoints}
            onChange={(e) => setOptimizeWaypoints(e.target.checked)}
          />
          {/* <span>Tối ưu thứ tự điểm dừng</span> */}
          <span>Tối ưu</span>
        </label>
      </div>

      {/* googleApiKey have loaded in app/layout.tsx */}
      <GoogleMap
        // mapContainerStyle={{ width: "100%", height: "800px" }}
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
      >
        {!isRouteValid &&
          coordinates.map((coord, i) => (
            <Marker key={i} position={coord} />
          ))}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#1A73E8",
                strokeWeight: 5,
                strokeOpacity: 0.9,
              },
              suppressMarkers: false,
            }}
          />
        )}
      </GoogleMap>

      
    </div>
  );
}
