import { 
  getStudentsByDriverID, 
  getTripIDByStudent,
  updateStudentStatus,
  checkTripCompletion
} from "../models/studentsModel.js";

import { 
  getTripStatus,
  updateTripStatusWithTime 
} from "../models/tripModel.js";

// Lấy danh sách học sinh theo tài xế
export const getStudentsByDriver = (req, res) => {
  getStudentsByDriverID(req.params.driverID, (err, students) => {
    if (err) return res.status(500).json({ error: "Lỗi truy vấn database" });
    
    if (students.length === 0) {
      return res.json({ 
        allCompleted: true, 
        message: "Đã hoàn thành tất cả chuyến trong ngày",
        students: [] 
      });
    }
    
    res.json(students);
  });
};

// Hàm tạo datetime hiện tại định dạng MySQL
const getCurrentDatetime = () => {
  const now = new Date();
  return now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');
};

// Cập nhật trạng thái học sinh
export const updateStudentStatusController = (req, res) => {
  const { studentID } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Thiếu trạng thái cần cập nhật" });
  }

  const datetime = getCurrentDatetime();

  getTripIDByStudent(studentID, (err, rows) => {
    if (err || !rows.length) {
      return res.status(500).json({ error: "Không tìm thấy chuyến cho học sinh này" });
    }

    const tripID = rows[0].tripID;

    // Tự động chuyển Trip sang RUNNING nếu đang PLANNED
    getTripStatus(tripID, (err, statusRows) => {
      if (!err && statusRows.length > 0 && statusRows[0].status === 'PLANNED') {
        updateTripStatusWithTime(tripID, 'RUNNING', datetime, (err) => {
          if (!err) console.log(`Tự động chuyển Trip ${tripID} sang RUNNING`);
        });
      }

      // Cập nhật trạng thái học sinh
      updateStudentStatus(studentID, tripID, status, datetime, (err) => {
        if (err) {
          return res.status(500).json({ error: "Không thể cập nhật trạng thái" });
        }
        // Kiểm tra xem chuyến đã hoàn thành chưa
        checkTripCompletion(tripID, (err, rows) => {
          if (err) return res.status(500).json({ error: "Lỗi kiểm tra hoàn thành" });

          const { total, doneCount } = rows[0];
          const isCompleted = total === doneCount;

          console.log(`Trip ${tripID}: ${doneCount}/${total} học sinh đã trả/vắng`);

          if (isCompleted) {
            // Cập nhật Trip sang COMPLETED
            updateTripStatusWithTime(tripID, 'COMPLETED', datetime, (err) => {
              if (err) {
                return res.status(500).json({ error: "Không thể hoàn thành chuyến" });
              }
              
              res.json({
                message: "Chuyến xe đã hoàn thành",
                tripCompleted: true
              });
            });
          } else {
            res.json({
              message: "Cập nhật trạng thái thành công",
              tripCompleted: false
            });
          }
        });
      });
    });
  });
};