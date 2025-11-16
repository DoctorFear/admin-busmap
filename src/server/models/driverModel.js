// src/server/models/driverModel.js
import db from '../db.js';

export const getAllDrivers = (callback) => {
  const sql = `
    SELECT 
      u.userID,
      u.fullName AS name,
      u.username,
      u.passwordHash AS password,
      u.phone,
      d.driverLicense AS license
    FROM Users u
    JOIN Driver d ON d.userID = u.userID
    WHERE u.role = 'driver'
    ORDER BY u.fullName
  `;

  db.query(sql, (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

// CREATE → Lưu mật khẩu dạng text
export const createDriver = (data, callback) => {
  const { name, license, phone, username, password } = data;

  const sqlUser = `INSERT INTO Users (fullName, username, passwordHash, phone, role) VALUES (?, ?, ?, ?, 'driver')`;
  db.query(sqlUser, [name, username, password, phone], (err, result) => {
    if (err) return callback(err);

    const userId = result.insertId;
    const sqlDriver = `INSERT INTO Driver (userID, fullName, phoneNumber, driverLicense) VALUES (?, ?, ?, ?)`;

    db.query(sqlDriver, [userId, name, phone, license], (err) => {
      callback(err, result);
    });
  });
};

// UPDATE → Chỉ đổi mật khẩu nếu nhập mới
export const updateDriver = (id, data, callback) => {
  const { name, license, phone, password } = data;

  let sql = `UPDATE Users SET fullName = ?, phone = ?`;
  let params = [name, phone];

  if (password && password.trim() !== '') {
    sql += `, passwordHash = ?`;
    params.push(password);
  }

  sql += ` WHERE userID = ?`;
  params.push(id);

  db.query(sql, params, (err) => {
    if (err) return callback(err);

    db.query(`UPDATE Driver SET driverLicense = ?, phoneNumber = ? WHERE userID = ?`, [license, phone, id], (err) => {
      callback(err);
    });
  });
};

export const deleteDriver = (id, callback) => {
  db.query(`DELETE FROM Driver WHERE userID = ?`, [id], (err) => {
    if (err) return callback(err);
    db.query(`DELETE FROM Users WHERE userID = ? AND role = 'driver'`, [id], callback);
  });
};