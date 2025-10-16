export interface Recipient {
  id: string;
  name: string;
  type: 'parent' | 'driver';
  bus?: string;
  availableDates?: string[];
}

export interface Incident {
  id: string;
  driver: string;
  bus: string;
  issue: string;
  timestamp: string;
}

export const mockParents: Recipient[] = [
  {
    id: 'p1',
    name: 'Nguyễn Thị A',
    type: 'parent',
    bus: 'Xe 01',
    availableDates: ['2025-10-16', '2025-10-17'],
  },
  {
    id: 'p2',
    name: 'Trần Văn B',
    type: 'parent',
    bus: 'Xe 02',
    availableDates: ['2025-10-16', '2025-10-18'],
  },
  // Add more for testing large lists
  {
    id: 'p3',
    name: 'Lê Thị C',
    type: 'parent',
    bus: 'Xe 01',
    availableDates: ['2025-10-16', '2025-10-17'],
  },
  {
    id: 'p4',
    name: 'Phạm Văn D',
    type: 'parent',
    bus: 'Xe 02',
    availableDates: ['2025-10-16', '2025-10-18'],
  },
];

export const mockDrivers: Recipient[] = [
  {
    id: 'd1',
    name: 'Lê Văn C',
    type: 'driver',
    availableDates: ['2025-10-16', '2025-10-17', '2025-10-18'],
  },
  {
    id: 'd2',
    name: 'Phạm Thị D',
    type: 'driver',
    availableDates: ['2025-10-16', '2025-10-18'],
  },
  // Add more for testing large lists
  {
    id: 'd3',
    name: 'Nguyễn Văn E',
    type: 'driver',
    availableDates: ['2025-10-16', '2025-10-17'],
  },
  {
    id: 'd4',
    name: 'Trần Thị F',
    type: 'driver',
    availableDates: ['2025-10-16', '2025-10-18'],
  },
];

export const mockIncidents: Incident[] = [
  {
    id: '1',
    driver: 'Lê Văn C',
    bus: 'Xe 01',
    issue: 'Kẹt xe',
    timestamp: '2025-10-16T08:00:00Z',
  },
  {
    id: '2',
    driver: 'Phạm Thị D',
    bus: 'Xe 02',
    issue: 'Hỏng xe',
    timestamp: '2025-10-16T09:00:00Z',
  },
];