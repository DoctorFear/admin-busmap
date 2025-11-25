import { getBusStopsByRoute } from "../models/busStopModel.js";
import { getRouteDetailsWithCoords } from "../models/routeDetailModel.js";
import { getAllRoutes, getAllRoutesToCheckExistedInBusStop, createRouteModel, createBusStopsModel } from "../models/routeModel.js";
import db from "../db.js"; // Import db for rollback

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



// Lấy toàn bộ routes trong BusStop để kiểm tra route mới thêm vào có tồn tại không
export const getAllRoutesToCheckExistedInBusStopController = (_req, res) => {
  console.log("[RouteController] Getting all routes in BusStop to check existed routes...");
  getAllRoutesToCheckExistedInBusStop((err, results) => {
    if (err) {
      console.error("- Lỗi khi truy vấn tất cả routes trong BusStop:", err);
      return res.status(500).json({ error: "Lỗi server khi lấy tất cả tuyến đường" });
    }
    const routes = (results || []).map((r) => ({
      routeID: r.routeID,
      parentID: r.parentID,
    }));
    res.json(routes);
  });
};

// Create new route
export const createRouteController = (req, res) => {
  console.log("=".repeat(70));
  console.log("[RouteController] CREATE NEW ROUTE - Bắt đầu");
  console.log("=".repeat(70));
  
  const { routeName, waypoints, startTime, startDate, endDate, days } = req.body;
  
  // Validate input
  if (!routeName || !waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
    console.error("[RouteController] ❌ Validation failed: Missing required fields");
    return res.status(400).json({ 
      success: false, 
      error: "Thiếu thông tin: routeName và waypoints là bắt buộc" 
    });
  }

  console.log("[RouteController] Input data:");
  console.log("  - Route Name:", routeName);
  console.log("  - Number of Waypoints:", waypoints.length);
  console.log("  - Start Time:", startTime);
  console.log("  - Date Range:", startDate, "→", endDate);
  console.log("  - Days:", days);

  // ====================================================================
  // STEP 1: Chuẩn bị dữ liệu cho Route table
  // ====================================================================
  
  // Tạo description từ danh sách địa chỉ (cách nhau bởi dấu phẩy)
  const description = waypoints.map(wp => wp.address).join(", ");
  const estimatedTime = 30; // Fixed value as requested
  
  const routeData = {
    routeName: routeName.trim(),
    description: description,
    estimatedTime: estimatedTime
  };

  console.log("\n[RouteController] STEP 1: Tạo Route");
  console.log("  - Route Name:", routeData.routeName);
  console.log("  - Description:", description.substring(0, 100) + "...");
  console.log("  - Estimated Time:", estimatedTime);

  // ====================================================================
  // STEP 2: Insert vào Route table
  // ====================================================================
  
  createRouteModel(routeData, (err, result) => {
    if (err) {
      console.error("[RouteController] ❌ Error inserting Route:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Lỗi khi tạo route trong database" 
      });
    }

    const newRouteID = result.insertId;
    console.log("[RouteController] ✓ Route created successfully!");
    console.log("  - New Route ID:", newRouteID);

    // ====================================================================
    // STEP 3: Chuẩn bị dữ liệu cho BusStop table
    // ====================================================================
    
    console.log("\n[RouteController] STEP 2: Chuẩn bị Bus Stops data");
    
    const busStopsData = waypoints.map((waypoint, index) => ({
      routeID: newRouteID,
      parentID: waypoint.parentID, // null nếu không có
      name: waypoint.address,
      lat: waypoint.lat,
      lng: waypoint.lng,
      sequence: waypoint.sequence,
      estimatedArrivalTime: startTime || "07:00:00"
    }));

    console.log("  - Number of Bus Stops to create:", busStopsData.length);
    busStopsData.forEach((stop, idx) => {
      console.log(`  - Stop ${idx + 1}:`, {
        parentID: stop.parentID || "NULL",
        sequence: stop.sequence,
        address: stop.name.substring(0, 50) + "..."
      });
    });

    // ====================================================================
    // STEP 4: Insert vào BusStop table (bulk insert)
    // ====================================================================
    
    console.log("\n[RouteController] STEP 3: Tạo Bus Stops");
    
    createBusStopsModel(busStopsData, (err2, result2) => {
      if (err2) {
        console.error("[RouteController] ❌ Error inserting BusStops:", err2);
        // Rollback: Delete the route we just created
        console.log("[RouteController] Attempting rollback...");
        const deleteSql = `DELETE FROM Route WHERE routeID = ?`;
        db.query(deleteSql, [newRouteID], (deleteErr) => {
          if (deleteErr) {
            console.error("[RouteController] ❌ Rollback failed:", deleteErr);
          } else {
            console.log("[RouteController] ✓ Rollback successful - Route deleted");
          }
        });
        
        return res.status(500).json({ 
          success: false, 
          error: "Lỗi khi tạo bus stops. Route đã được rollback." 
        });
      }

      console.log("[RouteController] ✓ Bus Stops created successfully!");
      console.log("  - Number of stops inserted:", result2.affectedRows);
      console.log("\n" + "=".repeat(70));
      console.log("[RouteController] ✓✓✓ CREATE ROUTE COMPLETED SUCCESSFULLY");
      console.log("=".repeat(70));
      console.log("Summary:");
      console.log("  - Route ID:", newRouteID);
      console.log("  - Route Name:", routeData.routeName);
      console.log("  - Total Bus Stops:", result2.affectedRows);
      console.log("  - Parent IDs:", waypoints.filter(w => w.parentID).map(w => w.parentID).join(", ") || "None");
      console.log("=".repeat(70) + "\n");

      // Return success response
      res.status(201).json({ 
        success: true, 
        message: "Tạo route thành công!",
        data: {
          routeID: newRouteID,
          routeName: routeData.routeName,
          totalBusStops: result2.affectedRows,
          waypoints: busStopsData
        }
      });
    });
  });
};