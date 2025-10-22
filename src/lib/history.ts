export type HistoryItem = {
  id: string;
  date: string;
  route: string;
  time: string;
  activity: string;
};

export const historyData: HistoryItem[] = [
  { id: 'h1', date: '2025-09-20', route: 'Tuyến A', time: '6:30 AM - 8:00 AM', activity: 'Đón tại điểm A' },
  { id: 'h2', date: '2025-09-20', route: 'Tuyến B', time: '7:00 AM - 8:30 AM', activity: 'Trả tại điểm B' },
  { id: 'h3', date: '2025-09-20', route: 'Tuyến A', time: '6:30 AM - 8:00 AM', activity: 'Đón tại điểm B' },
  { id: 'h4', date: '2025-09-20', route: 'Tuyến B', time: '7:00 AM - 8:30 AM', activity: 'Trả tại điểm trường ABC' },
  { id: 'h5', date: '2025-09-20', route: 'Tuyến A', time: '6:30 AM - 8:00 AM', activity: 'Đón tại điểm BB' },
  { id: 'h6', date: '2025-09-20', route: 'Tuyến B', time: '7:00 AM - 8:30 AM', activity: 'Trả tại điểm A' },
];
