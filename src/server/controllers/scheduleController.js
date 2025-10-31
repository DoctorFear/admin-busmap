import { getAllTrips, createTrip, updateTrip, deleteTrip } from "../models/tripModel.js";

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
