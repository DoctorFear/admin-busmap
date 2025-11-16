// src/server/controllers/assignmentController.js
import { getAllAssignments, createAssignment, updateAssignment, deleteAssignment } from '../models/assignmentModel.js';

export const getAllAssignmentsCtrl = (req, res) => {
  getAllAssignments((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

export const createAssignmentCtrl = (req, res) => {
  const { driverID, busID, routeID } = req.body;
  createAssignment(driverID, busID, routeID, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Thêm phân công thành công!', id: result.insertId });
  });
};

export const updateAssignmentCtrl = (req, res) => {
  const { id } = req.params;
  const { driverID, busID, routeID } = req.body;
  updateAssignment(id, driverID, busID, routeID, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cập nhật thành công!' });
  });
};

export const deleteAssignmentCtrl = (req, res) => {
  const { id } = req.params;
  deleteAssignment(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Xóa thành công!' });
  });
};