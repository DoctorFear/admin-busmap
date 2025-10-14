export interface OverviewItem {
  id: string;
  student: string;
  driver: string;
  bus: string;
  route: string;
  status: 'Chờ đón' | 'Đang trên xe' | 'Đã trả' | 'Vắng mặt' | 'Sự cố';
}

export interface DriverStudent {
  id: string;
  name: string;
  pickupLocation: string;
  status: 'chua-don' | 'da-don' | 'dang-tren-xe' | 'da-tra' | 'vang-mat' | 'su-co';
}

export interface ScheduleItem {
  date: string;
  route: string;
  time: string;
}

export const driverStudents: DriverStudent[] = [
  { id: '1', name: 'Nguyễn Văn An', pickupLocation: '123 Đường Lê Lợi', status: 'chua-don' },
  { id: '2', name: 'Trần Thị Bình', pickupLocation: '456 Đường Nguyễn Huệ', status: 'da-don' },
  { id: '3', name: 'Lê Văn Cường', pickupLocation: '789 Đường Trần Hưng Đạo', status: 'vang-mat' },
];

export const weeklySchedule: ScheduleItem[] = [
  { date: '20/09/2025', route: 'Tuyến A', time: '6:30 AM - 8:00 AM' },
  { date: '21/09/2025', route: 'Tuyến A', time: '6:30 AM - 8:00 AM' },
];

export const overviewData: OverviewItem[] = [
  { id: '1', student: 'Nguyễn Văn An', driver: 'Trần Văn A', bus: 'Xe 01', route: 'Tuyến A', status: 'Chờ đón' },
  { id: '2', student: 'Trần Thị Bình', driver: 'Nguyễn Văn B', bus: 'Xe 02', route: 'Tuyến B', status: 'Đang trên xe' },
  { id: '3', student: 'Lê Thị Cẩm', driver: 'Phạm Văn C', bus: 'Xe 03', route: 'Tuyến C', status: 'Đã trả' },
  { id: '4', student: 'Hoàng Văn Định', driver: 'Trần Văn D', bus: 'Xe 04', route: 'Tuyến D', status: 'Vắng mặt' },
  { id: '5', student: 'Phan Thị E', driver: 'Nguyễn Văn E', bus: 'Xe 05', route: 'Tuyến E', status: 'Sự cố' },
  { id: '6', student: 'Nguyễn Văn An', driver: 'Trần Văn A', bus: 'Xe 01', route: 'Tuyến A', status: 'Đang trên xe' },
  { id: '7', student: 'Trần Thị Bình', driver: 'Nguyễn Văn B', bus: 'Xe 02', route: 'Tuyến B', status: 'Đã trả' },
  { id: '8', student: 'Lê Thị Cẩm', driver: 'Phạm Văn C', bus: 'Xe 03', route: 'Tuyến C', status: 'Chờ đón' },
  { id: '9', student: 'Hoàng Văn Định', driver: 'Trần Văn D', bus: 'Xe 04', route: 'Tuyến D', status: 'Đang trên xe' },
  { id: '10', student: 'Phan Thị E', driver: 'Nguyễn Văn E', bus: 'Xe 05', route: 'Tuyến E', status: 'Chờ đón' },
  { id: '11', student: 'Nguyễn Văn An', driver: 'Trần Văn A', bus: 'Xe 01', route: 'Tuyến A', status: 'Đang trên xe' },
  { id: '12', student: 'Trần Thị Bình', driver: 'Nguyễn Văn B', bus: 'Xe 02', route: 'Tuyến B', status: 'Đã trả' },
  { id: '13', student: 'Lê Thị Cẩm', driver: 'Phạm Văn C', bus: 'Xe 03', route: 'Tuyến C', status: 'Chờ đón' },
  { id: '14', student: 'Hoàng Văn Định', driver: 'Trần Văn D', bus: 'Xe 04', route: 'Tuyến D', status: 'Đang trên xe' },
  { id: '15', student: 'Phan Thị E', driver: 'Nguyễn Văn E', bus: 'Xe 05', route: 'Tuyến E', status: 'Chờ đón' },
  { id: '16', student: 'Trần Thị Bình', driver: 'Nguyễn Văn B', bus: 'Xe 02', route: 'Tuyến B', status: 'Đã trả' },
  { id: '17', student: 'Lê Thị Cẩm', driver: 'Phạm Văn C', bus: 'Xe 03', route: 'Tuyến C', status: 'Chờ đón' },
  { id: '18', student: 'Hoàng Văn Định', driver: 'Trần Văn D', bus: 'Xe 04', route: 'Tuyến D', status: 'Đang trên xe' },
  { id: '19', student: 'Phan Thị E', driver: 'Nguyễn Văn E', bus: 'Xe 05', route: 'Tuyến E', status: 'Chờ đón' },
];