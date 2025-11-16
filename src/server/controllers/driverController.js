// src/server/controllers/driverController.js
import { 
  getAllDrivers, 
  createDriver as createDriverModel, 
  updateDriver as updateDriverModel, 
  deleteDriver as deleteDriverModel 
} from '../models/driverModel.js';

export const getDrivers = (req, res) => {
  getAllDrivers((err, results) => {
    if (err) {
      console.error('Lỗi lấy danh sách tài xế:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    res.status(200).json(results);
  });
};

export const createDriver = (req, res) => {
  const data = req.body;
  createDriverModel(data, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ message: 'Thêm tài xế thành công!', id: result.insertId });
  });
};

export const updateDriver = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  updateDriverModel(id, data, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Cập nhật tài xế thành công!' });
  });
};

export const deleteDriver = (req, res) => {
  const id = req.params.id;
  deleteDriverModel(id, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Xóa tài xế thành công!' });
  });
};
