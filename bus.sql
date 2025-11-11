-- =================================================
-- DATABASE: SchoolBusManagement (Full)
-- Hệ thống quản lý xe buýt học sinh - bản đầy đủ
-- =================================================

CREATE DATABASE IF NOT EXISTS SchoolBusManagement
  CHARACTER SET = 'utf8mb4'
  COLLATE = 'utf8mb4_unicode_ci';
USE SchoolBusManagement;

-- ============================
-- BẢNG: Users: Lưu thông tin tài khoản (Admin / Driver / Parent)
-- ============================
CREATE TABLE Users (
  userID INT AUTO_INCREMENT PRIMARY KEY,                -- Mã người dùng (tự tăng)
  fullName VARCHAR(150) NOT NULL,                       -- Họ tên
  username VARCHAR(80) NOT NULL UNIQUE,                 -- Tên đăng nhập
  passwordHash VARCHAR(255) NOT NULL,                   -- Mật khẩu đã mã hóa
  email VARCHAR(150),                                   -- Email
  phone VARCHAR(30),                                    -- Số điện thoại
  role ENUM('admin','driver','parent') NOT NULL,        -- Vai trò (admin/driver/parent)
  languagePref VARCHAR(8) DEFAULT 'vi',                 -- Ngôn ngữ hiển thị
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,-- Ngày tạo
  updatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP   -- Ngày cập nhật
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng người dùng (Admin, Driver, Parent)';

CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_users_role ON Users(role);

-- ============================
-- BẢNG: Parent: Thông tin chi tiết phụ huynh 
-- ============================
CREATE TABLE Parent (
  parentID INT PRIMARY KEY,                             -- Khóa chính (trùng Users.userID)
  address VARCHAR(255),                                 -- Địa chỉ
  workInfo VARCHAR(255),                                -- Thông tin công việc (tuỳ chọn)
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,-- Thời gian tạo
  FOREIGN KEY (parentID) REFERENCES Users(userID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Chi tiết phụ huynh, liên kết với Users (role=parent)';

-- ============================
-- BẢNG: Driver: Thông tin chi tiết tài xế
-- ============================
CREATE TABLE Driver (
  driverID INT AUTO_INCREMENT PRIMARY KEY,          -- Mã tài xế
  userID INT NOT NULL,                              -- Liên kết tài khoản người dùng (Users.userID)
  fullName VARCHAR(100) NOT NULL,                   -- Họ tên tài xế
  phoneNumber VARCHAR(15) NOT NULL,                 -- Số điện thoại
  driverLicense VARCHAR(50) NOT NULL,               -- Giấy phép lái xe
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',-- Trạng thái
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userID) REFERENCES Users(userID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Thông tin tài xế bao gồm giấy phép lái xe và liên kết với tài khoản người dùng';

-- ============================
-- BẢNG: Student: Lưu thông tin học sinh (Mỗi HS bắt buộc gắn với 1 phụ huynh)
-- ============================
CREATE TABLE Student (
  studentID INT AUTO_INCREMENT PRIMARY KEY,             -- Mã học sinh (tự tăng)
  fullName VARCHAR(150) NOT NULL,                       -- Họ tên học sinh
  grade VARCHAR(50),                                    -- Lớp / Khối
  schoolName VARCHAR(150),                              -- Tên trường
  parentUserID INT NOT NULL,                            -- FK tới Users.userID (phụ huynh)
  photoUrl VARCHAR(500),                                -- Ảnh nhận dạng
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parentUserID) REFERENCES Users(userID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng học sinh (mỗi HS thuộc 1 phụ huynh)';

CREATE INDEX idx_student_parent ON Student(parentUserID);
CREATE INDEX idx_student_grade ON Student(grade);

-- ============================
-- BẢNG: Route: Lưu tuyến đường tổng thể
-- ============================
CREATE TABLE Route (
  routeID INT AUTO_INCREMENT PRIMARY KEY,               -- Mã tuyến
  routeName VARCHAR(150) NOT NULL,                      -- Tên tuyến
  description TEXT,                                     -- Mô tả/tổng quan tuyến
  estimatedTime INT,                                    -- Thời gian ước tính (phút)
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tuyến đường tổng thể';

-- ============================
-- BẢNG: RouteDetail: Mô tả các đoạn/điểm dọc theo tuyến (thứ tự)
-- ============================
CREATE TABLE RouteDetail (
  detailID INT AUTO_INCREMENT PRIMARY KEY,              -- Mã chi tiết
  routeID INT NOT NULL,                                 -- FK tới Route
  orderNumber INT NOT NULL,                             -- Thứ tự đường trong tuyến
  streetName VARCHAR(255) NOT NULL,                     -- Tên đường 
  note VARCHAR(255),                                    -- Ghi chú
  lat DECIMAL(10,7) NULL,                               -- Vĩ độ (nếu cần)
  lng DECIMAL(10,7) NULL,                               -- Kinh độ (nếu cần)
  FOREIGN KEY (routeID) REFERENCES Route(routeID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Chi tiết các đoạn/điểm dọc theo tuyến';

CREATE INDEX idx_routedetail_route_order ON RouteDetail(routeID, orderNumber);

-- ============================
-- BẢNG: Bus: Thông tin xe buýt
-- ============================
CREATE TABLE Bus (
  busID INT AUTO_INCREMENT PRIMARY KEY,                 -- Mã xe buýt
  licensePlate VARCHAR(30) NOT NULL UNIQUE,             -- Biển số xe
  capacity INT NOT NULL DEFAULT 0,                      -- Sức chứa (số ghế)
  model VARCHAR(120),                                   -- Mẫu xe
  status ENUM('active','maintenance','inactive') DEFAULT 'active', -- Trạng thái
  routeID INT NULL,                                     -- Tuyến hiện tại (tuỳ thời điểm)
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (routeID) REFERENCES Route(routeID)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Thông tin xe buýt';

CREATE INDEX idx_bus_status ON Bus(status);

-- ============================
-- BẢNG: BusStop: Điểm dừng thực tế (liên quan tới RouteDetail hoặc trực tiếp Route)
-- ============================
CREATE TABLE BusStop (
  busStopID INT AUTO_INCREMENT PRIMARY KEY,                -- Mã điểm dừng
  routeID INT NOT NULL,                                 -- FK tuyến
  name VARCHAR(200) NOT NULL,                           -- Tên điểm dừng
  lat DECIMAL(10,7) NULL,                               -- Vĩ độ
  lng DECIMAL(10,7) NULL,                               -- Kinh độ
  sequence INT NOT NULL,                                -- Thứ tự điểm dừng trong tuyến
  estimatedArrivalTime TIME NULL,                       -- Giờ dự kiến (tuỳ trip)
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (routeID) REFERENCES Route(routeID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_stop_route_sequence (routeID, sequence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Điểm dừng trên tuyến (thứ tự & tọa độ)';

-- ============================
-- BẢNG: Trip: Chuyến xe cụ thể theo ngày/khung giờ
-- ============================
CREATE TABLE Trip (
  tripID INT AUTO_INCREMENT PRIMARY KEY,                -- Mã chuyến
  routeID INT NOT NULL,                                 -- Tuyến
  tripDate DATE NOT NULL,                               -- Ngày chạy
  startTime TIME NULL,                                  -- Giờ bắt đầu
  endTime TIME NULL,                                    -- Giờ kết thúc
  assignedBusID INT NULL,                               -- Xe được gán cho chuyến (tại thời điểm)
  assignedDriverID INT NULL,                            -- Tài xế được gán cho chuyến
  status ENUM('PLANNED','RUNNING','COMPLETED','CANCELLED') DEFAULT 'PLANNED', -- Trạng thái
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (routeID) REFERENCES Route(routeID)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (assignedBusID) REFERENCES Bus(busID)
    ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (assignedDriverID) REFERENCES Driver(driverID)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Chuyến chạy thực tế của tuyến theo ngày';

CREATE INDEX idx_trip_route_date ON Trip(routeID, tripDate);
CREATE INDEX idx_trip_status ON Trip(status);

-- ============================
-- BẢNG: DriverAssignment - Phân công tài xế cho xe/tuyến trong ngày
-- ============================
CREATE TABLE DriverAssignment (
  assignmentID INT AUTO_INCREMENT PRIMARY KEY,          -- Mã phân công
  driverID INT NOT NULL,                                -- Tài xế (FK Driver.driverID)
  busID INT NOT NULL,                                   -- Xe (FK Bus.busID)
  routeID INT NULL,                                     -- Tuyến đường (FK Route.routeID)
  assignmentDate DATE NOT NULL,                         -- Ngày phân công (đưa & rước)
  note VARCHAR(255) NULL,                               -- Ghi chú
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Thời điểm tạo bản ghi
  FOREIGN KEY (driverID) REFERENCES Driver(driverID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (busID) REFERENCES Bus(busID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (routeID) REFERENCES Route(routeID)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Phân công tài xế cho xe và tuyến theo ngày (đưa & rước học sinh)';

CREATE INDEX idx_driverassignment_driver_date ON DriverAssignment(driverID, assignmentDate);

-- ============================
-- BẢNG: Device: Lưu thiết bị (GPS tracker trên bus hoặc app tài xế/phụ huynh)
-- ============================
CREATE TABLE Device (
  deviceID BIGINT AUTO_INCREMENT PRIMARY KEY,           -- Mã thiết bị
  busID INT NULL,                                       -- Xe gắn thiết bị (nếu có)
  userID INT NULL,                                      -- Người dùng sở hữu thiết bị (driver/parent)
  deviceType ENUM('bus_tracker','driver_app','parent_app','tablet','other') DEFAULT 'driver_app', -- Loại thiết bị
  fcmToken VARCHAR(512) NULL,                           -- Token cho Push (FCM)
  lastSeen DATETIME NULL,                               -- Lần cuối online
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (busID) REFERENCES Bus(busID)
    ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (userID) REFERENCES Users(userID)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Thiết bị (GPS tracker hoặc app trên điện thoại)';

CREATE INDEX idx_device_bus ON Device(busID);
CREATE INDEX idx_device_user ON Device(userID);

-- ============================
-- BẢNG: VehicleLocation: Lưu vị trí thời gian thực của xe (ghi nhiều bản ghi)
-- ============================
CREATE TABLE VehicleLocation (
  locationID BIGINT AUTO_INCREMENT PRIMARY KEY,         -- Mã bản ghi vị trí
  busID INT NOT NULL,                                   -- Xe gửi vị trí
  lat DECIMAL(10,7) NOT NULL,                           -- Vĩ độ
  lng DECIMAL(10,7) NOT NULL,                           -- Kinh độ
  heading FLOAT NULL,                                   -- Hướng (độ)
  speed FLOAT NULL,                                     -- Tốc độ (km/h)
  recordedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Thời điểm ghi
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (busID) REFERENCES Bus(busID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bản ghi vị trí xe theo thời gian (dùng cho realtime và lưu lịch sử)';

CREATE INDEX idx_vehiclelocation_bus_time ON VehicleLocation(busID, recordedAt);

-- ============================
-- BẢNG: BoardingRecord (chuẩn theo frontend hiện tại)
-- ============================

DROP TABLE IF EXISTS BoardingRecord;

CREATE TABLE BoardingRecord (
  recordID BIGINT AUTO_INCREMENT PRIMARY KEY,
  tripID INT NOT NULL,
  studentID INT NOT NULL,
  busStopID INT NULL,
  pickupTime DATETIME NULL,
  dropoffTime DATETIME NULL,
  status ENUM(
    'NOT_PICKED',   -- chưa đón
    'PICKED',       -- đã đón
    'DROPPED',      -- đã trả
    'ABSENT'        -- vắng mặt
  ) DEFAULT 'NOT_PICKED',
  reportedBy INT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tripID) REFERENCES Trip(tripID) ON DELETE CASCADE,
  FOREIGN KEY (studentID) REFERENCES Student(studentID) ON DELETE CASCADE,
  FOREIGN KEY (busStopID) REFERENCES BusStop(busStopID) ON DELETE SET NULL,
  FOREIGN KEY (reportedBy) REFERENCES Users(userID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Bảng ghi nhận đón trả học sinh';

CREATE INDEX idx_boarding_trip ON BoardingRecord(tripID);
CREATE INDEX idx_boarding_student ON BoardingRecord(studentID);

-- ============================
-- BẢNG: Notification - Thông báo nội bộ gửi tới người dùng
-- ============================
CREATE TABLE Notification (
  notificationID BIGINT AUTO_INCREMENT PRIMARY KEY,     -- Mã thông báo
  toUserID INT NOT NULL,                                -- Người nhận (Users.userID)
  fromUserID INT NULL,                                  -- Người gửi (Users.userID, có thể là admin)
  type ENUM('ARRIVAL','PICKUP','INCIDENT','SYSTEM','REMINDER') DEFAULT 'SYSTEM', -- Loại thông báo
  title VARCHAR(255) NULL,                              -- Tiêu đề
  content TEXT NOT NULL,                                -- Nội dung thông báo
  sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,             -- Thời điểm gửi
  readAt DATETIME NULL,                                 -- Thời điểm người nhận xem
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Thời điểm tạo
  FOREIGN KEY (toUserID) REFERENCES Users(userID) ON DELETE CASCADE,
  FOREIGN KEY (fromUserID) REFERENCES Users(userID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Thông báo nội bộ trong hệ thống gửi tới người dùng (hiển thị trên web phụ huynh)';

CREATE INDEX idx_notification_to ON Notification(toUserID);

-- ============================
-- BẢNG: Alert: Cảnh báo / Sự cố liên quan Trip / Bus / Driver
-- ============================
CREATE TABLE Alert (
  alertID BIGINT AUTO_INCREMENT PRIMARY KEY,            -- Mã cảnh báo
  tripID INT NULL,                                      -- Chuyến liên quan
  busID INT NULL,                                       -- Xe liên quan
  driverID INT NULL,                                    -- Tài xế liên quan
  severity ENUM('INFO','WARNING','CRITICAL') DEFAULT 'INFO', -- Mức độ
  description TEXT,                                     -- Mô tả
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolvedAt DATETIME NULL,                             -- Thời gian giải quyết
  resolvedBy INT NULL,                                  -- userID người xử lý
  FOREIGN KEY (tripID) REFERENCES Trip(tripID) ON DELETE SET NULL,
  FOREIGN KEY (busID) REFERENCES Bus(busID) ON DELETE SET NULL,
  FOREIGN KEY (driverID) REFERENCES Driver(driverID) ON DELETE SET NULL,
  FOREIGN KEY (resolvedBy) REFERENCES Users(userID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cảnh báo/sự cố (trễ, tai nạn, v.v.)';

CREATE INDEX idx_alert_trip ON Alert(tripID);
CREATE INDEX idx_alert_bus ON Alert(busID);

-- ============================
-- BẢNG: Geofence: Định nghĩa vùng địa lý để trigger cảnh báo (sử dụng POLYGON hoặc lưu JSON)
-- ============================
CREATE TABLE Geofence (
  geofenceID INT AUTO_INCREMENT PRIMARY KEY,            -- Mã vùng
  routeID INT NULL,                                     -- Tuyến liên quan (tuỳ chọn)
  polygon GEOMETRY NOT NULL,                            -- Vùng (WKB/WKT) - MySQL spatial
  enterAlert TINYINT(1) DEFAULT 1,                      -- Bật cảnh báo vào vùng
  exitAlert TINYINT(1) DEFAULT 0,                       -- Bật cảnh báo rời vùng
  name VARCHAR(150) NULL,                               -- Tên vùng
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (routeID) REFERENCES Route(routeID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Vùng địa lý (geofence) dùng để trigger thông báo/cảnh báo';

-- ============================
-- BẢNG: AuditLog: Lưu nhật ký hành động hệ thống để truy vết
-- ============================
CREATE TABLE AuditLog (
  auditID BIGINT AUTO_INCREMENT PRIMARY KEY,            -- Mã log
  actorID INT NULL,                                     -- userID thực hiện hành động
  action VARCHAR(120) NOT NULL,                         -- Hành động 
  targetType VARCHAR(100) NULL,                         -- Loại đối tượng (Trip, Bus,...)
  targetID VARCHAR(255) NULL,                           -- ID đối tượng (chuỗi để linh hoạt)
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,-- Thời điểm hành động
  meta JSON NULL,                                       -- Dữ liệu phụ (chi tiết) dưới dạng JSON
  FOREIGN KEY (actorID) REFERENCES Users(userID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Nhật ký hành động hệ thống (audit trail)';

CREATE INDEX idx_audit_actor ON AuditLog(actorID);
CREATE INDEX idx_audit_time ON AuditLog(timestamp);

-- ============================
-- Một vài ràng buộc bổ sung
-- ============================
CREATE INDEX idx_trip_date ON Trip(tripDate);
CREATE INDEX idx_vehiclelocation_time ON VehicleLocation(recordedAt);
CREATE INDEX idx_notification_sentat ON Notification(sentAt);

-- =================================================
-- BỔ SUNG: 
-- Thêm cột parentID vào table BusStop để biết được điểm dừng này là nhà của phụ huynh nào
-- =================================================

ALTER TABLE BusStop
ADD COLUMN parentID INT NULL AFTER routeID,
ADD CONSTRAINT fk_busstop_parent
  FOREIGN KEY (parentID)
  REFERENCES Parent(parentID)
  ON DELETE SET NULL
  ON UPDATE CASCADE;


-- =================================================
-- DỮ LIỆU MẪU 
-- =================================================

/* 1) Users: 15 parents, 3 drivers, 1 admin */
INSERT INTO Users (fullName, username, passwordHash, email, phone, role)
VALUES
-- PHỤ HUYNH 
('Nguyễn Văn A',  'parent01', 'parent', 'a@gmail.com', '0901110001', 'parent'),
('Trần Thị B',    'parent02', 'parent', 'b@gmail.com', '0901110002', 'parent'),
('Lê Văn C',      'parent03', 'parent', 'c@gmail.com', '0901110003', 'parent'),
('Phạm Thị D',    'parent04', 'parent', 'd@gmail.com', '0901110004', 'parent'),
('Hoàng Văn E',   'parent05', 'parent', 'e@gmail.com', '0901110005', 'parent'),
('Đỗ Thị F',      'parent06', 'parent', 'f@gmail.com', '0901110006', 'parent'),
('Vũ Văn G',      'parent07', 'parent', 'g@gmail.com', '0901110007', 'parent'),
('Bùi Thị H',     'parent08', 'parent', 'h@gmail.com', '0901110008', 'parent'),
('Phan Văn I',    'parent09', 'parent', 'i@gmail.com', '0901110009', 'parent'),
('Đặng Thị J',    'parent10', 'parent', 'j@gmail.com', '0901110010', 'parent'),
('Trịnh Văn K',   'parent11', 'parent', 'k2@gmail.com', '0901110011', 'parent'),
('Mai Thị L',     'parent12', 'parent', 'l2@gmail.com', '0901110012', 'parent'),
('Lý Văn M',      'parent13', 'parent', 'm2@gmail.com', '0901110013', 'parent'),
('Cao Thị N',     'parent14', 'parent', 'n@gmail.com', '0901110014', 'parent'),
('Dương Văn O',   'parent15', 'parent', 'o@gmail.com', '0901110015', 'parent'),

-- TÀI XẾ 
('Ngô Minh K',    'driver01', 'driver', 'k@gmail.com', '0902220001', 'driver'),
('Lâm Văn L',     'driver02', 'driver', 'l@gmail.com', '0902220002', 'driver'),
('Trương Thị M',  'driver03', 'driver', 'm@gmail.com', '0902220003', 'driver'),

-- ADMIN
('Quản trị viên',  'admin01',  'admin',  'admin@gmail.com', '0999999999', 'admin');

/* 2) Parent details */
INSERT INTO Parent (parentID, address, workInfo)
VALUES
(1, '123 Lê Lợi, Quận 1, TP.HCM', 'Công ty A'),
(2, '45 Nguyễn Huệ, Quận 1, TP.HCM','Công ty B'),
(3, '22 Trần Hưng Đạo, Quận 5','Công ty C'),
(4, '88 Hai Bà Trưng, Quận 3','Công ty D'),
(5, '10 Phan Đình Phùng, Quận Phú Nhuận','Công ty E'),
(6, '55 Võ Thị Sáu, Quận 3','Công ty F'),
(7, '9B Trường Chinh, Quận Tân Bình','Công ty G'),
(8, '77 Hoàng Văn Thụ, Quận Tân Bình','Công ty H'),
(9, '2A Cách Mạng Tháng 8, Quận 1','Công ty I'),
(10,'30 Bùi Thị Xuân, Quận 1','Công ty J'),
(11,'15 Nguyễn Văn Cừ, Quận 5','Công ty K'),
(12,'44 Lý Thường Kiệt, Quận 10','Công ty L'),
(13,'66 Điện Biên Phủ, Quận 3','Công ty M'),
(14,'99 Cộng Hòa, Quận Tân Bình','Công ty N'),
(15,'112 Xô Viết Nghệ Tĩnh, Bình Thạnh','Công ty O');

/* 3) Student: TĂNG LÊN 15 HỌC SINH */
INSERT INTO Student (fullName, grade, schoolName, parentUserID)
VALUES
('Nguyễn Minh Anh', '1A', 'Trường Tiểu học A', 1),
('Trần Gia Bảo',   '1A', 'Trường Tiểu học A', 2),
('Lê Khánh Chi',   '1B', 'Trường Tiểu học A', 3),
('Phạm Anh Duy',   '1B', 'Trường Tiểu học A', 4),
('Hoàng Bảo Em',   '2A', 'Trường Tiểu học A', 5),
('Đỗ Hồng Phúc',   '2A', 'Trường Tiểu học A', 6),
('Vũ Thanh Hà',    '2B', 'Trường Tiểu học A', 7),
('Bùi Đức Huy',    '3A', 'Trường Tiểu học A', 8),
('Phan Mỹ Linh',   '3A', 'Trường Tiểu học A', 9),
('Đặng Nam Sơn',   '3B', 'Trường Tiểu học A', 10),
('Trịnh Ngọc Anh', '1A', 'Trường Tiểu học A', 11),
('Mai Quốc Bảo',   '1B', 'Trường Tiểu học A', 12),
('Lý Minh Châu',   '2A', 'Trường Tiểu học A', 13),
('Cao Thùy Dung',  '2B', 'Trường Tiểu học A', 14),
('Dương Gia Hưng', '3A', 'Trường Tiểu học A', 15);

/* 4) Driver */
INSERT INTO Driver (userID, fullName, phoneNumber, driverLicense, status)
VALUES
(16, 'Ngô Minh K',   '0902220001', 'B2-987654', 'ACTIVE'),
(17, 'Lâm Văn L',    '0902220002', 'C1-876543', 'ACTIVE'),
(18, 'Trương Thị M', '0902220003', 'B2-765432', 'ACTIVE');

/* 5) Bus */
INSERT INTO Bus (licensePlate, capacity, model, status)
VALUES
('51A-10001', 40, 'Thaco', 'active'),
('51A-10002', 40, 'Hyundai', 'active'),
('51A-10003', 30, 'Samco', 'active'),
('51A-10004', 35, 'Isuzu', 'active');

/* 6) Route */
INSERT INTO Route (routeName, description, estimatedTime)
VALUES
('Tuyến 1: Quận 1 → Trường A', 'Tuyến buổi sáng từ Quận 1 tới Trường A', 30),
('Tuyến 2: Quận 3 → Trường A', 'Tuyến buổi sáng từ Quận 3 tới Trường A', 25),
('Tuyến 3: Quận 5 → Trường B', 'Tuyến buổi sáng từ Quận 5 tới Trường B', 45);

/* 7) BusStop */
INSERT INTO BusStop (routeID, name, lat, lng, sequence, estimatedArrivalTime)
VALUES
(1, 'Điểm dừng 1 - Q1', 10.7710, 106.6980, 1, '06:45:00'),
(1, 'Điểm dừng 2 - Q1', 10.7685, 106.6890, 2, '06:55:00'),
(2, 'Điểm dừng 1 - Q3', 10.7760, 106.6920, 1, '06:50:00'),
(3, 'Điểm dừng 1 - Q5', 10.7600, 106.6640, 1, '06:40:00');

/* 8) Trip: (driverID = 1) */
INSERT INTO Trip (routeID, tripDate, startTime, endTime, assignedBusID, assignedDriverID, status)
VALUES
-- Thứ 3 - 11/11/2025 (2 chuyến: sáng + chiều)
(1, '2025-11-11', '06:30:00', '08:00:00', 1, 1, 'PLANNED'),  -- Sáng: Đưa đi học
(1, '2025-11-11', '16:00:00', '17:30:00', 1, 1, 'PLANNED'),  -- Chiều: Đón về

-- Thứ 4 - 12/11/2025 (2 chuyến)
(1, '2025-11-12', '06:30:00', '08:00:00', 1, 1, 'PLANNED'),
(1, '2025-11-12', '16:00:00', '17:30:00', 1, 1, 'PLANNED'),

-- Thứ 5 - 13/11/2025 (1 chuyến: chỉ sáng)
(1, '2025-11-13', '06:30:00', '08:00:00', 1, 1, 'PLANNED'),

-- Thứ 7 - 15/11/2025 (2 chuyến)
(1, '2025-11-15', '06:30:00', '08:00:00', 1, 1, 'PLANNED'),
(1, '2025-11-15', '16:00:00', '17:30:00', 1, 1, 'PLANNED'),

-- Thứ CN - 16/11/2025 (1 chuyến: chỉ sáng) 
(1, '2025-11-16', '06:30:00', '08:00:00', 1, 1, 'PLANNED');   -- Đang chạy

/* 9) DriverAssignment: LỊCH PHÂN CÔNG 11/11 - 16/11 */
INSERT INTO DriverAssignment (driverID, busID, routeID, assignmentDate, note)
VALUES

-- Thứ 3-CN: 11/11 đến 16/11
(1, 1, 1, '2025-11-11', 'Ca sáng và chiều - Tuyến 1'),
(1, 1, 1, '2025-11-12', 'Ca sáng và chiều - Tuyến 1'),
(1, 1, 1, '2025-11-13', 'Chỉ ca sáng - Tuyến 1'),
(1, 1, 1, '2025-11-15', 'Ca sáng và chiều - Tuyến 1'),
(1, 1, 1, '2025-11-16', 'Chỉ ca sáng - Tuyến 1');

/* 10) BoardingRecord: Danh sách học sinh cho mỗi chuyến */
-- Thứ 3 - 11/11 SÁNG (tripID = 1) - 8 HS
INSERT INTO BoardingRecord (tripID, studentID, busStopID, pickupTime, dropoffTime, status, reportedBy)
VALUES
(1, 1, 1, NULL, NULL, 'NOT_PICKED', 16),
(1, 2, 1, NULL, NULL, 'NOT_PICKED', 16),
(1, 3, 2, NULL, NULL, 'NOT_PICKED', 16),
(1, 5, 2, NULL, NULL, 'NOT_PICKED', 16),
(1, 7, 1, NULL, NULL, 'NOT_PICKED', 16),  
(1, 9, 2, NULL, NULL, 'NOT_PICKED', 16),
(1, 11, 1, NULL, NULL, 'NOT_PICKED', 16),
(1, 13, 2, NULL, NULL, 'NOT_PICKED', 16);

-- Thứ 3 - 11/11 CHIỀU (tripID = 2) - 7 HS
INSERT INTO BoardingRecord (tripID, studentID, busStopID, pickupTime, dropoffTime, status, reportedBy)
VALUES
(2, 1, NULL, NULL, NULL, 'NOT_PICKED', 16),
(2, 2, NULL, NULL, NULL, 'NOT_PICKED', 16),
(2, 3, NULL, NULL, NULL, 'NOT_PICKED', 16),
(2, 5, NULL, NULL, NULL, 'NOT_PICKED', 16),
(2, 9, NULL, NULL, NULL, 'NOT_PICKED', 16),
(2, 11, NULL, NULL, NULL, 'NOT_PICKED', 16),
(2, 13, NULL, NULL, NULL, 'NOT_PICKED', 16);

-- Thứ 4 - 12/11 SÁNG (tripID = 3) - 10 HS
INSERT INTO BoardingRecord (tripID, studentID, busStopID, pickupTime, dropoffTime, status, reportedBy)
VALUES
(3, 1, 1, NULL, NULL, 'NOT_PICKED', 16),
(3, 2, 1, NULL, NULL, 'NOT_PICKED', 16),
(3, 3, 2, NULL, NULL, 'NOT_PICKED', 16),  
(3, 4, 1, NULL, NULL, 'NOT_PICKED', 16),
(3, 5, 2, NULL, NULL, 'NOT_PICKED', 16),
(3, 7, 1, NULL, NULL, 'NOT_PICKED', 16),
(3, 9, 2, NULL, NULL, 'NOT_PICKED', 16),
(3, 11, 1, NULL, NULL, 'NOT_PICKED', 16),
(3, 13, 2, NULL, NULL, 'NOT_PICKED', 16),
(3, 15, 1, NULL, NULL, 'NOT_PICKED', 16);

-- Thứ 4 - 12/11 CHIỀU (tripID = 4) - 9 HS
INSERT INTO BoardingRecord (tripID, studentID, busStopID, pickupTime, dropoffTime, status, reportedBy)
VALUES
(4, 1, NULL, NULL, NULL, 'NOT_PICKED', 16),
(4, 2, NULL, NULL, NULL, 'NOT_PICKED', 16),
(4, 4, NULL, NULL, NULL, 'NOT_PICKED', 16),
(4, 5, NULL, NULL, NULL, 'NOT_PICKED', 16),
(4, 7, NULL, NULL, NULL, 'NOT_PICKED', 16),
(4, 9, NULL, NULL, NULL, 'NOT_PICKED', 16),
(4, 11, NULL, NULL, NULL, 'NOT_PICKED', 16),
(4, 13, NULL, NULL, NULL, 'NOT_PICKED', 16),
(4, 15, NULL, NULL, NULL, 'NOT_PICKED', 16);

-- Thứ 5 - 13/11 SÁNG (tripID = 5) - 7 HS
INSERT INTO BoardingRecord (tripID, studentID, busStopID, pickupTime, dropoffTime, status, reportedBy)
VALUES
(5, 1, 1, NULL, NULL, 'NOT_PICKED', 16),
(5, 2, 1, NULL, NULL, 'NOT_PICKED', 16),
(5, 3, 2, NULL, NULL, 'NOT_PICKED', 16),
(5, 4, 1, NULL, NULL, 'NOT_PICKED', 16),
(5, 5, 2, NULL, NULL, 'NOT_PICKED', 16),
(5, 9, 2, NULL, NULL, 'NOT_PICKED', 16),
(5, 11, 1, NULL, NULL, 'NOT_PICKED', 16);

-- Thứ 7 - 15/11 SÁNG (tripID = 6) - 10 HS
INSERT INTO BoardingRecord (tripID, studentID, busStopID, pickupTime, dropoffTime, status, reportedBy)
VALUES
(6, 1, 1, NULL, NULL, 'NOT_PICKED', 16),
(6, 2, 1, NULL, NULL, 'NOT_PICKED', 16),
(6, 3, 2, NULL, NULL, 'NOT_PICKED', 16),
(6, 4, 1, NULL, NULL, 'NOT_PICKED', 16),
(6, 5, 2, NULL, NULL, 'NOT_PICKED', 16),
(6, 6, 1, NULL, NULL, 'NOT_PICKED', 16),
(6, 7, 1, NULL, NULL, 'NOT_PICKED', 16),  
(6, 9, 2, NULL, NULL, 'NOT_PICKED', 16),
(6, 11, 1, NULL, NULL, 'NOT_PICKED', 16),
(6, 13, 2, NULL, NULL, 'NOT_PICKED', 16);

-- Thứ 7 - 15/11 CHIỀU (tripID = 7) - 9 HS
INSERT INTO BoardingRecord (tripID, studentID, busStopID, pickupTime, dropoffTime, status, reportedBy)
VALUES
(7, 1, NULL, NULL, NULL, 'NOT_PICKED', 16),
(7, 2, NULL, NULL, NULL, 'NOT_PICKED', 16),
(7, 3, NULL, NULL, NULL, 'NOT_PICKED', 16),
(7, 4, NULL, NULL, NULL, 'NOT_PICKED', 16),
(7, 5, NULL, NULL, NULL, 'NOT_PICKED', 16),
(7, 6, NULL, NULL, NULL, 'NOT_PICKED', 16),
(7, 9, NULL, NULL, NULL, 'NOT_PICKED', 16),
(7, 11, NULL, NULL, NULL, 'NOT_PICKED', 16),
(7, 13, NULL, NULL, NULL, 'NOT_PICKED', 16);

-- Thứ CN - 16/11 SÁNG (tripID = 8) - 10 HS
INSERT INTO BoardingRecord (tripID, studentID, busStopID, pickupTime, dropoffTime, status, reportedBy)
VALUES
(8, 1, 1, NULL, NULL, 'NOT_PICKED', 16),
(8, 2, 1, NULL, NULL, 'NOT_PICKED', 16),
(8, 3, 2, NULL, NULL, 'NOT_PICKED', 16),
(8, 4, 1, NULL, NULL, 'NOT_PICKED', 16),
(8, 5, 2, NULL, NULL, 'NOT_PICKED', 16),  
(8, 6, 1, NULL, NULL, 'NOT_PICKED', 16),
(8, 7, 1, NULL, NULL, 'NOT_PICKED', 16),
(8, 9, 2, NULL, NULL, 'NOT_PICKED', 16),
(8, 11, 1, NULL, NULL, 'NOT_PICKED', 16),
(8, 12, 2, NULL, NULL, 'NOT_PICKED', 16);

/* 11) Device */
INSERT INTO Device (busID, userID, deviceType, fcmToken)
VALUES
(1, 16, 'driver_app', NULL),
(2, 17, 'driver_app', NULL),
(3, 18, 'driver_app', NULL),
(NULL, 19, 'other', NULL);  -- admin

/* 12) Notification */
INSERT INTO Notification (toUserID, fromUserID, type, title, content, sentAt)
VALUES
(1, 19, 'ARRIVAL', 'Xe sắp đến', 'Xe buýt tuyến 1 sắp đến điểm đón của con bạn', NOW()),
(2, 19, 'PICKUP', 'Xe đang trên đường', 'Xe buýt đang trên đường đón học sinh', NOW()),
(5, 19, 'INCIDENT', 'Xe trễ', 'Xe buýt gặp kẹt xe, dự kiến trễ 10 phút', NOW());

/* 13) VehicleLocation */
INSERT INTO VehicleLocation (busID, lat, lng, heading, speed)
VALUES
(1, 10.7710, 106.6980, 180, 30),
(2, 10.7760, 106.6920, 90, 25),
(3, 10.7600, 106.6640, 270, 28);
