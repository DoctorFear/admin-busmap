export interface AssignmentItem {
  id: string;
  driver: string;
  bus: string;
  route: string;
  startTime: string;
}

export const mockDrivers = [
  'Nguyễn Văn A',
  'Trần Thị B',
  'Lê Văn C',
  'Phạm Thị D',
];

export const mockBuses = [
  'Xe 01 - 29A-12345',
  'Xe 02 - 29B-67890',
  'Xe 03 - 29C-54321',
  'Xe 04 - 29D-09876',
];

export const mockRoutes = [
  'Tuyến 1 - Quận 1',
  'Tuyến 2 - Quận 7',
  'Tuyến 3 - Quận 3',
  'Tuyến 4 - Bình Thạnh',
];

export const mockAssignments: AssignmentItem[] = [
  {
    id: '1',
    driver: 'Nguyễn Văn A',
    bus: 'Xe 01 - 29A-12345',
    route: 'Tuyến 1 - Quận 1',
    startTime: '07:00',
  },
  {
    id: '2',
    driver: 'Trần Thị B',
    bus: 'Xe 02 - 29B-67890',
    route: 'Tuyến 2 - Quận 7',
    startTime: '08:00',
  },
];