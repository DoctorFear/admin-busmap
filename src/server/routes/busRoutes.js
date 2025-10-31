import express from 'express';
import db from '../db.js';

const router = express.Router();

// Lấy danh sách tất cả xe buýt
router.get('/', (req, res) => {
  db.query('SELECT * FROM Bus', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Thêm xe buýt mới
router.post('/', (req, res) => {
  const { licensePlate, capacity } = req.body;
  const sql = 'INSERT INTO Bus (licensePlate, capacity) VALUES (?, ?)';
  db.query(sql, [licensePlate, capacity], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, licensePlate, capacity });
  });
});

export default router;
