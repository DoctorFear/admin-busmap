import express from 'express';
import db from '../db.js';

const router = express.Router();

/**
 * GET /api/notifications/users/:role
 * Get all users by role (parent, driver)
 */
router.get('/users/:role', (req, res) => {
  try {
    const { role } = req.params;
    
    const validRoles = ['parent', 'driver', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role không hợp lệ'
      });
    }

    const query = `
      SELECT userID, fullName, email, phone, role
      FROM Users
      WHERE role = ?
      ORDER BY fullName
    `;

    db.query(query, [role], (err, users) => {
      if (err) {
        console.error('Get users error:', err);
        return res.status(500).json({
          success: false,
          message: 'Lỗi server: ' + err.message
        });
      }

      res.json({
        success: true,
        data: users,
        count: users.length
      });
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

/**
 * GET /api/notifications/:userID
 * Get all notifications for a user
 */
router.get('/:userID', (req, res) => {
  try {
    const { userID } = req.params;

    const query = `
      SELECT 
        notificationID,
        toUserID,
        fromUserID,
        type,
        title,
        content,
        sentAt,
        readAt,
        createdAt
      FROM Notification
      WHERE toUserID = ?
      ORDER BY sentAt DESC
      LIMIT 100
    `;

    db.query(query, [userID], (err, notifications) => {
      if (err) {
        console.error('Get notifications error:', err);
        return res.status(500).json({
          success: false,
          message: 'Lỗi server: ' + err.message
        });
      }

      res.json({
        success: true,
        data: notifications,
        count: notifications.length
      });
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

/**
 * PUT /api/notifications/:notificationID/read
 * Mark notification as read
 */
router.put('/:notificationID/read', (req, res) => {
  try {
    const { notificationID } = req.params;

    const query = `
      UPDATE Notification
      SET readAt = NOW()
      WHERE notificationID = ? AND readAt IS NULL
    `;

    db.query(query, [notificationID], (err, result) => {
      if (err) {
        console.error('Mark as read error:', err);
        return res.status(500).json({
          success: false,
          message: 'Lỗi server: ' + err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông báo hoặc đã đánh dấu rồi'
        });
      }

      res.json({
        success: true,
        message: 'Đã đánh dấu thông báo là đã đọc',
        data: { notificationID, readAt: new Date() }
      });
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

/**
 * POST /api/notifications/send
 * Send notification to user(s)
 */
router.post('/send', (req, res) => {
  try {
    const { toUserID, fromUserID, type, title, content } = req.body;

    if (!toUserID || !content) {
      return res.status(400).json({
        success: false,
        message: 'Cần cung cấp toUserID và content'
      });
    }

    const validTypes = ['ARRIVAL', 'PICKUP', 'INCIDENT', 'SYSTEM', 'REMINDER'];
    const finalType = validTypes.includes(type) ? type : 'SYSTEM';

    const query = `
      INSERT INTO Notification (toUserID, fromUserID, type, title, content, sentAt, createdAt)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    db.query(query, [toUserID, fromUserID || null, finalType, title || null, content], (err, result) => {
      if (err) {
        console.error('Send notification error:', err);
        return res.status(500).json({
          success: false,
          message: 'Lỗi server: ' + err.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Thông báo đã được gửi',
        data: {
          notificationID: result.insertId,
          toUserID,
          type: finalType,
          sentAt: new Date()
        }
      });
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

/**
 * GET /api/notifications/unread/:userID
 * Get unread notification count for a user
 */
router.get('/unread/:userID', (req, res) => {
  try {
    const { userID } = req.params;

    const query = `
      SELECT COUNT(*) as unreadCount
      FROM Notification
      WHERE toUserID = ? AND readAt IS NULL
    `;

    db.query(query, [userID], (err, result) => {
      if (err) {
        console.error('Get unread count error:', err);
        return res.status(500).json({
          success: false,
          message: 'Lỗi server: ' + err.message
        });
      }

      res.json({
        success: true,
        unreadCount: result[0].unreadCount
      });
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  }
});

export default router;
