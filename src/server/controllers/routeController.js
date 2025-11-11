import { getBusStopsByRoute } from "../models/busStopModel.js";
import { getRouteDetailsWithCoords } from "../models/routeDetailModel.js";
import { getAllRoutes } from "../models/routeModel.js";

export const getRouteStops = (req, res) => {
  const routeID = req.params.id;

  if (!routeID) {
    return res.status(400).json({ error: "Thiếu routeID" });
  }

  getBusStopsByRoute(routeID, (err, results) => {
    if (err) {
      console.error("- Lỗi khi truy vấn bus stops:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy điểm dừng" });
    }

    if (results && results.length > 0) {
      // đảm bảo lat/lng là số
      const stops = results.map((s) => ({
        busStopID: s.busStopID,
        routeID: s.routeID,
        name: s.name,
        lat: s.lat !== null ? parseFloat(s.lat) : null,
        lng: s.lng !== null ? parseFloat(s.lng) : null,
        sequence: s.sequence,
        estimatedArrivalTime: s.estimatedArrivalTime,
      }));
      return res.json(stops);
    }

    // Fallback: không có BusStop → lấy từ RouteDetail (nếu có lat/lng)
    getRouteDetailsWithCoords(routeID, (err2, details) => {
      if (err2) {
        console.error("- Lỗi khi truy vấn route details:", err2);
        return res.status(500).json({ error: "Lỗi server khi lấy chi tiết tuyến" });
      }
      const stopsFromDetail =
        (details || [])
          .map((d) => ({
            busStopID: null,
            routeID: d.routeID,
            name: d.streetName,
            lat: d.lat !== null ? parseFloat(d.lat) : null,
            lng: d.lng !== null ? parseFloat(d.lng) : null,
            sequence: d.orderNumber,
            estimatedArrivalTime: null,
          }))
          .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng)) || [];

      return res.json(stopsFromDetail);
    });
  });
};

export const getRoutes = (_req, res) => {
  getAllRoutes((err, results) => {
    if (err) {
      console.error("- Lỗi khi truy vấn routes:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy tuyến đường" });
    }
    const routes = (results || []).map((r) => ({
      routeID: r.routeID,
      routeName: r.routeName,
      estimatedTime: r.estimatedTime,
    }));
    res.json(routes);
  });
};
