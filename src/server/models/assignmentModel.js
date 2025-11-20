// src/server/models/assignmentModel.js
import db from '../db.js';

// === HÀM FIX HOÀN HẢO – LUÔN TRẢ VỀ yyyy-MM-dd ĐÚNG ===
const ensureDateOnly = (dateInput) => {
  if (!dateInput) return null;

  // Trường hợp đã sạch yyyy-MM-dd → trả luôn, không đụng vào Date object
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }

  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
};

// LẤY TẤT CẢ PHÂN CÔNG
export const getAllAssignments = (callback) => {
  const sql = `
    SELECT 
      da.assignmentID AS id,
      da.driverID,
      d.fullName AS driverName,
      da.busID,
      b.licensePlate AS busName,
      da.routeID,
      COALESCE(r.routeName, 'Chưa gán tuyến') AS routeName,
      da.assignmentDate,
      da.createdAt
    FROM DriverAssignment da
    JOIN Driver d ON da.driverID = d.driverID
    JOIN Bus b ON da.busID = b.busID
    LEFT JOIN Route r ON da.routeID = r.routeID
    ORDER BY da.assignmentDate DESC, da.createdAt DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

// THÊM MỚI
export const createAssignment = (driverID, busID, routeID, assignmentDate, callback) => {
  const dateOnly = ensureDateOnly(assignmentDate);
  if (!dateOnly) return callback(new Error('Ngày phân công không hợp lệ'));

  const checkDriverSql = `SELECT assignmentID FROM DriverAssignment WHERE driverID = ? AND assignmentDate = ?`;
  db.query(checkDriverSql, [driverID, dateOnly], (err, rows) => {
    if (err) return callback(err);
    if (rows.length > 0) return callback(new Error('Tài xế này đã được phân công vào ngày đã chọn!'));

    const checkBusSql = `SELECT assignmentID FROM DriverAssignment WHERE busID = ? AND assignmentDate = ?`;
    db.query(checkBusSql, [busID, dateOnly], (err, rows) => {
      if (err) return callback(err);
      if (rows.length > 0) return callback(new Error('Xe buýt này đã được phân công vào ngày đã chọn!'));

      const insertSql = `INSERT INTO DriverAssignment (driverID, busID, routeID, assignmentDate) VALUES (?, ?, ?, ?)`;
      db.query(insertSql, [driverID, busID, routeID || null, dateOnly], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    });
  });
};

// CẬP NHẬT
export const updateAssignment = (id, driverID, busID, routeID, assignmentDate, callback) => {
  const dateOnly = ensureDateOnly(assignmentDate);
  if (!dateOnly) return callback(new Error('Ngày phân công không hợp lệ'));

  const checkSql = `SELECT assignmentID FROM DriverAssignment WHERE assignmentDate = ? AND assignmentID != ? AND (driverID = ? OR busID = ?)`;
  db.query(checkSql, [dateOnly, id, driverID, busID], (err, rows) => {
    if (err) return callback(err);
    if (rows.length > 0) return callback(new Error('Tài xế hoặc xe này đã được phân công vào ngày đã chọn!'));

    const updateSql = `UPDATE DriverAssignment SET driverID = ?, busID = ?, routeID = ?, assignmentDate = ? WHERE assignmentID = ?`;
    db.query(updateSql, [driverID, busID, routeID || null, dateOnly, id], (err, result) => {
      if (err) return callback(err);
      if (result.affectedRows === 0) return callback(new Error('Không tìm thấy phân công để cập nhật'));
      callback(null, result);
    });
  });
};

// XÓA
export const deleteAssignment = (id, callback) => {
  const sql = `DELETE FROM DriverAssignment WHERE assignmentID = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return callback(err);
    if (result.affectedRows === 0) return callback(new Error('Không tìm thấy phân công để xóa'));
    callback(null, result);
  });
};