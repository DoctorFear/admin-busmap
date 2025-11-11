import db from "../db.js";

export const getAllRoutes = (callback) => {
  const sql = `
    SELECT routeID, routeName, estimatedTime
    FROM Route
    ORDER BY routeID ASC
  `;
  db.query(sql, callback);
};

