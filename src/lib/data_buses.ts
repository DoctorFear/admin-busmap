// lib/data_buses.ts
export interface Bus {
  id: string;
  busNumber: string;
  driverName: string;
  route: string;
  status: 'moving' | 'stopped' | 'maintenance';
  eta: string;
  x: number; // % trên bản đồ (0-100)
  y: number;
  lat?: number; // Latitude cho Google Maps
  lng?: number; // Longitude cho Google Maps
  lastUpdate: Date;
  isTracking: boolean;
  isOnline: boolean;
  alerts: string[];
}

// export const mockBuses: Bus[] = [
//   {
//     id: '1',
//     busNumber: '29A-12345',
//     driverName: 'Nguyễn Văn A',
//     route: 'Tuyến 1 - Quận 1',
//     status: 'moving',
//     eta: '08:30',
//     x: 25,
//     y: 35,
//     lastUpdate: new Date(),
//     isTracking: true,
//     isOnline: true,
//     alerts: ['Quá tốc độ'],
//   },
//   {
//     id: '2',
//     busNumber: '29B-67890',
//     driverName: 'Trần Thị B',
//     route: 'Tuyến 2 - Quận 7',
//     status: 'stopped',
//     eta: '09:15',
//     x: 75,
//     y: 65,
//     lastUpdate: new Date(Date.now() - 60000),
//     isTracking: true,
//     isOnline: true,
//     alerts: [],
//   },
//   {
//     id: '3',
//     busNumber: '29C-54321',
//     driverName: 'Lê Văn C',
//     route: 'Tuyến 3 - Quận 3',
//     status: 'moving',
//     eta: '08:45',
//     x: 50,
//     y: 20,
//     lastUpdate: new Date(),
//     isTracking: true,
//     isOnline: true,
//     alerts: ['Lệch tuyến'],
//   },
// ];

// // Cập nhật vị trí giả lập
// export const updateBusPosition = (bus: Bus): Bus => {
//   const dx = (Math.random() - 0.5) * 4;
//   const dy = (Math.random() - 0.5) * 4;
//   const newX = Math.max(10, Math.min(90, bus.x + dx));
//   const newY = Math.max(10, Math.min(90, bus.y + dy));

//   const isOnline = Math.random() > 0.08; // 8% mất tín hiệu

//   return {
//     ...bus,
//     x: newX,
//     y: newY,
//     lastUpdate: new Date(),
//     status: Math.random() > 0.93 ? 'stopped' : bus.status,
//     isOnline,
//   };
// };