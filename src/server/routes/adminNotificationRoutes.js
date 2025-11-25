import express from 'express';
import db from '../db.js';

const router = express.Router();

/**
 * POST /api/admin/send-notification
 * Gửi thông báo từ admin đến 1 hoặc nhiều parent
 * Body: { parentIDs: [int], title: string, content: string, severity?: string }
 */
router.post('/send-notification', async (req, res) => {
  try {
    const { parentIDs, title, content, severity = 'INFO' } = req.body;
    if (!Array.isArray(parentIDs) || parentIDs.length === 0 || !title || !content) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin parentIDs, title, content' });
    }
    const notificationQuery = `
      INSERT INTO Notification (toUserID, fromUserID, type, title, content, sentAt)
      VALUES (?, 1, 'INCIDENT', ?, ?, NOW())
    `;
    for (const parentID of parentIDs) {
      await db.promise().query(notificationQuery, [parentID, title, content]);
    }
    res.json({ success: true, message: `Đã gửi thông báo tới ${parentIDs.length} phụ huynh` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
