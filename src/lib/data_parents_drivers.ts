// lib/data_parents_drivers.ts
export interface Parent {
  id: string;
  name: string;
  studentName: string;
  phone: string;
  username: string;
  password: string;
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
  username: string;  // Vẫn có username
  password: string;
}

export const mockParents: Parent[] = [
  { id: '1', name: 'Nguyễn Thị Lan', studentName: 'Nguyễn Minh Anh', phone: '0901234567', username: 'ph_lan', password: '123456' },
  { id: '2', name: 'Trần Văn Hùng', studentName: 'Trần Bảo Ngọc', phone: '0912345678', username: 'ph_hung', password: '654321' },
];

export const mockDrivers: Driver[] = [
  { id: '1', name: 'Lê Văn Tài', license: 'B2-123456', phone: '0923456789', username: 'tai_le', password: 'driver123' },
  { id: '2', name: 'Phạm Thị Mai', license: 'B2-789012', phone: '0934567890', username: 'mai_pham', password: 'driver456' },
];