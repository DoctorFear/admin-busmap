export interface OverviewItem {
  id: string;
  student: string;
  driver: string;
  bus: string;
  route: string;
  status: 'Chờ đón' | 'Đang trên xe' | 'Đã trả' | 'Vắng mặt' | 'Sự cố';
}

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

export type NotificationItem = {
  id: string;
  driver: string;
  bus: string;
  status: string;
  time: string;
};

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    driver: 'Trần Văn A',
    bus: 'Xe 01',
    status: 'Cách điểm đón 500m',
    time: '7:25 AM, 19/09/2025',
  },
  {
    id: 'n2',
    driver: 'Nguyễn Văn B',
    bus: 'Xe 02',
    status: 'Trễ 5 phút do kẹt xe',
    time: '7:20 AM, 19/09/2025',
  },
  {
    id: 'n3',
    driver: 'Phạm Văn C',
    bus: 'Xe 04',
    status: 'Đã đến điểm đón',
    time: '7:15 AM, 19/09/2025',
  },
  {
    id: 'n4',
    driver: 'Phạm Văn D',
    bus: 'Xe 27',
    status: 'Cách điểm đón 200m',
    time: '7:18 AM, 19/09/2025',
  },
  {
    id: 'n5',
    driver: 'Trần Văn Y',
    bus: 'Xe 41',
    status: 'Cách điểm đón 100m',
    time: '7:22 AM, 19/09/2025',
  },
];
