import db from "../db.js";

export const getRouteDetailsWithCoords = (routeID, callback) => {
  const sql = `
    SELECT routeID, orderNumber, streetName, note, lat, lng
    FROM RouteDetail
    WHERE routeID = ?
    ORDER BY orderNumber ASC
  `;
  db.query(sql, [routeID], callback);
};

