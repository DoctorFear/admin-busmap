// app/track/page.tsx
'use client';

const PORT_SERVER = 8888;

/** Thêm socket.io-client vào để:
 *  - Nhận dữ liệu updateBusLocation từ server (realtime)
 *  - Phát “sự kiện nội bộ” (gpsUpdate) để BusMap tự cập nhật
 *  - Dễ mở rộng về sau cho nhiều bus
 */
import { useState, useEffect } from 'react';
import BusMap from '@/components/BusMap';
import BusInfoPanel from '@/components/BusInfoPanel';
import { mockBuses, Bus } from '@/lib/data_buses';
import styles from './page.module.css';
// Add socket.io-client for client
import { io } from 'socket.io-client';
import MapRealtime from '@/components/MapRealtime';



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
  const [buses, setBuses] = useState<Bus[]>(mockBuses);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

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

      // Cập nhật bus tương ứng trong danh sách mockBuses
      setBuses((prevBuses) =>
        prevBuses.map((bus) =>
          bus.id === data.busID.toString()
            ? { ...bus, lat: data.lat, lng: data.lng, isOnline: true }
            : bus
        )
      );

      // Gửi event để BusMap nhận biết thay đổi
      const event = new CustomEvent("gpsUpdate", {
        detail: buses,
      });
      window.dispatchEvent(event);
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
    setBuses((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, isTracking: !b.isTracking } : b
      )
    );
  };

  // --- 4. Render giao diện ---
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
          <BusMap
            buses={buses}
            selectedBus={selectedBus}
            onBusSelect={setSelectedBus}
            onToggleTracking={toggleTracking}
          />
        </div>
        {/* Testing */}
        <div style={{ display: 'none' }}>
          <MapRealtime />
        </div>
        <div className={styles.panelArea}>
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