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
-- BẢNG: Rout: Lưu tuyến đường tổng thể
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
-- BẢNG: BoardingRecord: Ghi nhận đón/trả từng học sinh cho mỗi chuyến
-- ============================
CREATE TABLE BoardingRecord (
  recordID BIGINT AUTO_INCREMENT PRIMARY KEY,           -- Mã bản ghi đón/trả
  tripID INT NOT NULL,                                  -- Chuyến
  studentID INT NOT NULL,                               -- Học sinh
  busStopID INT NULL,                                      -- Điểm dừng
  pickupTime DATETIME NULL,                             -- Thời điểm đón
  dropoffTime DATETIME NULL,                            -- Thời điểm trả
  status ENUM('PICKED','DROPPED','MISSED') DEFAULT 'MISSED', -- Trạng thái
  reportedBy INT NULL,                                  -- userID người báo (tài xế)
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tripID) REFERENCES Trip(tripID) ON DELETE CASCADE,
  FOREIGN KEY (studentID) REFERENCES Student(studentID) ON DELETE CASCADE,
  FOREIGN KEY (busStopID) REFERENCES BusStop(busStopID) ON DELETE SET NULL,
  FOREIGN KEY (reportedBy) REFERENCES Users(userID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Ghi nhận việc đón/ trả học sinh trên từng chuyến';

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
-- Một vài ràng buộc 
-- ============================
CREATE INDEX idx_trip_date ON Trip(tripDate);
CREATE INDEX idx_vehiclelocation_time ON VehicleLocation(recordedAt);
CREATE INDEX idx_notification_sentat ON Notification(sentAt);

--
-- NEW 
--

-- ============================
-- DỮ LIỆU MẪU CHO SchoolBusManagement
-- Chạy sau khi bạn đã tạo tất cả bảng
-- ============================

/* 1) Users: (10 parents, 3 drivers, 1 admin) */
INSERT INTO Users (fullName, username, passwordHash, email, phone, role)
VALUES
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

('Ngô Minh K',    'driver01', 'driver', 'k@gmail.com', '0902220001', 'driver'),
('Lâm Văn L',     'driver02', 'driver', 'l@gmail.com', '0902220002', 'driver'),
('Trương Thị M',  'driver03', 'driver', 'm@gmail.com', '0902220003', 'driver'),

('Quản trị viên',  'admin01',  'admin',  'admin@gmail.com', '0999999999', 'admin')
;

/* 2) Parent details: parentID must equal corresponding Users.userID
   (Assumes Users inserted auto-increment from 1..14 in order above) */
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
(10,'30 Bùi Thị Xuân, Quận 1','Công ty J')
;

/* 3) Student: each student -> parentUserID */
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
('Đặng Nam Sơn',   '3B', 'Trường Tiểu học A', 10)
;

/* 4) Driver: userID references Users.userID (drivers users are 11..13) 
   Note: driverID will auto-increment (we can later reference driverID 1..3) */
INSERT INTO Driver (userID, fullName, phoneNumber, driverLicense, status)
VALUES
(11, 'Ngô Minh K',   '0902220001', 'B2-987654', 'ACTIVE'),
(12, 'Lâm Văn L',    '0902220002', 'C1-876543', 'ACTIVE'),
(13, 'Trương Thị M', '0902220003', 'B2-765432', 'ACTIVE')
;

/* 5) Bus: use columns licensePlate, capacity, model, status (status enum lowercase per schema) */
INSERT INTO Bus (licensePlate, capacity, model, status)
VALUES
('51A-10001', 40, 'Thaco', 'active'),
('51A-10002', 40, 'Hyundai', 'active'),
('51A-10003', 30, 'Samco', 'active'),
('51A-10004', 35, 'Isuzu', 'active')
;

/* 6) Route: routeName, description, estimatedTime (minutes) */
INSERT INTO Route (routeName, description, estimatedTime)
VALUES
('Tuyến 1: Quận 1 → Trường A', 'Tuyến buổi sáng từ Quận 1 tới Trường A', 30),
('Tuyến 2: Quận 3 → Trường A', 'Tuyến buổi sáng từ Quận 3 tới Trường A', 25),
('Tuyến 3: Quận 5 → Trường B', 'Tuyến buổi sáng từ Quận 5 tới Trường B', 45)
;

/* 7) BusStop: tạo vài điểm dừng cho mỗi route (lat/lng ví dụ) */
INSERT INTO BusStop (routeID, name, lat, lng, sequence, estimatedArrivalTime)
VALUES
(1, 'Điểm dừng 1 - Q1', 10.7710, 106.6980, 1, '06:45:00'),
(1, 'Điểm dừng 2 - Q1', 10.7685, 106.6890, 2, '06:55:00'),
(2, 'Điểm dừng 1 - Q3', 10.7760, 106.6920, 1, '06:50:00'),
(3, 'Điểm dừng 1 - Q5', 10.7600, 106.6640, 1, '06:40:00')
;

/* 8) Trip: chuyến hôm nay (gán bus & driver). 
   assignedDriverID references Driver.driverID (driverIDs sẽ là 1..3 theo thứ tự insert),
   assignedBusID tham chiếu Bus.busID (1..4)
*/
INSERT INTO Trip (routeID, tripDate, startTime, endTime, assignedBusID, assignedDriverID, status)
VALUES
(1, CURDATE(), '07:00:00', '08:00:00', 1, 1, 'PLANNED'),
(2, CURDATE(), '07:30:00', '08:20:00', 2, 2, 'PLANNED'),
(3, CURDATE(), '06:45:00', '07:40:00', 3, 3, 'PLANNED')
;

/* 9) DriverAssignment: phân công theo ngày (driverID, busID, routeID) */
INSERT INTO DriverAssignment (driverID, busID, routeID, assignmentDate, note)
VALUES
(1, 1, 1, CURDATE(), 'Phân công sáng - tuyến 1'),
(2, 2, 2, CURDATE(), 'Phân công sáng - tuyến 2'),
(3, 3, 3, CURDATE(), 'Phân công sáng - tuyến 3')
;

/* 10) Device: giả lập 1 thiết bị cho mỗi driver và 1 cho admin (userID 14) */
INSERT INTO Device (busID, userID, deviceType, fcmToken)
VALUES
(1, 11, 'driver_app', NULL),
(2, 12, 'driver_app', NULL),
(3, 13, 'driver_app', NULL),
(NULL, 14, 'other', NULL)  -- admin client
;

/* 11) Notification: gửi 1 thông báo mẫu từ admin (userID 14) tới 3 phụ huynh */
INSERT INTO Notification (toUserID, fromUserID, type, title, content, sentAt)
VALUES
(1, 14, 'ARRIVAL', 'Xe sắp đến', 'Xe buýt tuyến 1 sắp đến điểm đón của con bạn', NOW()),
(2, 14, 'PICKUP', 'Xe đang trên đường', 'Xe buýt đang trên đường đón học sinh', NOW()),
(5, 14, 'INCIDENT', 'Xe trễ', 'Xe buýt gặp kẹt xe, dự kiến trễ 10 phút', NOW())
;

/* 12) VehicleLocation: vài bản ghi vị trí ban đầu (history) */
INSERT INTO VehicleLocation (busID, lat, lng, heading, speed)
VALUES
(1, 10.7710, 106.6980, 180, 30),
(2, 10.7760, 106.6920, 90, 25),
(3, 10.7600, 106.6640, 270, 28)
;

/* 13) BoardingRecord: mẫu (một vài record) */
INSERT INTO BoardingRecord (tripID, studentID, busStopID, pickupTime, status, reportedBy)
VALUES
(1, 1, 1, NOW(), 'PICKED', 11),
(1, 2, 2, NULL, 'MISSED', 11)
;

-- KẾT THÚC DỮ LIỆU MẪU



-- ============================
-- THÔNG TIN MẪU
-- ============================
-- INSERT INTO Users (username, password, fullName, role, email, phoneNumber)
-- VALUES
-- ('parent01', '123456', 'Nguyễn Văn A', 'parent', 'a@gmail.com', '0901110001'),
-- ('parent02', '123456', 'Trần Thị B', 'parent', 'b@gmail.com', '0901110002'),
-- ('parent03', '123456', 'Lê Văn C', 'parent', 'c@gmail.com', '0901110003'),
-- ('parent04', '123456', 'Phạm Thị D', 'parent', 'd@gmail.com', '0901110004'),
-- ('parent05', '123456', 'Hoàng Văn E', 'parent', 'e@gmail.com', '0901110005'),
-- ('parent06', '123456', 'Đỗ Thị F', 'parent', 'f@gmail.com', '0901110006'),
-- ('parent07', '123456', 'Vũ Văn G', 'parent', 'g@gmail.com', '0901110007'),
-- ('parent08', '123456', 'Bùi Thị H', 'parent', 'h@gmail.com', '0901110008'),
-- ('parent09', '123456', 'Phan Văn I', 'parent', 'i@gmail.com', '0901110009'),
-- ('parent10', '123456', 'Đặng Thị J', 'parent', 'j@gmail.com', '0901110010'),

-- ('driver01', '123456', 'Ngô Minh K', 'driver', 'k@gmail.com', '0902220001'),
-- ('driver02', '123456', 'Lâm Văn L', 'driver', 'l@gmail.com', '0902220002'),
-- ('driver03', '123456', 'Trương Thị M', 'driver', 'm@gmail.com', '0902220003'),

-- ('admin01', 'admin123', 'Quản trị viên', 'admin', 'admin@gmail.com', '0999999999');


-- INSERT INTO Student (fullName, grade, parentUserID)
-- VALUES
-- ('Nguyễn Minh Anh', '1A', 1),
-- ('Trần Gia Bảo', '1A', 2),
-- ('Lê Khánh Chi', '1B', 3),
-- ('Phạm Anh Duy', '1B', 4),
-- ('Hoàng Bảo Em', '2A', 5),
-- ('Đỗ Hồng Phúc', '2A', 6),
-- ('Vũ Thanh Hà', '2B', 7),
-- ('Bùi Đức Huy', '3A', 8),
-- ('Phan Mỹ Linh', '3A', 9),
-- ('Đặng Nam Sơn', '3B', 10);


-- INSERT INTO Driver (userID, fullName, phoneNumber, driverLicense, experienceYears, status)
-- VALUES
-- (11, 'Ngô Minh K', '0902220001', 'B2-987654', 5, 'ACTIVE'),
-- (12, 'Lâm Văn L', '0902220002', 'C1-876543', 3, 'ACTIVE'),
-- (13, 'Trương Thị M', '0902220003', 'B2-765432', 2, 'ACTIVE');


-- INSERT INTO Bus (plateNumber, capacity, brand, status)
-- VALUES
-- ('51A-10001', 40, 'Thaco', 'ACTIVE'),
-- ('51A-10002', 40, 'Hyundai', 'ACTIVE'),
-- ('51A-10003', 30, 'Samco', 'ACTIVE'),
-- ('51A-10004', 35, 'Isuzu', 'ACTIVE');


-- INSERT INTO Route (routeName, startLocation, endLocation, distance)
-- VALUES
-- ('Tuyến 1: Quận 1 → Trường A', 'Quận 1', 'Trường Tiểu học A', 12.5),
-- ('Tuyến 2: Quận 3 → Trường A', 'Quận 3', 'Trường Tiểu học A', 9.3),
-- ('Tuyến 3: Quận 5 → Trường B', 'Quận 5', 'Trường Tiểu học B', 15.1);


-- INSERT INTO DriverAssignment (driverID, busID, routeID, assignmentDate, note)
-- VALUES
-- (1, 1, 1, CURDATE(), 'Phân công sáng nay'),
-- (2, 2, 2, CURDATE(), 'Phân công sáng nay'),
-- (3, 3, 3, CURDATE(), 'Phân công sáng nay');


-- INSERT INTO Notification (toUserID, fromUserID, type, title, content, channel, sentAt)
-- VALUES
-- (1, 14, 'ARRIVAL', 'Xe đã đến trường', 'Học sinh Nguyễn Minh Anh đã đến trường an toàn', 'PUSH', NOW()),
-- (2, 14, 'PICKUP', 'Xe đang đến đón', 'Xe đang trên đường đón Trần Gia Bảo', 'PUSH', NOW()),
-- (5, 14, 'INCIDENT', 'Xe trễ giờ', 'Xe gặp kẹt xe, sẽ trễ khoảng 10 phút', 'PUSH', NOW());

