import db from "../db.js";

// Chuyển đổi trạng thái đúng với database 
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

// SỬA ĐỔI: Format ngày ĐÚNG - Xử lý timezone
const formatDateOnly = (date) => {
  if (!date) return null;
  
  // Nếu date là string, parse nó
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Lấy ngày theo UTC để tránh lệch múi giờ
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Lấy danh sách học sinh của chuyến HÔM NAY
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
        r.routeName
    FROM (
        SELECT tripID, tripDate, startTime, endTime, routeID, status
        FROM Trip
        WHERE assignedDriverID = ?
          AND tripDate = CURDATE()
          AND status IN ('PLANNED', 'RUNNING')
        ORDER BY startTime ASC
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

    // Nếu không có chuyến hôm nay
    if (rows.length === 0) {
      return callback(null, { allCompleted: true, students: [] });
    }

    // SỬA ĐỔI: Map trạng thái - KHÔNG cần format lại tripDate vì đã format ở SQL
    const mappedRows = rows.map((row) => ({
      ...row,
      status: reverseStatusMap[row.status] || row.status,
      // tripDate đã là string "YYYY-MM-DD" từ DATE_FORMAT
    }));

    console.log("✓ Trả về danh sách học sinh:", mappedRows[0]?.tripDate); // Debug
    callback(null, { allCompleted: false, students: mappedRows });
  });
};

// Hàm lấy tripID hiện tại
const getCurrentTripID = (studentID, callback) => {
  const sql = `
    SELECT br.tripID 
    FROM BoardingRecord br
    JOIN Trip t ON br.tripID = t.tripID
    WHERE br.studentID = ? 
      AND t.tripDate = CURDATE()
      AND t.status IN ('PLANNED', 'RUNNING')
    LIMIT 1
  `;
  
  db.query(sql, [studentID], (err, rows) => {
    if (err) return callback(err);
    if (!rows.length) return callback(new Error("Không tìm thấy chuyến cho học sinh này"));
    callback(null, rows[0].tripID);
  });
};

// Cập nhật trạng thái học sinh + kiểm tra hoàn tất chuyến
export const updateStudentStatusModel = (studentID, status, callback) => {
  const dbStatus = statusMap[status] || status;

  getCurrentTripID(studentID, (err, tripID) => {
    if (err) return callback(err);

    // SỬA ĐỔI: Tạo datetime theo múi giờ LOCAL (không dùng UTC)
    const now = new Date();
    const mysqlDatetime = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0');

    console.log(`✓ Thời gian cập nhật: ${mysqlDatetime}`); // Debug

    // Logic update
    let updateQuery = '';
    let queryParams = [];

    if (dbStatus === "PICKED") {
      updateQuery = `
        UPDATE BoardingRecord
        SET status = ?, pickupTime = ?
        WHERE studentID = ? AND tripID = ?;
      `;
      queryParams = [dbStatus, mysqlDatetime, studentID, tripID];
      
    } else if (dbStatus === "DROPPED") {
      updateQuery = `
        UPDATE BoardingRecord
        SET status = ?, dropoffTime = ?
        WHERE studentID = ? AND tripID = ?;
      `;
      queryParams = [dbStatus, mysqlDatetime, studentID, tripID];
      
    } else {
      updateQuery = `
        UPDATE BoardingRecord
        SET status = ?
        WHERE studentID = ? AND tripID = ?;
      `;
      queryParams = [dbStatus, studentID, tripID];
    }

    db.query(updateQuery, queryParams, (err, result) => {
      if (err) {
        console.error("Lỗi cập nhật BoardingRecord:", err);
        return callback(err);
      }

      console.log(`✓ Đã cập nhật student ${studentID} sang ${dbStatus}`);

      // Kiểm tra hoàn thành chuyến
      const checkQuery = `
        SELECT COUNT(*) AS total,
               SUM(CASE WHEN status IN ('DROPPED','ABSENT') THEN 1 ELSE 0 END) AS doneCount
        FROM BoardingRecord
        WHERE tripID = ?;
      `;

      db.query(checkQuery, [tripID], (err, rows) => {
        if (err) return callback(err);

        const { total, doneCount } = rows[0];
        const isCompleted = total === doneCount;

        if (isCompleted) {
          const updateTrip = `
            UPDATE Trip 
            SET status = 'COMPLETED', 
                endTime = TIME(?)
            WHERE tripID = ?;
          `;
          db.query(updateTrip, [mysqlDatetime, tripID], (err2) => {
            if (err2) {
              console.error("Lỗi cập nhật Trip:", err2);
              return callback(err2);
            }
            console.log(`✓ Chuyến ${tripID} hoàn tất lúc ${mysqlDatetime}`);
            callback(null, { ...result, tripCompleted: true });
          });
        } else {
          callback(null, { ...result, tripCompleted: false });
        }
      });
    });
  });
};