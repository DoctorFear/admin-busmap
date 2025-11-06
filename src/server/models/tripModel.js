import db from "../db.js";

// Lấy toàn bộ lịch trình
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

// Tạo mới lịch trình
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

// Lấy lịch trình theo ID Tài xế (tuần + hôm nay)
export const getTripsByDriverID = (driverID, callback) => {
  const sql = `
    SELECT 
        t.tripID,
        DATE_FORMAT(t.tripDate, '%Y-%m-%d') AS date, 
        r.routeName AS route,
        TIME_FORMAT(t.startTime, '%H:%i:%s') AS startTime,
        TIME_FORMAT(t.endTime, '%H:%i:%s') AS endTime,
        t.status
    FROM Trip t
    JOIN Route r ON t.routeID = r.routeID
    WHERE t.assignedDriverID = ?
      AND t.tripDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 6 DAY)
    ORDER BY t.tripDate ASC, t.startTime ASC
  `;

  db.query(sql, [driverID], (err, rows) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return callback(err, null);
    }
    callback(null, rows);
  });
};

// Cập nhật trạng thái chuyến xe
export const updateTripStatus = (tripID, status, callback) => {
  const sql = `UPDATE Trip SET status = ? WHERE tripID = ?`;
  db.query(sql, [status, tripID], callback);
};