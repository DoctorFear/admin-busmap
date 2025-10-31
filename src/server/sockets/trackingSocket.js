export default function initTrackingSocket(io) {
  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);

    // Nhận vị trí từ tài xế
    socket.on('busLocation', (data) => {
      console.log('- Vị trí mới:', data);
      // Phát lại cho frontend để hiển thị
      io.emit('updateBusLocation', data);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });
}
