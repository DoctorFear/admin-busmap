// src/server/controllers/assignmentController.js
import {
  getAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../models/assignmentModel.js';

export const getAllAssignmentsCtrl = (req, res) => {
  getAllAssignments((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const createAssignmentCtrl = (req, res) => {
  const { driverID, busID, routeID, assignmentDate } = req.body;

  if (!driverID || !busID || !assignmentDate) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: Tài xế, Xe buýt hoặc Ngày phân công' });
  }

  createAssignment(driverID, busID, routeID, assignmentDate, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Thêm phân công thành công!',
      id: result.insertId
    });
  });
};

export const updateAssignmentCtrl = (req, res) => {
  const { id } = req.params;
  const { driverID, busID, routeID, assignmentDate } = req.body;

  if (!driverID || !busID || !assignmentDate) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  updateAssignment(id, driverID, busID, routeID, assignmentDate, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Cập nhật phân công thành công!' });
  });
};

export const deleteAssignmentCtrl = (req, res) => {
  const { id } = req.params;

  deleteAssignment(id, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Xóa phân công thành công!' });
  });
};