import { getBusStopsByRoute } from "../models/busStopModel.js";

export const getRouteStops = (req, res) => {
  const routeID = req.params.id;

  if (!routeID) {
    return res.status(400).json({ error: "Thiếu routeID" });
  }

  getBusStopsByRoute(routeID, (err, results) => {
    if (err) {
      console.error("❌ Lỗi khi truy vấn bus stops:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy điểm dừng" });
    }

    if (!results || results.length === 0) {
      return res.json([]); // không có điểm dừng vẫn trả JSON hợp lệ
    }

    // đảm bảo lat/lng là số
    const stops = results.map((s) => ({
      busStopID: s.busStopID,
      routeID: s.routeID,
      name: s.name,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lng),
      sequence: s.sequence,
      estimatedArrivalTime: s.estimatedArrivalTime,
    }));

    res.json(stops);
  });
};
