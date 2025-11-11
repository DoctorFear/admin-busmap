// 'use client';

// import { useEffect, useState, useCallback } from 'react';
// import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
// import { Bus } from '@/lib/data_buses';

// interface BusMapProps {
//   buses: Bus[];
//   selectedBus: Bus | null;
//   onBusSelect: (bus: Bus) => void;
//   onToggleTracking: (id: string) => void;
// }

// // Kích thước map hiển thị
// const containerStyle = {
//   width: '100%',
//   height: '100%',
// };

// // Vị trí trung tâm mặc định (TP.HCM)
// const center = {
//   lat: 10.762622,
//   lng: 106.660172,
// };

// export default function BusMap({ buses, selectedBus, onBusSelect }: BusMapProps) {
//   const [map, setMap] = useState<google.maps.Map | null>(null);

//   const { isLoaded } = useJsApiLoader({
//     googleMapsApiKey: process.env.NEXT_PUBLIC_GG_MAPS_KEY as string,
//   });

//   const onLoad = useCallback((map: google.maps.Map) => {
//     setMap(map);
//   }, []);

//   const onUnmount = useCallback(() => {
//     setMap(null);
//   }, []);

//   if (!isLoaded) return <p>🛰️ Đang tải bản đồ...</p>;

//   return (
//     <div style={{ width: '100%', height: '100%' }}>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={center}
//         zoom={13}
//         onLoad={onLoad}
//         onUnmount={onUnmount}
//       >
//         {/* Hiển thị từng xe buýt */}
//         {buses.map((bus) => (
//           <Marker
//             key={bus.id}
//             position={{ lat: bus.lat, lng: bus.lng }}
//             onClick={() => onBusSelect(bus)}
//             icon={{
//               url: '/bus-icon.png', // có thể thêm file icon riêng
//               scaledSize: new google.maps.Size(35, 35),
//             }}
//           />
//         ))}

//         {/* Hiển thị popup thông tin khi chọn xe */}
//         {selectedBus && (
//           <InfoWindow
//             position={{ lat: selectedBus.lat, lng: selectedBus.lng }}
//             onCloseClick={() => onBusSelect(null)}
//           >
//             <div style={{ fontSize: '14px' }}>
//               <strong>Xe buýt #{selectedBus.busNumber}</strong>
//               <br />
//               Trạng thái: {selectedBus.isOnline ? '🟢 Online' : '🔴 Offline'}
//               <br />
//               Tốc độ: {selectedBus.speed ?? 0} km/h
//             </div>
//           </InfoWindow>
//         )}
//       </GoogleMap>
//     </div>
//   );
// }




// ------------- OLD ------------ \\

// components/BusMap.tsx
'use client';

import { useEffect, useState } from 'react';
import { Bus, updateBusPosition } from '@/lib/data_buses';
import { Car, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';
import styles from '@/styles/BusMap.module.css';

interface BusMapProps {
  buses: Bus[];
  selectedBus: Bus | null;
  onBusSelect: (bus: Bus) => void;
  onToggleTracking: (id: string) => void;
}

export default function BusMap({ buses, selectedBus, onBusSelect, onToggleTracking }: BusMapProps) {
  const [scale, setScale] = useState(1);

  // Cập nhật vị trí mỗi 3 giây
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = buses.map(bus =>
        bus.isTracking ? updateBusPosition(bus) : bus
      );
      window.dispatchEvent(new CustomEvent('gpsUpdate', { detail: updated }));
    }, 3000);
    return () => clearInterval(interval);
  }, [buses]);

  const handleZoom = (type: 'in' | 'out') => {
    setScale(prev => type === 'in' ? Math.min(prev * 1.3, 3) : Math.max(prev / 1.3, 0.7));
  };

  const getColor = (status: Bus['status']) => {
    if (status === 'moving') return '#4CAF50';
    if (status === 'stopped') return '#FF9800';
    return '#F44336';
  };

  return (
    <div className={styles.mapContainer}>
      {/* Nút Zoom */}
      <div className={styles.zoomControls}>
        <button onClick={() => handleZoom('in')} className={styles.zoomBtn}>
          <ZoomIn size={18} />
        </button>
        <button onClick={() => handleZoom('out')} className={styles.zoomBtn}>
          <ZoomOut size={18} />
        </button>
      </div>

      {/* Bản đồ SVG */}
      <div className={styles.mapWrapper}>
        <svg
          viewBox="0 0 100 100"
          className={styles.svgMap}
          style={{ transform: `scale(${scale})` }}
        >
          {/* Đường phố */}
          {[20, 50, 80].map(x => (
            <rect key={`v${x}`} x={x} y="0" width="2" height="100" fill="#ccc" />
          ))}
          {[30, 60].map(y => (
            <rect key={`h${y}`} x="0" y={y} width="100" height="2" fill="#ccc" />
          ))}

          {/* Nhãn quận */}
          <text x="10" y="25" fontSize="6" fill="#666">Q1</text>
          <text x="60" y="55" fontSize="6" fill="#666">Q7</text>
          <text x="40" y="15" fontSize="6" fill="#666">Q3</text>

          {/* Xe buýt */}
          {buses.map(bus => {
            if (!bus.isTracking) return null;

            const isSelected = selectedBus?.id === bus.id;

            return (
              <g
                key={bus.id}
                transform={`translate(${bus.x}, ${bus.y})`}
                onClick={() => onBusSelect(bus)}
                className={styles.busGroup}
              >
                {/* Vòng tròn xe */}
                <circle
                  r={isSelected ? 3.5 : 2.5}
                  fill={bus.isOnline ? getColor(bus.status) : '#999'}
                  stroke={isSelected ? '#edbe80' : '#fff'}
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={bus.isOnline ? 1 : 0.5}
                />

                {/* Số xe */}
                <text
                  x="0"
                  y="-6"
                  textAnchor="middle"
                  fontSize="3"
                  fill="#212"
                  fontWeight="600"
                >
                  {bus.busNumber}
                </text>

                {/* Cảnh báo */}
                {bus.alerts.length > 0 && bus.isOnline && (
                  <circle cx="4" cy="-4" r="2" fill="#F44336">
                    <animate attributeName="r" values="1.5;2.5;1.5" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Mất tín hiệu */}
                {!bus.isOnline && (
                  <text x="0" y="8" textAnchor="middle" fontSize="2.5" fill="#999">
                    No GPS
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Thông báo GPS */}
      {buses.some(b => b.isTracking && !b.isOnline) && (
        <div className={styles.gpsAlert}>
          <AlertCircle size={16} />
          <span>Mất tín hiệu GPS</span>
        </div>
      )}
    </div>
  );
}