import db from "../db.js";

// Lấy danh sách học sinh của chuyến xe sắp tới do tài xế phụ trách 
export const getStudentsByDriverID = (driverID, callback) => {
  const sql = `
    SELECT 
        s.studentID, 
        s.fullName AS studentName,
        s.grade,
        br.status,
        br.pickupTime,
        br.dropoffTime,
        t.tripDate,
        t.startTime AS tripStartTime,
        t.endTime AS tripEndTime,
        r.routeName
    FROM (
        SELECT tripID, tripDate, startTime, endTime, routeID, status
        FROM Trip
        WHERE assignedDriverID = ?
          AND (
              (tripDate = CURDATE() AND startTime >= CURTIME())
              OR
              (tripDate = CURDATE() AND status = 'RUNNING')
              OR
              (tripDate > CURDATE())
          )
        ORDER BY tripDate ASC, startTime ASC
        LIMIT 1
    ) AS next_trip
    JOIN BoardingRecord br ON next_trip.tripID = br.tripID
    JOIN Student s ON br.studentID = s.studentID
    JOIN Trip t ON next_trip.tripID = t.tripID
    JOIN Route r ON t.routeID = r.routeID
    LEFT JOIN BusStop bs ON br.busStopID = bs.busStopID
    ORDER BY s.fullName ASC
  `;

  db.query(sql, [driverID], (err, rows) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return callback(err, null);
    }
    callback(null, rows);
  });
};

// Cập nhật trạng thái học sinh trong BoardingRecord
export const updateStudentStatusModel = (studentID, status, callback) => {
  const sql = `
    UPDATE BoardingRecord
    SET status = ?
    WHERE studentID = ?
      AND tripID IN (
        SELECT tripID FROM Trip
        WHERE tripDate = CURDATE()
      )
  `;
  db.query(sql, [status, studentID], (err, result) => {
    if (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      return callback(err);
    }
    callback(null, result);
  });
};

