// src/server/models/driverModel.js
import db from '../db.js';

// ==================== LẤY DANH SÁCH TÀI XẾ (QUAN TRỌNG NHẤT) ====================
export const getAllDrivers = (callback) => {
  const sql = `
    SELECT 
      d.driverID,          -- <<< BẮT BUỘC PHẢI CÓ ĐỂ FRONTEND LẤY ĐÚNG ID KHI PHÂN CÔNG
      d.userID,
      u.fullName   AS name,
      u.username,
      u.phone,
      u.email,
      d.driverLicense AS license,
      d.phoneNumber,
      d.status
    FROM Users u
    JOIN Driver d ON d.userID = u.userID
    WHERE u.role = 'driver'
    ORDER BY u.fullName ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Lỗi getAllDrivers:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};

// ==================== TẠO TÀI XẾ MỚI ====================
export const createDriver = (data, callback) => {
  const { name, username, password, phone, license } = data;

  // 1. Tạo User trước (role = driver)
  const sqlUser = `
    INSERT INTO Users (fullName, username, passwordHash, phone, role)
    VALUES (?, ?, ?, ?, 'driver')
  `;

  db.query(sqlUser, [name, username, password, phone], (err, result) => {
    if (err) return callback(err);

    const userId = result.insertId;

    // 2. Tạo bản ghi trong bảng Driver
    const sqlDriver = `
      INSERT INTO Driver (userID, fullName, phoneNumber, driverLicense, status)
      VALUES (?, ?, ?, ?, 'ACTIVE')
    `;

    db.query(sqlDriver, [userId, name, phone, license], (err, driverResult) => {
      if (err) return callback(err);

      // Trả về driverID để frontend có thể dùng ngay (nếu cần)
      callback(null, { driverID: driverResult.insertId, userID: userId });
    });
  });
};

// ==================== CẬP NHẬT TÀI XẾ ====================
export const updateDriver = (userId, data, callback) => {
  const { name, phone, license, password } = data;

  // Cập nhật bảng Users
  let sqlUser = `UPDATE Users SET fullName = ?, phone = ?`;
  let paramsUser = [name, phone];

  if (password && password.trim() !== '') {
    sqlUser += `, passwordHash = ?`;
    paramsUser.push(password);
  }

  sqlUser += ` WHERE userID = ?`;
  paramsUser.push(userId);

  db.query(sqlUser, paramsUser, (err) => {
    if (err) return callback(err);

    // Cập nhật bảng Driver
    const sqlDriver = `
      UPDATE Driver 
      SET fullName = ?, phoneNumber = ?, driverLicense = ?
      WHERE userID = ?
    `;

    db.query(sqlDriver, [name, phone, license, userId], (err) => {
      if (err) return callback(err);
      callback(null, { message: 'Cập nhật thành công' });
    });
  });
};

// ==================== XÓA TÀI XẾ ====================
export const deleteDriver = (userId, callback) => {
  // Xóa cascade: Driver trước → Users sau (do FK ON DELETE CASCADE cũng được, nhưng an toàn hơn là xóa thủ công)
  db.query(`DELETE FROM Driver WHERE userID = ?`, [userId], (err) => {
    if (err) return callback(err);

    db.query(`DELETE FROM Users WHERE userID = ? AND role = 'driver'`, [userId], (err, result) => {
      callback(err, result);
    });
  });
};

// Nếu bạn có thêm các hàm khác (getById, v.v.) thì để ở dưới đây



// ==================== LẤY TUYẾN XE ĐƯỢC PHÂN CÔNG CHO TÀI XẾ THEO driverID ====================
export const getDriverRoute = (driverID, callback) => {
  console.log('[DriverModel] getDriverRoute - driverID:', driverID);

  const sql = `
    SELECT 
      trip.routeID,
      trip.assignedBusID,
      trip.tripDate,
      trip.startTime,
      trip.endTime,    
      r.routeName
    FROM Trip trip
    JOIN Route r ON trip.routeID = r.routeID
    WHERE 
      trip.assignedDriverID = ?
      AND trip.tripDate = CURDATE()
    ORDER BY trip.startTime ASC
    `;
    // LIMIT 1;  // Chỉ lấy tuyến đầu tiên (nếu có nhiều tuyến được phân công)
    
  db.query(sql, [driverID], (err, results) => {
    console.log('[DriverModel] getDriverRoute - SQL executed', results);
    if (err) {
      console.error('Lỗi getDriverRoute:', err);
      return callback(err, null);
    }
    // Trả về tuyến xe hoặc null nếu không tìm thấy
    callback(null, results.length > 0 ? results : null);
    // callback(null, results.length > 0 ? results[0] : null);
  });
}