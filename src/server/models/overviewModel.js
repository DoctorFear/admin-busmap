// src/server/models/overviewModel.js
import db from '../db.js';

/**
 * Lấy dữ liệu tổng quan chuyến đi hôm nay
 * Đúng theo DB hiện tại của bạn
 */
export const getTodayOverview = (callback) => {
  const sql = `
    SELECT
      br.recordID,                  -- <<< CỘT THỰC TẾ TRONG BoardingRecord
      s.studentID,
      t.tripID,
      s.fullName AS studentName,
      d.fullName AS driverName,
      b.licensePlate AS busPlate,
      r.routeName AS routeName,
      br.status AS studentStatus
    FROM BoardingRecord br
    JOIN Student s ON br.studentID = s.studentID
    JOIN Trip t ON br.tripID = t.tripID
    JOIN Driver d ON t.assignedDriverID = d.driverID
    JOIN Bus b ON t.assignedBusID = b.busID
    JOIN Route r ON t.routeID = r.routeID
    WHERE DATE(t.tripDate) = CURDATE()
      AND t.status IN ('RUNNING', 'COMPLETED')
    ORDER BY r.routeName, s.fullName
    LIMIT 1000
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Lỗi query overview:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};