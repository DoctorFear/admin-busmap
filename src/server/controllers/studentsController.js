import { getStudentsByDriverID, updateStudentStatusModel } from "../models/studentsModel.js";

// SỬA ĐỔI: Lấy danh sách học sinh theo tài xế (xử lý trường hợp allCompleted)
export const getStudentsByDriver = (req, res) => {
  getStudentsByDriverID(req.params.driverID, (err, result) => {
    if (err) return res.status(500).json({ error: "Lỗi truy vấn database" });
    
    // THÊM MỚI: Trả về thông báo nếu đã hoàn thành tất cả
    if (result.allCompleted) {
      return res.json({ 
        allCompleted: true, 
        message: "Đã hoàn thành tất cả chuyến trong ngày",
        students: [] 
      });
    }
    
    res.json(result.students);
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
    if (err) {
      console.error("Lỗi cập nhật:", err);
      return res.status(500).json({
        error: "Không thể cập nhật trạng thái",
        detail: err.message,
      });
    }

    res.json({
      message: "Cập nhật trạng thái thành công",
      tripCompleted: result.tripCompleted || false,
    });
  });
};