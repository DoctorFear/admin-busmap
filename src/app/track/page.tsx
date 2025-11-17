// app/track/page.tsx
'use client';

const PORT_SERVER = 8888;

/** Thêm socket.io-client vào để:
 *  - Nhận dữ liệu updateBusLocation từ server (realtime)
 *  - Phát “sự kiện nội bộ” (gpsUpdate) để BusMap tự cập nhật
 *  - Dễ mở rộng về sau cho nhiều bus
 */
import { useState, useEffect } from 'react';
// import BusMap from '@/components/BusMap';
import BusInfoPanel from '@/components/BusInfoPanel';
// import { mockBuses, Bus } from '@/lib/data_buses';
import { Bus } from '@/lib/data_buses';
import styles from './page.module.css';
// Add socket.io-client for client
import { io } from 'socket.io-client';
import MapRealtime from '@/components/MapRealtime';
import BusMap_GG from '@/components/BusMap_GG';

// import MapForm from '@/components/MapForm';



/*
| Phần                                | Mô tả                                                        |
| ----------------------------------- | ------------------------------------------------------------ |
| `io('http://localhost:8888')`       | Kết nối với server Socket.IO đang chạy ở port 8888           |
| `socket.on("updateBusLocation")`    | Lắng nghe thông điệp từ backend (mỗi khi bus gửi vị trí mới) |
| `setBuses(...)`                     | Cập nhật lại danh sách bus hiện tại với vị trí mới           |
| `window.dispatchEvent("gpsUpdate")` | Thông báo cho component `BusMap` cập nhật marker             |
| `socket.disconnect()`               | Ngắt kết nối khi rời trang                                   |
*/

export default function TrackPage() {
  // Fetch buses from API not use mockBuses
  
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isMoving, setIsMoving] = useState(false); // Trạng thái di chuyển

  // --- 1. Lắng nghe event custom (từ socket gửi ra) ---
  useEffect(() => {
    const handler = (e: any) => setBuses(e.detail);
    window.addEventListener("gpsUpdate", handler);
    return () => window.removeEventListener("gpsUpdate", handler);
  }, []);

  // --- 2. Kết nối tới server socket.io ---
  useEffect(() => {
    const socket = io(`http://localhost:${PORT_SERVER}`);

    socket.on("connect", () => {
      console.log("✅ Kết nối Socket.IO thành công:", socket.id);
    });

    // Khi nhận được vị trí bus cập nhật từ server
    socket.on("updateBusLocation", (data) => {
      console.log("📡 Nhận dữ liệu realtime từ server:", data);

      // Cập nhật bus tương ứng trong danh sách
      setBuses((prevBuses) => {
        const updatedBuses = prevBuses.map((bus) =>
          bus.id === data.busID.toString()
            ? { 
                ...bus, 
                lat: data.lat, 
                lng: data.lng, 
                isOnline: true,
                lastUpdate: new Date(),
                status: (data.speed > 5 ? 'moving' : 'stopped') as 'moving' | 'stopped', // Type assertion
              }
            : bus
        );
        
        // Nếu bus chưa tồn tại, tạo mới
        const busExists = prevBuses.some((bus) => bus.id === data.busID.toString());
        if (!busExists) {
          const newBus: Bus = {
            id: data.busID.toString(),
            busNumber: `Bus ${data.busID}`,
            driverName: `Tài xế ${data.busID}`,
            route: `Tuyến ${data.busID}`,
            status: (data.speed > 5 ? 'moving' : 'stopped') as 'moving' | 'stopped',
            eta: new Date(Date.now() + 30 * 60000).toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            x: 0,
            y: 0,
            lat: data.lat,
            lng: data.lng,
            lastUpdate: new Date(),
            isTracking: true,
            isOnline: true,
            alerts: [],
          };
          updatedBuses.push(newBus);
        }
        
        return updatedBuses;
      });
    });

    socket.on("disconnect", () => {
      console.warn("⚠️ Mất kết nối Socket.IO");
    });

    return () => { 
      socket.disconnect();
    }
  }, []);

  // --- 3. Toggle tracking ---
  const toggleTracking = (id: string) => {
    console.log('[TrackPage] Toggle tracking called for bus:', id);
    console.log('[TrackPage] Current selectedBus:', selectedBus);
    
    // Bỏ chọn bus (đóng panel)
    setSelectedBus(null);
    
    // Cập nhật trạng thái tracking của bus
    setBuses((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, isTracking: !b.isTracking } : b
      )
    );
    
    console.log('[TrackPage] Bus unselected, panel should close');
  };
  
  // --- 4. Handle bus selection từ map ---
  const handleBusSelect = (bus: any) => {
    console.log('[TrackPage] Bus selected:', bus);
    setSelectedBus(bus);
  };
  
  // --- 5. Toggle movement - Bật/tắt di chuyển ---
  const toggleMovement = () => {
    setIsMoving((prev) => !prev);
  };

  // --- 6. Render giao diện ---
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Theo dõi vị trí xe buýt (Realtime)</h1>
        <div className={styles.stats}>
          <span>
            Đang theo dõi:{" "}
            {buses.filter((b) => b.isTracking && b.isOnline).length}
          </span>
          <span>Tổng: {buses.length}</span>
        </div>
      </div>

      <div className={styles.layout}>
        
        <div className={styles.mapArea}>
          {/* Google Maps render */}
          
          <BusMap_GG 
            buses={buses} 
            onBusSelect={handleBusSelect}
            isMoving={isMoving}
          />
          {/* <BusMap
              buses={buses}
              selectedBus={selectedBus}
              onBusSelect={setSelectedBus}
              onToggleTracking={toggleTracking}
            /> */}
          {/* <MapForm roads={}/> */}

        </div>

        {/* Testing */}
        <div style={{ display: 'none' }}>
          <MapRealtime />
        </div>

        <div className={styles.panelArea}>
          {/* Button Di chuyển */}
          <button
            onClick={toggleMovement}
            style={{
              width: "100%",
              padding: "12px 16px",
              marginBottom: "16px",
              background: isMoving ? "#f44336" : "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
            }}
          >
            {isMoving ? "⏸️ Dừng di chuyển" : "▶️ Bắt đầu di chuyển"}
          </button>
          
          {/* Panel thông tin bus */}
          <BusInfoPanel
            bus={selectedBus}
            onToggleTracking={toggleTracking}
          />
        </div>
      </div>

      

    </div>
  );
}



//----------------OLD------------------\\

// export default function TrackPage() {
//   const [buses, setBuses] = useState<Bus[]>(mockBuses);
//   const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

//   // Nghe event custom (từ socket gửi ra) 
//   useEffect(() => {
//     const handler = (e: any) => setBuses(e.detail);
//     window.addEventListener('gpsUpdate', handler);
//     return () => window.removeEventListener('gpsUpdate', handler);
//   }, []);

//   const toggleTracking = (id: string) => {
//     setBuses(prev => prev.map(b =>
//       b.id === id ? { ...b, isTracking: !b.isTracking } : b
//     ));
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.header}>
//         <h1>Theo dõi vị trí xe buýt</h1>
//         <div className={styles.stats}>
//           <span>Đang theo dõi: {buses.filter(b => b.isTracking && b.isOnline).length}</span>
//           <span>Tổng: {buses.length}</span>
//         </div>
//       </div>

//       <div className={styles.layout}>
//         <div className={styles.mapArea}>
//           <BusMap
//             buses={buses}
//             selectedBus={selectedBus}
//             onBusSelect={setSelectedBus}
//             onToggleTracking={toggleTracking}
//           />
//         </div>
//         <div className={styles.panelArea}>
//           <BusInfoPanel bus={selectedBus} onToggleTracking={toggleTracking} />
//         </div>
//       </div>
//     </div>
//   );
// }