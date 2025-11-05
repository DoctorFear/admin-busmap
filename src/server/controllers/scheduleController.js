import { getAllTrips, createTrip, updateTrip, deleteTrip, getTripsByDriverID, updateTripStatus } from "../models/tripModel.js";

export const getSchedules = (req, res) => {
  getAllTrips((err, result) => {
    if (err) return res.status(500).json({ error: "Lỗi truy vấn database" });
    res.json(result);
  });
};

export const addSchedule = (req, res) => {
  createTrip(req.body, (err, result) => {
    if (err) return res.status(500).json({ error: "Không thể thêm lịch trình" });
    res.status(201).json({ message: "Thêm lịch trình thành công", tripID: result.insertId });
  });
};

export const editSchedule = (req, res) => {
  updateTrip(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ error: "Không thể cập nhật lịch trình" });
    res.json({ message: "Cập nhật thành công" });
  });
};

export const removeSchedule = (req, res) => {
  deleteTrip(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: "Không thể xóa lịch trình" });
    res.json({ message: "Xóa thành công" });
  });
};

export const getSchedulesByDriverID = (req, res) => {
  getTripsByDriverID(req.params.driverID, (err, result) => {
    if (err) return res.status(500).json({ error: "Lỗi truy vấn database" });
    res.json(result);
  });
};

// Hàm kiểm tra trạng thái chuyến xe 
export const checkTripStatus = (req, res) => {
  const { tripID } = req.params;
  const body = req.body || {};  // trạng thái mới gửi từ frontend
  const status = body.status;
  
  const statusMessages = {
    COMPLETED: "Chuyến xe đã hoàn tất",
    RUNNING: "Chuyến xe vẫn đang diễn ra",
    PLANNED: "Chuyến xe vẫn chưa bắt đầu",
    CANCELLED: "Chuyến xe đã bị hủy",
  };

  if (!statusMessages[status]) {
    return res.status(400).json({ error: "Trạng thái chuyến xe không hợp lệ" });
  }

  // Gọi model để cập nhật trạng thái chuyến xe
  updateTripStatus(tripID, status, (err, result) => {
    if (err) {
      console.error("Lỗi khi cập nhật trạng thái chuyến xe:", err);
      return res.status(500).json({ error: "Không thể cập nhật trạng thái chuyến xe" });
    }

    const message = statusMessages[status];
    res.json({
      tripID,
      status,
      message,
      tripCompleted: status === "COMPLETED",
    });
  });
};