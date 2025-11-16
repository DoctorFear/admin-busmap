// src/server/models/assignmentModel.js
import db from '../db.js';

// src/server/models/assignmentModel.js

export const getAllAssignments = (callback) => {
  const sql = `
    SELECT 
      da.assignmentID AS id,
      da.driverID,
      d.fullName AS driverName,           -- <<< ĐẢM BẢO DÙNG fullName, KHÔNG PHẢI name
      da.busID,
      b.licensePlate AS busName,
      da.routeID,
      r.routeName AS routeName,
      DATE(da.assignmentDate) AS assignmentDate
    FROM DriverAssignment da
    JOIN Driver d ON da.driverID = d.driverID
    JOIN Bus b ON da.busID = b.busID
    JOIN Route r ON da.routeID = r.routeID
    ORDER BY da.assignmentDate DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Lỗi query assignments:', err);
      return callback(err, null);
    }
    callback(null, results);
  });
};

// Các hàm khác giữ nguyên...
export const createAssignment = (driverID, busID, routeID, callback) => {
  db.query(
    'INSERT INTO DriverAssignment (driverID, busID, routeID, assignmentDate) VALUES (?, ?, ?, CURDATE())',
    [driverID, busID, routeID],
    callback
  );
};

export const updateAssignment = (id, driverID, busID, routeID, callback) => {
  db.query(
    'UPDATE DriverAssignment SET driverID = ?, busID = ?, routeID = ? WHERE assignmentID = ?',
    [driverID, busID, routeID, id],
    callback
  );
};

export const deleteAssignment = (id, callback) => {
  db.query('DELETE FROM DriverAssignment WHERE assignmentID = ?', [id], callback);
};