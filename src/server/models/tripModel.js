import db from "../db.js";

// Lấy toàn bộ lịch trình (JOIN với Route)
export const getAllTrips = (callback) => {
  const sql = `
    SELECT t.tripID, r.routeName, t.tripDate, t.startTime, t.endTime,
           b.licensePlate, d.fullName AS driverName, t.status
    FROM Trip t
    JOIN Route r ON t.routeID = r.routeID
    LEFT JOIN Bus b ON t.assignedBusID = b.busID
    LEFT JOIN Driver d ON t.assignedDriverID = d.driverID
    ORDER BY t.tripDate DESC;
  `;
  db.query(sql, callback);
};

// Tạo mới lịch trình (Trip)
export const createTrip = (data, callback) => {
  const sql = `
    INSERT INTO Trip (routeID, tripDate, startTime, endTime, assignedBusID, assignedDriverID, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.routeID,
    data.tripDate,
    data.startTime,
    data.endTime,
    data.assignedBusID || null,
    data.assignedDriverID || null,
    data.status || "PLANNED",
  ];
  db.query(sql, values, callback);
};

// Cập nhật lịch trình
export const updateTrip = (id, data, callback) => {
  const sql = `
    UPDATE Trip
    SET routeID=?, tripDate=?, startTime=?, endTime=?, assignedBusID=?, assignedDriverID=?, status=?
    WHERE tripID=?;
  `;
  const values = [
    data.routeID,
    data.tripDate,
    data.startTime,
    data.endTime,
    data.assignedBusID || null,
    data.assignedDriverID || null,
    data.status || "PLANNED",
    id,
  ];
  db.query(sql, values, callback);
};

// Xóa lịch trình
export const deleteTrip = (id, callback) => {
  const sql = "DELETE FROM Trip WHERE tripID=?";
  db.query(sql, [id], callback);
};
