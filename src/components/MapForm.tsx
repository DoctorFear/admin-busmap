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
}

interface Coordinate {
  lat: number;
  lng: number;
}

export default function MapForm({ roads }: MapFormProps) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Get GG_MAPS_KEY from env.local
  const googleApiKey = process.env.NEXT_PUBLIC_GG_MAPS_KEY as string;

  /**
   * 🧭 1️⃣ Geocode thật để lấy lat/lng cho từng đường
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
   * 🚀 2️⃣ Khi danh sách roads thay đổi → geocode và vẽ tuyến
   */
  useEffect(() => {
    if (roads.length < 2) {
      setDirections(null);
      return;
    }

    const fetchRoute = async () => {
      setLoading(true);
      const coords: Coordinate[] = [];

      for (const road of roads) {
        const c = await geocodeRoad(road);
        if (c) coords.push(c);
      }

      if (coords.length >= 2) {
        setCoordinates(coords);
      } else {
        console.warn("Không đủ điểm hợp lệ để vẽ tuyến");
        setCoordinates([]);
      }

      setLoading(false);
    };

    fetchRoute();
  }, [roads]);

  /**
   * 📍 3️⃣ Tính trung tâm bản đồ
   */
  const mapCenter = useMemo(() => {
    if (coordinates.length === 0) return { lat: 10.7765, lng: 106.7009 };
    const avgLat =
      coordinates.reduce((sum, c) => sum + c.lat, 0) / coordinates.length;
    const avgLng =
      coordinates.reduce((sum, c) => sum + c.lng, 0) / coordinates.length;
    return { lat: avgLat, lng: avgLng };
  }, [coordinates]);

  /**
   * 🚦 4️⃣ Khi có đủ điểm → gọi DirectionsService để vẽ đường thật
   */
  useEffect(() => {
    if (coordinates.length < 2) return;

    const origin = coordinates[0];
    const destination = coordinates[coordinates.length - 1];
    const waypoints = coordinates
      .slice(1, -1)
      .map((coord) => ({ location: coord }));

    const service = new google.maps.DirectionsService();

    service.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        } else {
          console.warn("Lỗi Directions API:", status);
        }
      }
    );
  }, [coordinates]);

  const isRouteValid = directions !== null;

  /**
   * 🗺️ 5️⃣ Render map (giữ nguyên layout)
   */
  return (
    <div className={styles.mapContainer}>
      <h3>Tuyến đường</h3>

      {/* googleApiKey have loaded in app/layout.tsx */}
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "700px" }}
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

      <div className={styles.validationStatus}>
        {loading ? (
          <span style={{ color: "#888" }}>⏳ Đang tải tuyến đường thật...</span>
        ) : isRouteValid ? (
          <span className={styles.valid}>Tuyến đường hợp lệ (đúng lộ trình)</span>
        ) : (
          <span className={styles.invalid}>Tuyến đường không hợp lệ</span>
        )}
      </div>
    </div>
  );
}
