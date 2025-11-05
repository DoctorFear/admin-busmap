import { getStudentsByDriverID, updateStudentStatusModel } from "../models/studentsModel.js";

// Lấy danh sách học sinh theo tài xế
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

  // Gán thời gian thực tế theo trạng thái
  let pickupTime = null;
  let dropoffTime = null;

  if (status === "da-don") {
    pickupTime = new Date();
  } else if (status === "da-tra") {
    dropoffTime = new Date();
  }

  updateStudentStatusModel(studentID, status, pickupTime, dropoffTime, (err, result) => {
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
