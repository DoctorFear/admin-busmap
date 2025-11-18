// src/server/controllers/driverController.js
import { 
  getAllDrivers, 
  createDriver as createDriverModel, 
  updateDriver as updateDriverModel, 
  deleteDriver as deleteDriverModel 
} from '../models/driverModel.js';

/**
 * GET /api/drivers
 * Lấy danh sách tất cả tài xế (giờ có driverID để frontend dùng phân công)
 */
export const getDrivers = (req, res) => {
  getAllDrivers((err, results) => {
    if (err) {
      console.error('Lỗi lấy danh sách tài xế:', err);
      return res.status(500).json({ 
        error: 'Lỗi server khi lấy danh sách tài xế' 
      });
    }
    res.status(200).json(results);
  });
};

/**
 * POST /api/drivers
 * Thêm tài xế mới
 */
export const createDriver = (req, res) => {
  const { name, username, password, phone, license } = req.body;

  // Validate cơ bản
  if (!name || !username || !password || !phone || !license) {
    return res.status(400).json({ 
      error: 'Vui lòng điền đầy đủ thông tin tài xế!' 
    });
  }

  const data = { name, username, password, phone, license };

  createDriverModel(data, (err, result) => {
    if (err) {
      console.error('Lỗi tạo tài xế:', err);
      // Nếu username trùng → lỗi ER_DUP_ENTRY
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại!' });
      }
      return res.status(400).json({ error: err.message || 'Thêm tài xế thất bại' });
    }

    // result giờ có thể là { driverID, userID } hoặc insertId (tùy model)
    const driverID = result?.driverID || result?.insertId || null;

    res.status(201).json({ 
      message: 'Thêm tài xế thành công!', 
      driverID 
    });
  });
};

/**
 * PUT /api/drivers/:id
 * Cập nhật tài xế (id là userID)
 */
export const updateDriver = (req, res) => {
  const userId = req.params.id;
  const { name, phone, license, password } = req.body;

  if (!name || !phone || !license) {
    return res.status(400).json({ 
      error: 'Tên, số điện thoại và bằng lái là bắt buộc!' 
    });
  }

  const data = { name, phone, license, password: password || '' };

  updateDriverModel(userId, data, (err, result) => {
    if (err) {
      console.error('Lỗi cập nhật tài xế:', err);
      return res.status(400).json({ error: err.message || 'Cập nhật thất bại' });
    }
    res.status(200).json({ 
      message: 'Cập nhật tài xế thành công!' 
    });
  });
};

/**
 * DELETE /api/drivers/:id
 * Xóa tài xế (id là userID)
 */
export const deleteDriver = (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: 'Thiếu ID tài xế!' });
  }

  deleteDriverModel(userId, (err, result) => {
    if (err) {
      console.error('Lỗi xóa tài xế:', err);
      return res.status(400).json({ error: err.message || 'Xóa thất bại' });
    }

    // Nếu không xóa được dòng nào → có thể không tồn tại
    if (result && result.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài xế!' });
    }

    res.status(200).json({ 
      message: 'Xóa tài xế thành công!' 
    });
  });
};