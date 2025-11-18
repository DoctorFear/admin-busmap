// src/server/controllers/overviewController.js
import { getTodayOverview } from '../models/overviewModel.js';

export const getOverview = (req, res) => {
  getTodayOverview((err, results) => {
    if (err) {
      console.error('Lỗi lấy dữ liệu tổng quan:', err);
      return res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu chuyến đi' });
    }

    if (results.length === 0) {
      return res.json([]); // Trả mảng rỗng nếu chưa có chuyến hôm nay
    }

    const mapped = results.map(item => {
      let statusVN = 'Chờ đón';
      switch (item.studentStatus) {
        case 'PICKED':   statusVN = 'Đang trên xe'; break;
        case 'DROPPED':  statusVN = 'Đã trả';       break;
        case 'ABSENT':   statusVN = 'Vắng mặt';     break;
        case 'NOT_PICKED':
        default:         statusVN = 'Chờ đón';      break;
      }

      return {
        id: `${item.studentID}-${item.tripID}`, // unique key cho React
        student: item.studentName,
        driver: item.driverName,
        bus: item.busPlate,
        route: item.routeName,
        status: statusVN
      };
    });

    res.json(mapped);
  });
};