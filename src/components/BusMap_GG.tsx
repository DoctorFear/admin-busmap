// Client component: hiển thị Google Map + tuyến, điểm đón và icon bus
"use client";
import { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "700px" };
const center = { lat: 10.762622, lng: 106.660172 };
const API_BASE = "http://localhost:8888";
const NUMBER_TRACKING_ROUTES = 2; // Số tuyến theo dõi mặc định
// Fix reload warning: libraries const should be stable
const MAP_LIBRARIES: ("places")[] = ["places"];

type Route = { routeID: number; routeName: string; estimatedTime?: number | null };
type Stop = { lat: number; lng: number; name: string; sequence: number };

export default function BusMap_GG({ buses }: { buses: any[] }) {
  // State: danh sách tuyến, tuyến được chọn, danh sách điểm dừng của từng tuyến,
  // và polyline đã vẽ theo đường (Directions)
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<number[]>([]);
  const [routeStops, setRouteStops] = useState<Record<number, Stop[]>>({});
  const [directionsPaths, setDirectionsPaths] = useState<Record<number, { lat: number; lng: number }[]>>({});

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GG_MAPS_KEY as string,
    libraries: MAP_LIBRARIES,
  });

  // 1) Lấy danh sách tuyến từ backend (chỉ chạy một lần)
  useEffect(() => {
    console.log("[1] Fetching routes from API ...");
    fetch(`${API_BASE}/api/routes`)
      .then((r) => r.json())
      .then((data: Route[]) => {
        console.log("[1] Fetch routes success:", data);
        setRoutes(data);
      })
      .catch((e) => console.error("[1] Fetch routes failed:", e));
  }, []);

  // 2) Tự chọn NUMBER_TRACKING_ROUTES tuyến đầu để theo dõi khi đã có dữ liệu
  useEffect(() => {
    if (routes.length > 0 && selectedRouteIds.length === 0) {
      const initial = routes.slice(0, NUMBER_TRACKING_ROUTES).map((r) => r.routeID);
      setSelectedRouteIds(initial);
      console.log("[2] Auto-selected route IDs:", initial);
    }
  }, [routes, selectedRouteIds.length]);

  // 3) Khi có tuyến được chọn: gọi API lấy BusStop cho tuyến đó
  useEffect(() => {
    console.log("[3] Selected route IDs:", selectedRouteIds);
    const missing = selectedRouteIds.filter((id) => !routeStops[id]);
    if (missing.length === 0) return;
    console.log("[3] Need to load stops for route IDs:", missing);

    missing.forEach((id) => {
      fetch(`${API_BASE}/api/routes/${id}/stops`)
        .then((r) => r.json())
        .then((stops: any[]) => {
          // Chuẩn hoá: ép Number và loại bỏ toạ độ không hợp lệ (tránh InvalidValueError)
          const normalized: Stop[] = (stops || [])
            .map((s) => ({
              lat: s.lat !== null && s.lat !== undefined ? Number(s.lat) : NaN,
              lng: s.lng !== null && s.lng !== undefined ? Number(s.lng) : NaN,
              name: s.name,
              sequence: s.sequence,
            }))
            .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
            .sort((a, b) => a.sequence - b.sequence);

          setRouteStops((prev) => ({ ...prev, [id]: normalized }));
          console.log(`[3] Loaded ${normalized.length} valid stops for route ${id}`);
        })
        .catch((e) => console.error(`[3] Fetch stops failed for route ${id}:`, e));
    });
  }, [selectedRouteIds, routeStops]);

  // 4) Dùng DirectionsService để vẽ polyline theo đường phố giữa các điểm dừng
  useEffect(() => {
    if (!isLoaded) return;
    const g = google as any;
    const service = new g.maps.DirectionsService();

    const idsToBuild = selectedRouteIds.filter(
      (id) => !directionsPaths[id] && (routeStops[id]?.length || 0) >= 2
    );
    if (idsToBuild.length === 0) return;
    console.log("[4] Building Directions for route IDs:", idsToBuild);

    idsToBuild.forEach((id) => {
      const stops = routeStops[id]!;
      const origin = { lat: stops[0].lat, lng: stops[0].lng };
      const destination = { lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng };
      const waypoints =
        stops.length > 2
          ? stops.slice(1, -1).map((s) => ({ location: { lat: s.lat, lng: s.lng }, stopover: true }))
          : [];

      service.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: g.maps.TravelMode.DRIVING,
          optimizeWaypoints: false,
        },
        (result: any, status: string) => {
          if (status === "OK" && result?.routes?.[0]?.overview_path) {
            const path = result.routes[0].overview_path.map((p: any) => ({
              lat: p.lat(),
              lng: p.lng(),
            }));
            setDirectionsPaths((prev) => ({ ...prev, [id]: path }));
            console.log(`[4] Directions OK for route ${id}, points:`, path.length);
          } else {
            // Fallback: không gọi được Directions → nối thẳng giữa các điểm dừng
            const path = stops.map((s) => ({ lat: s.lat, lng: s.lng }));
            setDirectionsPaths((prev) => ({ ...prev, [id]: path }));
            console.warn("DirectionsService fallback for route", id, status, result);
          }
        }
      );
    });
  }, [isLoaded, selectedRouteIds, routeStops, directionsPaths]);

  const polylines = useMemo(() => {
    // 5) Tạo polyline cho mỗi tuyến (ưu tiên path từ Directions)
    const out = selectedRouteIds
      .map((id, idx) => {
        const path =
          directionsPaths[id] && directionsPaths[id]!.length >= 2
            ? directionsPaths[id]!
            : (routeStops[id] || []).map((s) => ({ lat: s.lat, lng: s.lng }));
        if (!path || path.length < 2) return null;
        // Choose a color per route
        const colors = ["#f44336", "#2196f3", "#4caf50", "#ff9800", "#9c27b0"];
        const color = colors[idx % colors.length];
        return { id, path, color };
      })
      .filter(Boolean) as { id: number; path: { lat: number; lng: number }[]; color: string }[];
    console.log("[5] Polylines recomputed:", out.length);
    return out;
  }, [selectedRouteIds, routeStops, directionsPaths]);

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
        {/* 6) Các marker xe buýt realtime (nếu có) */}
        {(console.log("[6] Bus markers count:", buses?.length ?? 0), null)}
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            position={{ lat: bus.lat, lng: bus.lng }}
            label={bus.busNumber}
          />
        ))}

        {/* 7) Vẽ polyline cho từng tuyến được chọn */}
        {(console.log("[7] Rendering polylines:", polylines.length), null)}
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
      {/* 8) Hiển thị điểm đón (marker tròn + số thứ tự) và icon xe bus tại điểm đầu tuyến */}
      {(console.log("[8] Rendering stop layers for route IDs:", selectedRouteIds), null)}
      {selectedRouteIds.map((routeId, idx) => {
        const stops = routeStops[routeId] || [];
        if (stops.length === 0) return null;
        const colors = ["#f44336", "#2196f3", "#4caf50", "#ff9800", "#9c27b0"];
        const color = colors[idx % colors.length];
        const first = stops[0];

        return (
          <div key={`layer-${routeId}`}>
            {/* Bus icon at first stop */}
            <Marker
              position={{ lat: first.lat, lng: first.lng }}
              icon={{
                url: "/bus.png",
                scaledSize: new google.maps.Size(32, 32),
              }}
            />
            {/* Pickup points for this route */}
            {stops.map((s) => (
              <Marker
                key={`${routeId}-${s.sequence}`}
                position={{ lat: s.lat, lng: s.lng }}
                label={{
                  text: String(s.sequence),
                  color: "#111",
                  fontSize: "12px",
                }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: color,
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
              />
            ))}
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
