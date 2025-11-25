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

