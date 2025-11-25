import db from "../db.js";

// Chuyển đổi trạng thái
const statusMap = {
  "chua-don": "NOT_PICKED",
  "da-don": "PICKED",
  "da-tra": "DROPPED",
  "vang-mat": "ABSENT",
};

const reverseStatusMap = {
  "NOT_PICKED": "chua-don",
  "PICKED": "da-don",
  "DROPPED": "da-tra",
  "ABSENT": "vang-mat",
};

// Lấy danh sách học sinh của chuyến hôm nay
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
        DATE_FORMAT(t.tripDate, '%Y-%m-%d') AS tripDate,
        TIME_FORMAT(t.startTime, '%H:%i:%s') AS tripStartTime,
        TIME_FORMAT(t.endTime, '%H:%i:%s') AS tripEndTime,
        t.status AS tripStatus,
        r.routeName,
        p.address AS address

    FROM (
        SELECT tripID, tripDate, startTime, endTime, routeID, status
        FROM Trip
        WHERE assignedDriverID = ?
          AND tripDate = CURDATE()
          AND status IN ('PLANNED', 'RUNNING')
        ORDER BY tripID ASC
        LIMIT 1
    ) AS next_trip

    JOIN BoardingRecord br ON next_trip.tripID = br.tripID
    JOIN Student s ON br.studentID = s.studentID
    JOIN Parent p ON s.parentUserID = p.parentID

    JOIN Trip t ON next_trip.tripID = t.tripID
    JOIN Route r ON t.routeID = r.routeID
    ORDER BY s.fullName ASC
  `;

  db.query(sql, [driverID], (err, rows) => {
    if (err) return callback(err, null);

    if (rows.length === 0) {
      return callback(null, []);
    }

    const mappedRows = rows.map((row) => ({
      ...row,
      status: reverseStatusMap[row.status] || row.status,
    }));

    callback(null, mappedRows);
  });
};


// Lấy tripID từ studentID
export const getTripIDByStudent = (studentID, callback) => {
  const sql = `
    SELECT br.tripID 
    FROM BoardingRecord br
    JOIN Trip t ON br.tripID = t.tripID
    WHERE br.studentID = ? 
      AND t.tripDate = CURDATE()
      AND t.status IN ('PLANNED', 'RUNNING')
    LIMIT 1
  `;
  
  db.query(sql, [studentID], callback);
};

// Cập nhật trạng thái học sinh
export const updateStudentStatus = (studentID, tripID, status, datetime, callback) => {
  const dbStatus = statusMap[status] || status;
  
  let sql = '';
  let params = [];

  if (dbStatus === "PICKED") {
    sql = `UPDATE BoardingRecord SET status = ?, pickupTime = ? WHERE studentID = ? AND tripID = ?`;
    params = [dbStatus, datetime, studentID, tripID];
  } else if (dbStatus === "DROPPED") {
    sql = `UPDATE BoardingRecord SET status = ?, dropoffTime = ? WHERE studentID = ? AND tripID = ?`;
    params = [dbStatus, datetime, studentID, tripID];
  } else {
    sql = `UPDATE BoardingRecord SET status = ? WHERE studentID = ? AND tripID = ?`;
    params = [dbStatus, studentID, tripID];
  }

  db.query(sql, params, callback);
};

// Kiểm tra xem chuyến đã hoàn thành chưa
export const checkTripCompletion = (tripID, callback) => {
  const sql = `
    SELECT 
      COUNT(*) AS total,
      COALESCE(SUM(CASE WHEN status IN ('DROPPED','ABSENT') THEN 1 ELSE 0 END), 0) AS doneCount
    FROM BoardingRecord
    WHERE tripID = ?
  `;
  
  db.query(sql, [tripID], callback);
};

// Lấy thông tin học sinh theo parentId
export const getStudentInfoByParentId = (parentId, callback) => {
  const sql = `
    SELECT 
      s.studentID,
      s.fullName AS studentName,
      s.schoolName,
      s.photoUrl,
      p.address AS pickupPoint
    FROM Student s
    JOIN Parent p ON s.parentUserID = p.parentID
    WHERE s.parentUserID = ?
    LIMIT 1
  `;
  
  db.query(sql, [parentId], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) return callback(new Error("Parent not found"), null);
    callback(null, results[0]);
  });
};

// Update photoUrl
export const updateStudentPhoto = (studentId, photoUrl, callback) => {
  const sql = 'UPDATE Student SET photoUrl = ? WHERE studentID = ?';
  db.query(sql, [photoUrl, studentId], callback);
};