// src/server/models/parentModel.js
import db from '../db.js';

export const getAllParents = (callback) => {
  const sql = `
    SELECT 
      u.userID,
      u.fullName AS name,
      u.username,
      u.passwordHash AS password,
      u.phone,
      s.fullName AS studentName,
      p.address
    FROM Users u
    JOIN Student s ON s.parentUserID = u.userID
    JOIN Parent p ON p.parentID = u.userID
    WHERE u.role = 'parent'
    ORDER BY u.fullName
  `;

  db.query(sql, (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};

// CREATE → Lưu mật khẩu dạng text
export const createParent = (data, callback) => {
  const { name, studentName, address, phone, username, password } = data;

  const sqlUser = `INSERT INTO Users (fullName, username, passwordHash, phone, role) VALUES (?, ?, ?, ?, 'parent')`;
  db.query(sqlUser, [name, username, password, phone], (err, result) => {
    if (err) return callback(err);

    const userId = result.insertId;

    const sqlParent = `INSERT INTO Parent (parentID, address) VALUES (?, ?)`;
    const sqlStudent = `INSERT INTO Student (fullName, parentUserID) VALUES (?, ?)`;

    db.query(sqlParent, [userId, address], (err) => {
      if (err) return callback(err);
      db.query(sqlStudent, [studentName, userId], (err) => {
        callback(err, result);
      });
    });
  });
};

// UPDATE → Chỉ đổi mật khẩu nếu nhập mới
export const updateParent = (id, data, callback) => {
  const { name, studentName, address, phone, password } = data;

  let sql = `UPDATE Users SET fullName = ?, phone = ?`;
  let params = [name, phone];

  // Nếu có nhập mật khẩu mới → cập nhật cả passwordHash (lưu dạng text)
  if (password && password.trim() !== '') {
    sql += `, passwordHash = ?`;
    params.push(password);
  }

  sql += ` WHERE userID = ?`;
  params.push(id);

  db.query(sql, params, (err) => {
    if (err) return callback(err);

    db.query(`UPDATE Parent SET address = ? WHERE parentID = ?`, [address, id], (err) => {
      if (err) return callback(err);

      db.query(`UPDATE Student SET fullName = ? WHERE parentUserID = ?`, [studentName, id], (err) => {
        callback(err);
      });
    });
  });
};

export const deleteParent = (id, callback) => {
  db.query(`DELETE FROM Users WHERE userID = ? AND role = 'parent'`, [id], callback);
};

/**
 * Lấy danh sách buses/routes mà con của parent đang đi
 * 
 * Logic: 
 * 1. Parent (parentUserID) -> Student (studentID) [1:1 relationship]
 * 2. Student -> BoardingRecord -> Trip (tripID)
 * 3. Trip -> Bus (busID) + Route (routeID)
 * 4. Chỉ lấy trips đang RUNNING hoặc PLANNED (không lấy COMPLETED/CANCELLED)
 * 5. Chỉ lấy trips hôm nay (tripDate = CURDATE())
 * 6. Trả về thông tin: busID, licensePlate, routeID, routeName, tripStatus
 */
export const getStudentBusesByParent = (parentId, callback) => {
  const sql = `
    SELECT DISTINCT
      b.busID,
      b.licensePlate,
      b.capacity,
      b.model,
      b.status AS busStatus,
      r.routeID,
      r.routeName,
      r.description AS routeDescription,
      r.estimatedTime,
      t.tripID,
      t.tripDate,
      t.startTime,
      t.endTime,
      t.status AS tripStatus,
      s.studentID,
      s.fullName AS studentName,
      br.status AS boardingStatus
    FROM Student s
    INNER JOIN BoardingRecord br ON s.studentID = br.studentID
    INNER JOIN Trip t ON br.tripID = t.tripID
    INNER JOIN Bus b ON t.assignedBusID = b.busID
    INNER JOIN Route r ON t.routeID = r.routeID
    WHERE s.parentUserID = ?
      AND t.status IN ('PLANNED', 'RUNNING')
      AND t.tripDate = CURDATE()
    ORDER BY t.startTime
    LIMIT 1
  `;
  
  db.query(sql, [parentId], (err, results) => {
    if (err) return callback(err, null);
    callback(null, results);
  });
};