// lib/data_schedule.ts
export interface ScheduleItem {
  id: string;
  routeName: string;
  roads: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  days: string[];
}

export const mockSchedules: ScheduleItem[] = [
  {
    id: '1',
    routeName: 'Tuyến 1',
    roads: ['Đường Lê Lợi', 'Đường Nguyễn Huệ'],
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    startTime: '06:00',
    endTime: '18:00',
    days: ['Thứ 2', 'Thứ 3', 'Thứ 4'],
  },
  {
    id: '2',
    routeName: 'Tuyến 2',
    roads: ['Đường Hai Bà Trưng', 'Đường Đồng Khởi'],
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    startTime: '07:00',
    endTime: '17:00',
    days: ['Thứ 5', 'Thứ 6'],
  },
  {
    id: '3',
    routeName: 'Tuyến 2',
    roads: ['Đường Hai Bà Trưng', 'Đường Đồng Khởi'],
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    startTime: '07:00',
    endTime: '17:00',
    days: ['Thứ 5', 'Thứ 6'],
  },
];