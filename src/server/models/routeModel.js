import db from "../db.js";

export const getAllRoutes = (callback) => {
  const sql = `
    SELECT routeID, routeName, estimatedTime
    FROM Route
    ORDER BY routeID ASC
  `;
  db.query(sql, callback);
};

/**
 * [BusStop]Lấy toàn bộ danh sách routes để kiểm tra route mói thêm vào có tồn tại không
 * @param {function} callback
 */
export const getAllRoutesToCheckExistedInBusStop = (callback) => {
  console.log("[RouteModel] Getting all routes in BusStop to check existed routes...");
  const sql_old = `
    SELECT 
      bs.routeID,
      bs.parentID
    FROM BusStop bs
    GROUP BY bs.routeID
  `;
  const sql = `
    SELECT 
      bs.routeID,
      bs.parentID
    FROM BusStop bs
    ORDER BY bs.routeID ASC
  `;
  db.query(sql, callback);
}

// Create new route
export const createRouteModel = (routeData, callback) => {
  const sql = `
    INSERT INTO Route (routeName, description, estimatedTime)
    VALUES (?, ?, ?)
  `;
  const params = [routeData.routeName, routeData.description, routeData.estimatedTime];
  db.query(sql, params, callback);
}

/**
 * Create multiple bus stops for a route
 * @param {Array} busStopsData - Array of bus stop objects
 * @param {function} callback
 */
export const createBusStopsModel = (busStopsData, callback) => {
  if (!busStopsData || busStopsData.length === 0) {
    return callback(new Error("No bus stops data provided"), null);
  }

  const sql = `
    INSERT INTO BusStop (routeID, parentID, name, lat, lng, sequence, estimatedArrivalTime)
    VALUES ?
  `;
  
  // Convert array of objects to array of arrays for bulk insert
  const values = busStopsData.map(stop => [
    stop.routeID,
    stop.parentID || null,
    stop.name,
    stop.lat,
    stop.lng,
    stop.sequence,
    stop.estimatedArrivalTime
  ]);
  
  db.query(sql, [values], callback);
}

