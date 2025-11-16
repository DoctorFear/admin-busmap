import {
  getAllParents,
  createParent as createParentModel,
  updateParent as updateParentModel,
  deleteParent as deleteParentModel
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