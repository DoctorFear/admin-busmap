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

// Lấy lịch trình theo ID Tài xế
export const getTripsByDriverID = (driverID, callback) => {
  const sql = `
    SELECT 
        d.driverID, 
        da.assignmentDate AS date, 
        r.routeName AS route,
        t.startTime,
        t.endTime
    FROM DriverAssignment da
    JOIN Route r ON da.routeID = r.routeID
    JOIN Driver d ON da.driverID = d.driverID
    LEFT JOIN Trip t 
        ON t.routeID = da.routeID 
        AND t.assignedDriverID = da.driverID
        AND DATE(t.tripDate) = da.assignmentDate
    WHERE da.driverID = ?
      AND DATE(da.assignmentDate) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    ORDER BY da.assignmentDate ASC, t.startTime ASC
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