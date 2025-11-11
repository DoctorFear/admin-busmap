"use client";
import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "400px" };
const center = { lat: 10.762622, lng: 106.660172 };
const API_BASE = "http://localhost:8888";

type Route = { routeID: number; routeName: string; estimatedTime?: number | null };
type Stop = { lat: number; lng: number; name: string; sequence: number };

export default function BusMap_GG({ buses }: { buses: any[] }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<number[]>([]);
  const [routeStops, setRouteStops] = useState<Record<number, Stop[]>>({});

  // Fetch list routes once
  useEffect(() => {
    fetch(`${API_BASE}/api/routes`)
      .then((r) => r.json())
      .then((data: Route[]) => setRoutes(data))
      .catch((e) => console.error("Fetch routes failed:", e));
  }, []);

  // When a route is selected, ensure stops are loaded
  useEffect(() => {
    const missing = selectedRouteIds.filter((id) => !routeStops[id]);
    if (missing.length === 0) return;

    missing.forEach((id) => {
      fetch(`${API_BASE}/api/routes/${id}/stops`)
        .then((r) => r.json())
        .then((stops: any[]) => {
          // Normalize and filter valid lat/lng
          const normalized: Stop[] = (stops || [])
            .map((s) => ({
              lat: Number(s.lat),
              lng: Number(s.lng),
              name: s.name,
              sequence: s.sequence,
            }))
            .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
            .sort((a, b) => a.sequence - b.sequence);

          setRouteStops((prev) => ({ ...prev, [id]: normalized }));
        })
        .catch((e) => console.error(`Fetch route ${id} stops failed:`, e));
    });
  }, [selectedRouteIds, routeStops]);

  const polylines = useMemo(() => {
    return selectedRouteIds
      .map((id, idx) => {
        const path = (routeStops[id] || []).map((s) => ({ lat: s.lat, lng: s.lng }));
        if (path.length < 2) return null;
        // Choose a color per route
        const colors = ["#f44336", "#2196f3", "#4caf50", "#ff9800", "#9c27b0"];
        const color = colors[idx % colors.length];
        return { id, path, color };
      })
      .filter(Boolean) as { id: number; path: { lat: number; lng: number }[]; color: string }[];
  }, [selectedRouteIds, routeStops]);

  const toggleRoute = (id: number) => {
    setSelectedRouteIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ position: "relative" }}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            position={{ lat: bus.lat, lng: bus.lng }}
            label={bus.busNumber}
          />
        ))}

        {polylines.map((pl) => (
          <Polyline
            key={pl.id}
            path={pl.path}
            options={{
              strokeColor: pl.color,
              strokeOpacity: 0.9,
              strokeWeight: 4,
            }}
          />
        ))}
      </GoogleMap>

      {/* Overlay: Route list/selector */}
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
