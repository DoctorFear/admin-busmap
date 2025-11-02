import { getStudentsByDriverID } from "../models/studentsModel.js";

export const getStudentsByDriver = (req, res) => {
  getStudentsByDriverID(req.params.driverID, (err, result) => {
    if (err) return res.status(500).json({ error: "Lỗi truy vấn database" });
    res.json(result);
  });
};