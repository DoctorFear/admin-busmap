import { 
  getAllTrips, 
  createTrip, 
  updateTrip, 
  deleteTrip, 
  getTripsByDriverID, 
  updateTripStatusWithTime, 
  getTripStatus,
  getActiveBusAssignments 
} from "../models/tripModel.js";

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

const getCurrentDatetime = () => {
  const now = new Date();
  return now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');
};

// Hàm bắt đầu chuyến
export const startTrip = (req, res) => {
  const { tripID } = req.params;
  const datetime = getCurrentDatetime();
  
  // Kiểm tra trạng thái hiện tại
  getTripStatus(tripID, (err, rows) => {
    if (err || !rows.length) {
      return res.status(404).json({ error: "Chuyến không tồn tại" });
    }
    
    if (rows[0].status !== 'PLANNED') {
      return res.status(400).json({ error: "Chuyến đã bắt đầu hoặc đã hoàn thành" });
    }
    
    // Cập nhật sang RUNNING
    updateTripStatusWithTime(tripID, 'RUNNING', datetime, (err) => {
      if (err) {
        console.error("Lỗi bắt đầu chuyến:", err);
        return res.status(500).json({ error: "Không thể bắt đầu chuyến" });
      }
      
      res.json({ message: "Đã bắt đầu chuyến thành công", tripID });
    });
  });
};

// Cập nhật trạng thái chuyến 
export const checkTripStatus = (req, res) => {
  const { tripID } = req.params;
  const { status } = req.body || {};
  const datetime = getCurrentDatetime();
  
  const statusMessages = {
    COMPLETED: "Chuyến xe đã hoàn tất",
    RUNNING: "Chuyến xe đang chạy",
    PLANNED: "Chuyến xe đã lên lịch",
    CANCELLED: "Chuyến xe đã bị hủy",
  };

  if (!statusMessages[status]) {
    return res.status(400).json({ error: "Trạng thái không hợp lệ" });
  }

  updateTripStatusWithTime(tripID, status, datetime, (err) => {
    if (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      return res.status(500).json({ error: "Không thể cập nhật trạng thái" });
    }

    res.json({
      tripID,
      status,
      message: statusMessages[status],
      tripCompleted: status === "COMPLETED",
    });
  });
};

// ====================================================================
// LẤY DANH SÁCH BUSES ĐƯỢC ASSIGN CHO ROUTES HÔM NAY
// ====================================================================
/**
 * GET /api/trips/active-buses
 * 
 * RESPONSE:
 * {
 *   ok: true,
 *   data: [
 *     { routeID: 1, busID: 2, licensePlate: "51A-P-66560", ... },
 *     { routeID: 2, busID: 5, licensePlate: "51B-12345", ... },
 *     ...
 *   ]
 * }
 */
export const getActiveBuses = (req, res) => {
  getActiveBusAssignments((err, results) => {
    if (err) {
      console.error("[scheduleController] Lỗi khi lấy active buses:", err);
      return res.status(500).json({ 
        ok: false, 
        error: "Lỗi truy vấn database" 
      });
    }
    
    console.log(`[scheduleController] Trả về ${results.length} active bus assignments`);
    res.json({ 
      ok: true, 
      data: results 
    });
  });
};