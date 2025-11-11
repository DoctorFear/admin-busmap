import db from "../db.js";

/**
 * Lấy danh sách điểm dừng theo routeID
 * @param {number} routeID
 * @param {function} callback
 */
export const getBusStopsByRoute = (routeID, callback) => {
  const sql = `
    SELECT 
      bs.busStopID,
      bs.routeID,
      bs.name,
      bs.lat,
      bs.lng,
      bs.sequence,
      bs.estimatedArrivalTime
    FROM BusStop bs
    WHERE bs.routeID = ?
    ORDER BY bs.sequence ASC
  `;
  db.query(sql, [routeID], callback);
};
