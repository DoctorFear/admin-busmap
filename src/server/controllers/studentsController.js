import { getStudentsByDriverID, updateStudentStatusModel } from "../models/studentsModel.js";

export const getStudentsByDriver = (req, res) => {
  getStudentsByDriverID(req.params.driverID, (err, result) => {
    if (err) return res.status(500).json({ error: "Lỗi truy vấn database" });
    res.json(result);
  });
};

// Cập nhật trạng thái học sinh
export const updateStudentStatus = (req, res) => {
  const { studentID } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Thiếu trạng thái cần cập nhật" });
  }

  updateStudentStatusModel(studentID, status, (err, result) => {
    if (err) return res.status(500).json({ error: "Không thể cập nhật trạng thái" });
    res.json({ message: "Cập nhật thành công" });
  });
};
