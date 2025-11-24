import {
  getAllParents,
  createParent as createParentModel,
  updateParent as updateParentModel,
  deleteParent as deleteParentModel,
  getStudentBusesByParent,
  getParentProfile,
  updateParentProfile
} from '../models/parentModel.js';

export const getParents = (req, res) => {
  getAllParents((err, results) => {
    if (err) {
      console.error('Lỗi lấy danh sách phụ huynh:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    res.status(200).json(results);
  });
};

export const createParent = (req, res) => {
  const data = req.body;
  createParentModel(data, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ message: 'Thêm phụ huynh thành công!', id: result.insertId });
  });
};

export const updateParent = (req, res) => {
  const id = req.params.id;
  const data = req.body;
  updateParentModel(id, data, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Cập nhật phụ huynh thành công!' });
  });
};

export const deleteParent = (req, res) => {
  const id = req.params.id;
  deleteParentModel(id, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Xóa phụ huynh thành công!' });
  });
};

/**
 * Lấy danh sách buses/routes mà con của parent đang đi
 * Logic: Parent -> Student -> BoardingRecord -> Trip -> Bus + Route
 */
export const getStudentBuses = (req, res) => {
  const parentId = req.params.parentId;
  
  getStudentBusesByParent(parentId, (err, results) => {
    if (err) {
      console.error(`Lỗi lấy buses của parent ${parentId}:`, err);
      return res.status(500).json({ error: 'Lỗi server khi lấy thông tin xe buýt' });
    }
    res.status(200).json(results);
  });
};

// Lấy profile của parent theo parentId
export const getProfile = (req, res) => {
  const parentId = req.params.parentId;
  
  getParentProfile(parentId, (err, result) => {
    if (err) {
      console.error(`Lỗi lấy profile parent ${parentId}:`, err);
      return res.status(500).json({ error: 'Lỗi server khi lấy thông tin profile' });
    }
    res.status(200).json(result);
  });
};

// Cập nhật profile của parent theo parentId - Thuộc trang Parent
export const updateProfile = (req, res) => {
  const parentId = req.params.parentId;
  const data = req.body;
  
  updateParentProfile(parentId, data, (err) => {
    if (err) {
      console.error(`Lỗi cập nhật profile parent ${parentId}:`, err);
      return res.status(500).json({ error: 'Lỗi server khi cập nhật profile' });
    }
    res.json({ message: 'Cập nhật thông tin thành công!' });
  });
};