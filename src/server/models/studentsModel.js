import db from "../db.js";

// CHuyển đổi trạng thái học sinh (frontend - database)
const statusMap = {
  "chua-don": "not_picked",
  "da-don": "picked",
  "da-tra": "dropped",
  "vang-mat": "absent",
};
const reverseStatusMap = Object.fromEntries(
  Object.entries(statusMap).map(([k, v]) => [v, k])
);

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
        t.tripID,
        t.tripDate,
        t.startTime AS tripStartTime,
        t.endTime AS tripEndTime,
        t.status AS tripStatus,
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
    ORDER BY s.fullName ASC
  `;

  db.query(sql, [driverID], (err, rows) => {
    if (err) {
      console.error("Lỗi truy vấn:", err);
      return callback(err, null);
    }

    const mappedRows = rows.map((row) => ({
      ...row,
      status: reverseStatusMap[row.status] || row.status,
    }));

    callback(null, mappedRows);
  });
};

// Cập nhật trạng thái học sinh + kiểm tra hoàn tất chuyến
export const updateStudentStatusModel = (studentID, status, pickupTime, dropoffTime, callback) => {
  const dbStatus = statusMap[status] || status;

  const getTripQuery = `SELECT tripID FROM Trip WHERE tripDate = CURDATE() AND status IN ('PLANNED','RUNNING') LIMIT 1;`;

  db.query(getTripQuery, (err, tripResult) => {
    if (err) return callback(err);
    if (!tripResult.length) return callback(new Error("Không tìm thấy chuyến hôm nay"));

    const tripID = String(tripResult[0].tripID).trim();

    const updateQuery = `
      UPDATE BoardingRecord
      SET status = ?, 
          pickupTime = ?, 
          dropoffTime = ?
      WHERE studentID = ? AND tripID = ?;
    `;

    db.query(updateQuery, [dbStatus, pickupTime, dropoffTime, studentID, tripID], (err, result) => {
      if (err) return callback(err);

      // Kiểm tra xem tất cả học sinh đã được trả/chưa đón (bỏ qua vắng mặt)
      const checkQuery = `
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status IN ('dropped','absent') THEN 1 ELSE 0 END) AS doneCount
        FROM BoardingRecord
        WHERE tripID = ?;
      `;

      db.query(checkQuery, [tripID], (err, rows) => {
        if (err) return callback(err);

        const { total, doneCount } = rows[0];
        const isCompleted = total === doneCount;

        if (isCompleted) {
          // Cập nhật trạng thái chuyến thành COMPLETED
          const updateTrip = `UPDATE Trip SET status = 'COMPLETED' WHERE tripID = ?;`;
          db.query(updateTrip, [tripID], (err2) => {
            if (err2) return callback(err2);
            console.log(`Chuyến ${tripID} đã hoàn tất.`);
            callback(null, { ...result, tripCompleted: true });
          });
        } else {
          callback(null, { ...result, tripCompleted: false });
        }
      });
    });
  });
};
