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

// Lấy lịch trình theo ID Tài xế
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
    ORDER BY t.tripDate ASC, t.tripID ASC
  `;

  db.query(sql, [driverID], callback);
};

// Lấy trạng thái của Trip
export const getTripStatus = (tripID, callback) => {
  const sql = `SELECT status FROM Trip WHERE tripID = ?`;
  db.query(sql, [tripID], callback);
};

// Cập nhật trạng thái Trip kèm thời gian
export const updateTripStatusWithTime = (tripID, status, datetime, callback) => {
  let sql = '';
  let params = [];

  if (status === 'RUNNING') {
    sql = `UPDATE Trip SET status = 'RUNNING', startTime = TIME(?) WHERE tripID = ?`;
    params = [datetime, tripID];
  } else if (status === 'COMPLETED') {
    sql = `UPDATE Trip SET status = 'COMPLETED', endTime = TIME(?) WHERE tripID = ?`;
    params = [datetime, tripID];
  } else {
    sql = `UPDATE Trip SET status = ? WHERE tripID = ?`;
    params = [status, tripID];
  }

  db.query(sql, params, callback);
};

// ====================================================================
// LẤY DANH SÁCH BUSES ĐANG ĐƯỢC ASSIGN CHO ROUTES HÔM NAY
// ====================================================================
/**
 * Lấy danh sách buses đang được assign cho routes hôm nay
 * 
 * LOGIC:
 * - Lấy từ bảng Trip: assignedBusID, routeID
 * - Filter: tripDate = hôm nay, status IN ('PLANNED', 'RUNNING')
 * - JOIN với Bus để lấy thông tin bus (licensePlate, model, ...)
 * - Mỗi route có thể có nhiều trips, nhưng mỗi trip chỉ có 1 bus
 * 
 * RETURN:
 * Array of { routeID, busID, licensePlate, model, capacity, ... }
 */
export const getActiveBusAssignments = (callback) => {
  const sql = `
    SELECT 
      t.routeID,
      t.assignedBusID AS busID,
      b.licensePlate,
      b.model,
      b.capacity,
      b.status AS busStatus,
      r.routeName,
      r.description AS routeDescription,
      t.tripID,
      t.tripDate,
      t.startTime,
      t.endTime,
      t.status AS tripStatus
    FROM Trip t
    INNER JOIN Bus b ON t.assignedBusID = b.busID
    INNER JOIN Route r ON t.routeID = r.routeID
    WHERE t.status IN ('PLANNED', 'RUNNING')
      AND t.assignedBusID IS NOT NULL
    ORDER BY t.routeID ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("[tripModel] Lỗi khi query active bus assignments:", err);
      return callback(err, null);
    }
    
    console.log(`[tripModel] Tìm thấy ${results.length} bus assignments hôm nay`);
    callback(null, results);
  });
};
