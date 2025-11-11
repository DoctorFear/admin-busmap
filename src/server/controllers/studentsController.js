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

// Hàm lấy thời gian hiện tại (YYYY-MM-DD HH:mm:ss)
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

  // Kiểm tra dữ liệu đầu vào
  if (!status) {
    return res.status(400).json({ error: "Thiếu trạng thái cần cập nhật" });
  }

  const datetime = getCurrentDatetime();

  // Lấy tripID tương ứng với học sinh trong ngày hiện tại
  getTripIDByStudent(studentID, (err, rows) => {
    if (err || !rows.length) {
      return res.status(500).json({ error: "Không tìm thấy chuyến cho học sinh này" });
    }

    const tripID = rows[0].tripID;

    // Kiểm tra trạng thái hiện tại của chuyến
    getTripStatus(tripID, (err, statusRows) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi kiểm tra trạng thái trip" });
      }

      const currentTripStatus = statusRows.length > 0 ? statusRows[0].status : null;

      // Hàm xử lý cập nhật học sinh và kiểm tra hoàn thành
      const processStudentUpdate = () => {
        updateStudentStatus(studentID, tripID, status, datetime, (err) => {
          if (err) {
            return res.status(500).json({ error: "Không thể cập nhật trạng thái học sinh" });
          }

          // Sau khi cập nhật học sinh -> kiểm tra xem tất cả học sinh trong chuyến đã được trả/vắng chưa
          checkTripCompletion(tripID, (err, rows) => {
            if (err) {
              return res.status(500).json({ error: "Lỗi kiểm tra hoàn thành chuyến" });
            }

            const total = Number(rows[0].total) || 0;
            const doneCount = Number(rows[0].doneCount) || 0;
            const isCompleted = total > 0 && doneCount === total;

            if (isCompleted) {
              // Nếu tất cả học sinh đã được trả/vắng mặt => cập nhật Trip sang COMPLETED
              updateTripStatusWithTime(tripID, 'COMPLETED', datetime, (err) => {
                if (err) {
                  return res.status(500).json({ error: "Không thể cập nhật trạng thái chuyến sang COMPLETED" });
                }

                return res.json({
                  message: "Cập nhật thành công - chuyến xe đã hoàn thành",
                  tripCompleted: true
                });
              });
            } else {
              // Nếu chưa hoàn thành toàn bộ học sinh
              return res.json({
                message: "Cập nhật trạng thái học sinh thành công",
                tripCompleted: false
              });
            }
          });
        });
      };

      // Nếu chuyến vẫn đang ở trạng thái PLANNED thì chuyển sang RUNNING trước
      if (currentTripStatus === 'PLANNED') {
        updateTripStatusWithTime(tripID, 'RUNNING', datetime, (err) => {
          if (err) {
            return res.status(500).json({ error: "Không thể chuyển trạng thái chuyến sang RUNNING" });
          }
          processStudentUpdate();
        });
      } else {
        // Nếu chuyến đã RUNNING hoặc COMPLETED thì chỉ cần cập nhật học sinh
        processStudentUpdate();
      }
    });
  });
};
