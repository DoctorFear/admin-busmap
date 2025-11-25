// ví dụ file: components/MapRealtime.tsx
"use client";

const PORT_SERVER = 8888;

import { useEffect } from "react";
import { io } from "socket.io-client";

export default function MapRealtime() {
  useEffect(() => {
    const socket = io(`http://localhost:${PORT_SERVER}`);

    // Mỗi 3s gửi vị trí ngẫu nhiên của busID=1
    const interval = setInterval(() => {
      const fakeLocation = {
        busID: 1,
        lat: 10.7626 + Math.random() / 1000,
        lng: 106.6602 + Math.random() / 1000,
        speed: 25 + Math.random() * 5,
      };
      console.log("🚍 Gửi vị trí:", fakeLocation);
      socket.emit("busLocation", fakeLocation);
    }, 3000);

    // Nhận cập nhật vị trí từ server
    socket.on("updateBusLocation", (data) => {
      console.log("📡 Vị trí xe cập nhật:", data);
      // TODO: update marker Leaflet ở đây
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  return <p>Realtime bus tracking is running... (check console)</p>;
}
