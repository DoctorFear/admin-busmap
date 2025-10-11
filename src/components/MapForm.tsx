'use client';

import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import styles from '../styles/MapForm.module.css';

// Fix default icon issue with Leaflet in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface MapFormProps {
  roads: string[];
}

interface Coordinate {
  lat: number;
  lng: number;
}

export default function MapForm({ roads }: MapFormProps) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);

  // Mock coordinates for roads (replace with real geocoding API in production)
  useEffect(() => {
    // Simulate geocoding: map road names to coordinates
    const mockCoordinates: { [key: string]: Coordinate } = {
      'Đường Lê Lợi': { lat: 10.7765, lng: 106.7009 },
      'Đường Nguyễn Huệ': { lat: 10.7746, lng: 106.7015 },
      'Đường Hai Bà Trưng': { lat: 10.7790, lng: 106.6980 },
      'Đường Đồng Khởi': { lat: 10.7750, lng: 106.7020 },
    };

    const newCoordinates = roads
      .map((road) => mockCoordinates[road] || { lat: 10.7765 + Math.random() * 0.01, lng: 106.7009 + Math.random() * 0.01 })
      .filter((coord) => coord.lat && coord.lng);
    setCoordinates(newCoordinates);
  }, [roads]);

  // Validate route continuity (mock implementation)
  const isRouteValid = () => {
    // In production, use OpenStreetMap API to check if roads form a continuous route
    return coordinates.length >= 2; // Simple mock: valid if at least 2 points
  };

  return (
    <div className={styles.mapContainer}>
      <h3>Tuyến đường</h3>
      <MapContainer center={[10.7765, 106.7009]} zoom={15} className={styles.map}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {coordinates.map((coord, index) => (
          <Marker key={index} position={[coord.lat, coord.lng]} />
        ))}
        {coordinates.length >= 2 && (
          <Polyline positions={coordinates} color="#edbe80" weight={5} />
        )}
      </MapContainer>
      <div className={styles.validationStatus}>
        {isRouteValid() ? (
          <span className={styles.valid}>Tuyến đường hợp lệ</span>
        ) : (
          <span className={styles.invalid}>Tuyến đường không hợp lệ (đứt đoạn)</span>
        )}
      </div>
    </div>
  );
}