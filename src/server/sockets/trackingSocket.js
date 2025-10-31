// trackingSocket.js
import db from '../db.js';

export default function initTrackingSocket(io) {
  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);

    // Lắng nghe khi client gửi vị trí xe buýt
    socket.on('busLocation', (data) => {
      // data = { busID, lat, lng, speed?, heading? }
      console.log('📍 Nhận vị trí mới:', data);

      // Phát lại cho tất cả client khác (admin, phụ huynh,...)
      io.emit('updateBusLocation', data);

      // --- (Optional) Ghi vị trí vào DB ---
      // const { busID, lat, lng, speed = 0, heading = 0 } = data;
      // if (busID && lat && lng) {
      //   const sql = `
      //     INSERT INTO VehicleLocation (busID, lat, lng, speed, heading)
      //     VALUES (?, ?, ?, ?, ?)
      //   `;
      //   db.query(sql, [busID, lat, lng, speed, heading], (err) => {
      //     if (err) console.error('❌ Lỗi ghi VehicleLocation:', err);
      //   });
      // }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });
}
