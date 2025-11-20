import express from 'express';
import db from '../db.js';

const router = express.Router();

/**
 * POST /api/driver-alerts/send
 * Send an alert from driver to all parents of students on that trip
 * 
 * Request body:
 * {
 *   "driverID": 1,
 *   "tripID": 5,
 *   "alertType": "ENGINE_BREAKDOWN | ACCIDENT | TRAFFIC | DELAY | OTHER",
 *   "message": "Xe hỏng, chờ sửa chữa",
 *   "severity": "INFO | WARNING | CRITICAL"
 * }
 */
router.post('/send', async (req, res) => {
  try {
    const { driverID, tripID, alertType, message, description, severity = 'WARNING' } = req.body;
    
    // Chấp nhận cả message và description
    const alertMessage = message || description;

    // Validate severity is valid ENUM
    const validSeverities = ['INFO', 'WARNING', 'CRITICAL'];
    const finalSeverity = validSeverities.includes(severity) ? severity : 'WARNING';

    // Validate input
    if (!driverID || !tripID || !alertMessage) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin: driverID, tripID, message (hoặc description)'
      });
    }

    // Step 1: Get all students on this trip (via BoardingRecord)
    const studentsQuery = `
      SELECT DISTINCT s.studentID, s.parentUserID, u.email, u.phone, u.fullName
      FROM BoardingRecord br
      JOIN Student s ON br.studentID = s.studentID
      JOIN Users u ON s.parentUserID = u.userID
      WHERE br.tripID = ? AND s.parentUserID IS NOT NULL
    `;

    const [parentUsers] = await db.promise().query(studentsQuery, [tripID]);

    if (parentUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học sinh nào trên chuyến xe này'
      });
    }

    // Step 2: Create Alert record in database
    const alertQuery = `
      INSERT INTO Alert (tripID, driverID, severity, description, createdAt)
      VALUES (?, ?, ?, ?, NOW())
    `;

    const [alertResult] = await db.promise().query(alertQuery, [tripID, driverID, finalSeverity, alertMessage]);
    const alertID = alertResult.insertId;

    // Step 3: Create Notification records for each parent
    const notifications = [];
    const notificationQuery = `
      INSERT INTO Notification (toUserID, fromUserID, type, title, content, sentAt)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    for (const parent of parentUsers) {
      const notificationTitle = getAlertTitle(alertType);
      const notificationContent = `Cảnh báo từ tài xế: ${alertMessage}\nChuyến xe: ${tripID}\nMức độ: ${severity}`;

      await db.promise().query(notificationQuery, [
        parent.parentUserID,
        driverID,
        'INCIDENT',
        notificationTitle,
        notificationContent
      ]);

      notifications.push({
        parentUserID: parent.parentUserID,
        parentName: parent.fullName,
        email: parent.email,
        phone: parent.phone
      });
    }

    // Response
    return res.status(200).json({
      success: true,
      message: `Cảnh báo đã gửi tới ${notifications.length} phụ huynh`,
      data: {
        alertID,
        notificationCount: notifications.length,
        notifications
      }
    });

  } catch (error) {
    console.error('Alert Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

/**
 * GET /api/driver-alerts/my-trips/:driverID
 * Get all trips assigned to a driver with student count
 */
router.get('/my-trips/:driverID', (req, res) => {
  const { driverID } = req.params;

  const query = `
    SELECT 
      t.tripID,
      t.routeID,
      t.tripDate,
      t.startTime,
      t.endTime,
      t.status,
      r.routeName,
      COUNT(br.studentID) as studentCount,
      GROUP_CONCAT(DISTINCT s.fullName) as studentNames
    FROM Trip t
    LEFT JOIN Route r ON t.routeID = r.routeID
    LEFT JOIN BoardingRecord br ON t.tripID = br.tripID
    LEFT JOIN Student s ON br.studentID = s.studentID
    WHERE t.assignedDriverID = ? AND t.tripDate >= CURDATE()
    GROUP BY t.tripID
    ORDER BY t.tripDate DESC, t.startTime DESC
  `;

  db.query(query, [driverID], (err, trips) => {
    if (err) {
      console.error('Error fetching trips:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách chuyến xe',
        error: err.message
      });
    }

    res.json({
      success: true,
      data: trips
    });
  });
});

/**
 * GET /api/driver-alerts/trip-students/:tripID
 * Get all students (and their parents) on a specific trip
 */
router.get('/trip-students/:tripID', (req, res) => {
  const { tripID } = req.params;

  const query = `
    SELECT 
      s.studentID,
      s.fullName as studentName,
      s.grade,
      s.schoolName,
      p.parentUserID,
      u.fullName as parentName,
      u.email,
      u.phone,
      br.status as boardingStatus
    FROM BoardingRecord br
    JOIN Student s ON br.studentID = s.studentID
    JOIN Parent p ON s.parentUserID = p.parentID
    JOIN Users u ON p.parentID = u.userID
    WHERE br.tripID = ?
    ORDER BY s.fullName
  `;

  db.query(query, [tripID], (err, students) => {
    if (err) {
      console.error('Error fetching trip students:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách học sinh trên chuyến xe',
        error: err.message
      });
    }

    res.json({
      success: true,
      tripID,
      studentCount: students.length,
      data: students
    });
  });
});

/**
 * PUT /api/driver-alerts/resolve/:alertID
 * Resolve/close an alert
 */
router.put('/resolve/:alertID', async (req, res) => {
  try {
    const { alertID } = req.params;
    const { resolvedBy } = req.body;

    if (!resolvedBy) {
      return res.status(400).json({
        success: false,
        message: 'Cần cung cấp ID người giải quyết (resolvedBy)'
      });
    }

    const query = `
      UPDATE Alert
      SET resolvedAt = NOW(), resolvedBy = ?
      WHERE alertID = ?
    `;

    const [result] = await db.promise().query(query, [resolvedBy, alertID]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy cảnh báo'
      });
    }

    res.json({
      success: true,
      message: 'Cảnh báo đã được đánh dấu là đã giải quyết',
      data: { alertID, resolvedAt: new Date(), resolvedBy }
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

/**
 * GET /api/driver-alerts/history/:driverID
 * Get alert history for a driver
 */
router.get('/history/:driverID', (req, res) => {
  const { driverID } = req.params;

  const query = `
    SELECT 
      a.alertID,
      a.tripID,
      a.severity,
      a.description,
      a.createdAt,
      a.resolvedAt,
      a.resolvedBy,
      t.tripDate,
      r.routeName,
      COUNT(DISTINCT br.studentID) as affectedStudents
    FROM Alert a
    LEFT JOIN Trip t ON a.tripID = t.tripID
    LEFT JOIN Route r ON t.routeID = r.routeID
    LEFT JOIN BoardingRecord br ON t.tripID = br.tripID
    WHERE a.driverID = ?
    GROUP BY a.alertID
    ORDER BY a.createdAt DESC
    LIMIT 50
  `;

  db.query(query, [driverID], (err, alerts) => {
    if (err) {
      console.error('Error fetching alert history:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy lịch sử cảnh báo',
        error: err.message
      });
    }

    res.json({
      success: true,
      data: alerts
    });
  });
});

/**
 * Helper function to get alert title based on type
 */
function getAlertTitle(alertType) {
  const titles = {
    ENGINE_BREAKDOWN: '🚗 Xe hỏng',
    ACCIDENT: '⚠️ Tai nạn',
    TRAFFIC: '🚦 Tắc đường',
    DELAY: '⏱️ Trễ giờ',
    OTHER: '📢 Thông báo khác'
  };
  return titles[alertType] || '📢 Thông báo từ tài xế';
}

export default router;
