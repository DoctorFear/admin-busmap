-- 1. XÓA BẢNG HIỆN TẠI
-- *********************************************************************************
DROP TABLE IF EXISTS BoardingRecord;
DROP TABLE IF EXISTS VehicleLocation;
DROP TABLE IF EXISTS Device;
DROP TABLE IF EXISTS DriverAssignment;
DROP TABLE IF EXISTS Alert;
DROP TABLE IF EXISTS Geofence;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS AuditLog;
DROP TABLE IF EXISTS Trip;
DROP TABLE IF EXISTS BusStop;
DROP TABLE IF EXISTS RouteDetail;
DROP TABLE IF EXISTS Student;
DROP TABLE IF EXISTS Driver;
DROP TABLE IF EXISTS Parent;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Bus;
DROP TABLE IF EXISTS Route;


-- 2. TẠO BẢNG (TẤT CẢ NHƯ  CŨ CHỈ CÓ BẢNG Bus THAY ĐỔI)
-- *********************************************************************************
-- BẢNG 1: Users
CREATE TABLE Users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(150) NOT NULL,
    username VARCHAR(80) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(30),
    role ENUM('admin', 'driver', 'parent') NOT NULL,
    languagePref VARCHAR(8) DEFAULT 'vi',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng người dùng (Admin, Driver, Parent)';

-- BẢNG 2: Parent
CREATE TABLE Parent (
    parentID INT PRIMARY KEY,
    address VARCHAR(255),
    workInfo VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentID) REFERENCES Users(userID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 3: Driver
CREATE TABLE Driver (
    driverID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL UNIQUE,
    fullName VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(15) NOT NULL UNIQUE,
    driverLicense VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 4: Route
CREATE TABLE Route (
    routeID INT AUTO_INCREMENT PRIMARY KEY,
    routeName VARCHAR(150) NOT NULL,
    description TEXT,
    estimatedTime INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 5: Bus (BỎ CỘT routeID)
CREATE TABLE Bus (
    busID INT AUTO_INCREMENT PRIMARY KEY,
    licensePlate VARCHAR(30) NOT NULL UNIQUE,
    capacity INT NOT NULL DEFAULT 0,
    model VARCHAR(120),
    status ENUM('active','maintenance','inactive') DEFAULT 'active',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 6: Student
CREATE TABLE Student (
    studentID INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(150) NOT NULL,
    grade VARCHAR(50),
    schoolName VARCHAR(150),
    parentUserID INT NOT NULL,
    photoUrl VARCHAR(500),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parentUserID) REFERENCES Users(userID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_student_parent (parentUserID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 7: RouteDetail
CREATE TABLE RouteDetail (
    detailID INT AUTO_INCREMENT PRIMARY KEY,
    routeID INT NOT NULL,
    orderNumber INT NOT NULL,
    streetName VARCHAR(255) NOT NULL,
    note VARCHAR(255),
    lat DECIMAL(10,7) NULL,
    lng DECIMAL(10,7) NULL,
    FOREIGN KEY (routeID) REFERENCES Route(routeID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 8: BusStop
CREATE TABLE BusStop (
    busStopID INT AUTO_INCREMENT PRIMARY KEY,
    routeID INT NOT NULL,
    parentID INT NULL,
    name VARCHAR(200) NOT NULL,
    lat DECIMAL(10,7) NULL,
    lng DECIMAL(10,7) NULL,
    sequence INT NOT NULL,
    estimatedArrivalTime TIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (routeID) REFERENCES Route(routeID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (parentID) REFERENCES Parent(parentID)
        ON DELETE SET NULL ON UPDATE CASCADE,
    UNIQUE KEY uq_stop_route_sequence (routeID, sequence)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- BẢNG 9: Trip
CREATE TABLE Trip (
    tripID INT AUTO_INCREMENT PRIMARY KEY,
    routeID INT NOT NULL,
    tripDate DATE NOT NULL,
    startTime TIME NULL,
    endTime TIME NULL,
    assignedBusID INT NULL,
    assignedDriverID INT NULL,
    status ENUM('PLANNED','RUNNING','COMPLETED','CANCELLED') DEFAULT 'PLANNED',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (routeID) REFERENCES Route(routeID)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (assignedBusID) REFERENCES Bus(busID)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (assignedDriverID) REFERENCES Driver(driverID)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- BẢNG 10: DriverAssignment
CREATE TABLE DriverAssignment (
    assignmentID INT AUTO_INCREMENT PRIMARY KEY,
    driverID INT NOT NULL,
    busID INT NOT NULL,
    routeID INT NULL,
    assignmentDate DATE NOT NULL,
    note VARCHAR(255) NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driverID) REFERENCES Driver(driverID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (busID) REFERENCES Bus(busID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (routeID) REFERENCES Route(routeID)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- BẢNG 11: Device
CREATE TABLE Device (
    deviceID BIGINT AUTO_INCREMENT PRIMARY KEY,
    busID INT NULL,
    userID INT NULL,
    deviceType ENUM('bus_tracker','driver_app','parent_app','tablet','other') DEFAULT 'driver_app',
    fcmToken VARCHAR(512) NULL,
    lastSeen DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (busID) REFERENCES Bus(busID)
        ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (userID) REFERENCES Users(userID)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 12: VehicleLocation
CREATE TABLE VehicleLocation (
    locationID BIGINT AUTO_INCREMENT PRIMARY KEY,
    busID INT NOT NULL,
    lat DECIMAL(10,7) NOT NULL,
    lng DECIMAL(10,7) NOT NULL,
    heading FLOAT NULL,
    speed FLOAT NULL,
    recordedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (busID) REFERENCES Bus(busID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 13: BoardingRecord
CREATE TABLE BoardingRecord (
    recordID BIGINT AUTO_INCREMENT PRIMARY KEY,
    tripID INT NOT NULL,
    studentID INT NOT NULL,
    busStopID INT NULL,
    pickupTime DATETIME NULL,
    dropoffTime DATETIME NULL,
    status ENUM(
        'NOT_PICKED',
        'PICKED',
        'DROPPED',
        'ABSENT'
    ) DEFAULT 'NOT_PICKED',
    reportedBy INT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tripID) REFERENCES Trip(tripID) ON DELETE CASCADE,
    FOREIGN KEY (studentID) REFERENCES Student(studentID) ON DELETE CASCADE,
    FOREIGN KEY (busStopID) REFERENCES BusStop(busStopID) ON DELETE SET NULL,
    FOREIGN KEY (reportedBy) REFERENCES Users(userID) ON DELETE SET NULL,
    UNIQUE KEY uq_boarding_trip_student (tripID, studentID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 14: Notification
CREATE TABLE Notification (
    notificationID BIGINT AUTO_INCREMENT PRIMARY KEY,
    toUserID INT NOT NULL,
    fromUserID INT NULL,
    type ENUM('ARRIVAL','PICKUP','INCIDENT','SYSTEM','REMINDER') DEFAULT 'SYSTEM',
    title VARCHAR(255) NULL,
    content TEXT NOT NULL,
    sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    readAt DATETIME NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (toUserID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (fromUserID) REFERENCES Users(userID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 15: Alert
CREATE TABLE Alert (
    alertID BIGINT AUTO_INCREMENT PRIMARY KEY,
    tripID INT NULL,
    busID INT NULL,
    driverID INT NULL,
    severity ENUM('INFO','WARNING','CRITICAL') DEFAULT 'INFO',
    description TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolvedAt DATETIME NULL,
    resolvedBy INT NULL,
    FOREIGN KEY (tripID) REFERENCES Trip(tripID) ON DELETE SET NULL,
    FOREIGN KEY (busID) REFERENCES Bus(busID) ON DELETE SET NULL,
    FOREIGN KEY (driverID) REFERENCES Driver(driverID) ON DELETE SET NULL,
    FOREIGN KEY (resolvedBy) REFERENCES Users(userID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 16: Geofence
CREATE TABLE Geofence (
    geofenceID INT AUTO_INCREMENT PRIMARY KEY,
    routeID INT NULL,
    polygon GEOMETRY NOT NULL,
    enterAlert TINYINT(1) DEFAULT 1,
    exitAlert TINYINT(1) DEFAULT 0,
    name VARCHAR(150) NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (routeID) REFERENCES Route(routeID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BẢNG 17: AuditLog
CREATE TABLE AuditLog (
    auditID BIGINT AUTO_INCREMENT PRIMARY KEY,
    actorID INT NULL,
    action VARCHAR(120) NOT NULL,
    targetType VARCHAR(100) NULL,
    targetID VARCHAR(255) NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    meta JSON NULL,
    FOREIGN KEY (actorID) REFERENCES Users(userID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =================================================================================
-- 3. CHÈN DỮ LIỆU MẪU 
-- *********************************************************************************
SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- 3.1. TẠO USERS (1 Admin, 9 Driver, 500 Parent)
-- =========================================
SET @i = 0;
SET @driver_counter = 0;
SET @parent_counter = 0;
SET @base_phone_number = 910000000;
SET @driver_base_phone = 977000000;

-- a. Admin (ID = 1)
INSERT INTO Users (userID, fullName, username, passwordHash, email, phone, role, languagePref)
VALUES (1, 'Quản trị Viên Hệ thống', 'admin', 'admin', 'admin@gmail.com', '0901000001', 'admin', 'vi');

SET @i = 1;

-- b. Drivers (ID 2 - 10)
INSERT INTO Users (userID, fullName, username, passwordHash, email, phone, role, languagePref)
SELECT
    @i := @i + 1 AS userID,
    CONCAT(ELT(FLOOR(1 + RAND() * 10), 'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hoàng'), ' ', ELT(FLOOR(1 + RAND() * 10), 'Văn', 'Thị', 'Quốc', 'Minh', 'Thành', 'Hải', 'Lan', 'Kim', 'Anh', 'Duy'), ' ', CHAR(65 + @i)) AS fullName,
    CONCAT('driver', LPAD(@driver_counter := @driver_counter + 1, 2, '0')) AS username,
    'driver' AS passwordHash,
    CONCAT('driver', LPAD(@driver_counter, 2, '0'), '@gmail.com') AS email,
    CONCAT('0', (@driver_base_phone + @driver_counter)) AS phone,
    'driver' AS role,
    'vi' AS languagePref
FROM (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) numbers;

SET @i = 10;

-- c. Parents (ID 11 - 510)
INSERT INTO Users (userID, fullName, username, passwordHash, email, phone, role, languagePref)
SELECT
    @i := @i + 1 AS userID,
    CONCAT(ELT(FLOOR(1 + RAND() * 10), 'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hoàng'), ' ', ELT(FLOOR(1 + RAND() * 10), 'Văn', 'Thị', 'Quốc', 'Minh', 'Thành', 'Hải', 'Lan', 'Kim', 'Anh', 'Duy'), ' ', CHAR(75 + FLOOR(RAND() * 26))) AS fullName,
    CONCAT('parent', LPAD(@parent_counter := @parent_counter + 1, 3, '0')) AS username,
    'parent' AS passwordHash,
    CONCAT('parent', LPAD(@parent_counter, 3, '0'), '@gmail.com') AS email,
    CONCAT('0', (@base_phone_number + @i)) AS phone,
    'parent' AS role,
    'vi' AS languagePref
FROM (
    SELECT a.n + b.n * 10 + c.n * 100 AS num
    FROM
        (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
        (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
        (SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) c
    LIMIT 500
) numbers;


-- 3.2. TẠO PARENT (LIÊN KẾT TỪ USERS ID 11-510)
-- Chọn địa chỉ ngẫu nhiên cho mỗi parent
-- =========================================
INSERT INTO Parent (parentID, address, workInfo)
SELECT
    userID,
    -- Dùng biến session @district_name để lưu tên quận ngẫu nhiên cho mỗi dòng.
    CONCAT(
        FLOOR(100 + RAND() * 900), ' ',
        -- Chọn đường theo quận DỰA VÀO tên quận ngẫu nhiên được gán trong CASE statement
        CASE @district_name := ELT(
            FLOOR(1 + RAND() * 10),
            'Quận 1', 'Quận 5', 'Quận 3', 'Quận 7', 'Quận 8',
            'Quận 10', 'Quận Tân Bình', 'Quận Phú Nhuận', 'Quận Bình Thạnh', 'Quận Gò Vấp'
        )
            WHEN 'Quận 1' THEN
                ELT(FLOOR(1 + RAND() * 5), 'Nguyễn Huệ', 'Đồng Khởi', 'Lê Lợi', 'Lê Duẩn', 'Phạm Ngũ Lão')
            WHEN 'Quận 5' THEN
                ELT(FLOOR(1 + RAND() * 5), 'An Dương Vương', 'Hùng Vương', 'Nguyễn Trãi', 'Châu Văn Liêm', 'Phùng Hưng')
            WHEN 'Quận 3' THEN
                ELT(FLOOR(1 + RAND() * 6), 'Nam Kỳ Khởi Nghĩa', 'Nguyễn Đình Chiểu', 'Lý Chính Thắng', 'Lê Văn Sỹ', 'Hai Bà Trưng', 'Điện Biên Phủ')
            WHEN 'Quận 7' THEN
                ELT(FLOOR(1 + RAND() * 3), 'Nguyễn Văn Linh', 'Huỳnh Tấn Phát', 'Nguyễn Tất Thành')
            WHEN 'Quận 8' THEN
                ELT(FLOOR(1 + RAND() * 6), 'Âu Dương Lân', 'Tạ Quang Bửu', 'Phạm Hùng', 'Cao Lỗ', 'Bến Bình Đông', 'Bông Sao')
            WHEN 'Quận 10' THEN
                ELT(FLOOR(1 + RAND() * 7), '3 Tháng 2', 'Nguyễn Chí Thanh', 'Sư Vạn Hạnh', 'Lê Hồng Phong', 'Lý Thường Kiệt', 'Hòa Hảo', 'Ngô Gia Tự')
            WHEN 'Quận Tân Bình' THEN
                ELT(FLOOR(1 + RAND() * 7), 'Trường Chinh', 'Cộng Hòa', 'Phổ Quang', 'Hoàng Hoa Thám', 'Út Tịch', 'Cách Mạng Tháng Tám', 'Lạc Long Quân')
            WHEN 'Quận Phú Nhuận' THEN
                ELT(FLOOR(1 + RAND() * 5), 'Lê Văn Sỹ', 'Nguyễn Văn Trỗi', 'Phan Xích Long', 'Hoàng Văn Thụ', 'Phan Đăng Lưu')
            WHEN 'Quận Bình Thạnh' THEN
                ELT(FLOOR(1 + RAND() * 8), 'Điện Biên Phủ', 'Phan Đăng Lưu', 'Nơ Trang Long', 'Nguyễn Công Hoan', 'Xô Viết Nghệ Tĩnh', 'Đinh Bộ Lĩnh', 'Bạch Đằng', 'Vạn Kiếp')
            WHEN 'Quận Gò Vấp' THEN
                ELT(FLOOR(1 + RAND() * 6), 'Quang Trung', 'Nguyễn Oanh', 'Phan Văn Trị', 'Lê Đức Thọ', 'Phạm Văn Đồng', 'Nguyễn Kiệm')
            ELSE 'Đường A'
        END,
        ', Phường ', FLOOR(1 + RAND() * 15),
        ', ', @district_name, -- Sử dụng biến session đã tính ở trên
        ', Thành phố Hồ Chí Minh, Việt Nam'
    ) AS address,
    CONCAT('Công ty ', CHAR(65 + FLOOR(RAND() * 26)), ' - ', ELT(FLOOR(1 + RAND() * 4), 'Kỹ sư', 'Kế toán', 'Giáo viên', 'Kinh doanh')) AS workInfo
FROM Users
WHERE role = 'parent' AND userID >= 11;


-- 3.3. TẠO DRIVER (LIÊN KẾT TỪ USERS ID 2-10)
-- *****************************************
INSERT INTO Driver (userID, fullName, phoneNumber, driverLicense, status, createdAt)
SELECT
    u.userID,
    u.fullName,
    u.phone AS phoneNumber,
    CONCAT(ELT(FLOOR(1 + RAND() * 2), 'B2', 'D'), '-', LPAD(FLOOR(100000 + RAND() * 900000), 6, '0')) AS driverLicense,
    'ACTIVE' AS status,
    u.createdAt
FROM Users u
WHERE u.role = 'driver' AND u.userID BETWEEN 2 AND 10
ORDER BY u.userID ASC;

-- 3.4. TẠO ROUTE (50 TUYẾN: ID 1-50)
-- =========================================
SET @route_row = 0;
INSERT INTO Route (routeName, description, estimatedTime)
SELECT
    CONCAT('Tuyến ', @route_row := @route_row + 1, ': Khu vực ',
        ELT(FLOOR(1 + RAND() * 10),
            'Quận 1', 'Quận 5', 'Quận 3', 'Quận 7', 'Quận 8',
            'Quận 10', 'Tân Bình', 'Phú Nhuận', 'Bình Thạnh', 'Gò Vấp'
        )
    ) AS routeName,
    CONCAT('Tuyến xe đưa đón học sinh số ', @route_row) AS description,
    FLOOR(20 + RAND() * 30) AS estimatedTime
FROM (
    SELECT a.n + b.n * 10 AS num
    FROM
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a,
        (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) b
    LIMIT 50
) route_numbers;

-- 3.5. TẠO BUS (15 XE BUS: ID 1-15)
-- =========================================
SET @bus_id = 0;
INSERT INTO Bus (licensePlate, capacity, model, status)
SELECT
    CONCAT('51A-', CHAR(65 + @bus_id), '-', LPAD(FLOOR(10000 + RAND() * 90000), 5, '0')) AS licensePlate,
    ELT(FLOOR(1 + RAND() * 3), 30, 45, 60) AS capacity,
    ELT(FLOOR(1 + RAND() * 4), 'Ford Transit', 'Hyundai County', 'Thaco Kinglong', 'Isuzu Samco') AS model,
    'active' AS status
FROM (
    SELECT @bus_id := @bus_id + 1 AS num
    FROM Users LIMIT 15
) bus_numbers;


-- 3.6. TẠO STUDENT (500 HỌC SINH - tương ứng 1:1 VỚI PARENT)
-- =========================================
SET @student_id = 0;
INSERT INTO Student (fullName, grade, schoolName, parentUserID, photoUrl)
SELECT
    CONCAT(ELT(FLOOR(1 + RAND() * 10), 'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Huỳnh', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hoàng'),
        ' ',
        ELT(FLOOR(1 + RAND() * 10), 'Minh', 'Thanh', 'Hải', 'Lan', 'Kim', 'Anh', 'Duy', 'Hương', 'Mai', 'Khoa'),
        ' ',
        CHAR(75 + FLOOR(RAND() * 26))
    ) AS fullName,
    ELT(FLOOR(1 + RAND() * 12), 'Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12') AS grade,
    ELT(FLOOR(1 + RAND() * 3), 'Trường Tiểu học ABC', 'Trường THCS XYZ', 'Trường THPT QRS') AS schoolName,
    p.parentID AS parentUserID,
    CONCAT('https://placehold.co/150x150/000000/FFFFFF?text=HS', @student_id := @student_id + 1) AS photoUrl
FROM Parent p
ORDER BY p.parentID ASC;

-- 3.7. TẠO ROUTEDETAIL (mỗi tuyến có 6 đường* 50 tuyến = 300 chi tiết)
-- =========================================
SET @detail_id = 0;
INSERT INTO RouteDetail (routeID, orderNumber, streetName, note, lat, lng)
SELECT
    r.routeID,
    stops.num AS orderNumber,
    ELT(FLOOR(1 + RAND() * 30),
        'Nguyễn Văn Linh', 'Đồng Khởi', 'Phạm Văn Đồng', 'Trường Chinh', 'Cộng Hòa',
        'Quang Trung', 'Nguyễn Oanh', 'Phan Văn Trị', 'Lê Đức Thọ', 'Phạm Hùng',
        'Lý Thường Kiệt', 'Cách Mạng Tháng Tám', 'Hoàng Văn Thụ', 'Phổ Quang', 'Út Tịch',
        'Nguyễn Huệ', 'Lê Lợi', 'Lê Duẩn', 'Nguyễn Đình Chiểu', 'Lý Chính Thắng',
        'Sư Vạn Hạnh', 'Nguyễn Chí Thanh', '3 Tháng 2', 'Điện Biên Phủ', 'Võ Văn Tần',
        'Nam Kỳ Khởi Nghĩa', 'Phan Đăng Lưu', 'Xô Viết Nghệ Tĩnh', 'Đinh Bộ Lĩnh', 'Bạch Đằng'
    ) AS streetName,
    CONCAT('Đoạn đường số ', stops.num) AS note,
    ROUND(10.70 + RAND() * 0.2, 7) AS lat,
    ROUND(106.60 + RAND() * 0.2, 7) AS lng
FROM Route r
JOIN (SELECT 1 AS num UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6) AS stops
WHERE @detail_id := @detail_id + 1
ORDER BY r.routeID, orderNumber;

-- 3.8. TẠO BUSSTOP (500 ĐIỂM DỪNG, LIÊN KẾT VỚI PARENT)
-- =========================================
SET @stop_seq = 0;
INSERT INTO BusStop (routeID, parentID, name, lat, lng, sequence, estimatedArrivalTime)
SELECT
    FLOOR(1 + RAND() * 50) AS routeID,
    p.parentID AS parentID,
    CONCAT('Điểm dừng: ', p.address) AS name,
    ROUND(10.70 + RAND() * 0.2, 7) AS lat,
    ROUND(106.60 + RAND() * 0.2, 7) AS lng,
    (@stop_seq := @stop_seq + 1) AS sequence,
    SEC_TO_TIME(25200 + ((@stop_seq * 5) % 3600)) AS estimatedArrivalTime
FROM Parent p
ORDER BY p.parentID ASC;

-- ***************************************************************
-- CẬP NHẬT: SỬA LỖI SEQUENCE ĐỂ ĐẢM BẢO DUY NHẤT TRONG TỪNG ROUTEID
-- ***************************************************************

-- Bước 1: Khởi tạo biến phiên
SET @current_route = NULL;
SET @seq_num = 0;

-- Bước 2: Tắt Safe Update Mode để cho phép cập nhật toàn bộ bảng mà không dùng WHERE trên KEY.
SET SQL_SAFE_UPDATES = 0;

-- Bước 3: Cập nhật SEQUENCE.
-- Sử dụng bảng tạm để giữ kết quả tính toán và sau đó JOIN để cập nhật.
UPDATE BusStop bs
INNER JOIN (
    SELECT
        busStopID,
        -- Tính toán sequence mới, reset về 1 nếu routeID thay đổi
        @seq_num := IF(@current_route = routeID, @seq_num + 1, 1) AS new_sequence,
        -- Gán giá trị routeID hiện tại cho biến @current_route để so sánh cho hàng tiếp theo
        @current_route := routeID
    FROM BusStop
    ORDER BY routeID, busStopID -- Đảm bảo thứ tự tính toán chính xác theo Route và BusStopID
) AS sub ON bs.busStopID = sub.busStopID
SET bs.sequence = sub.new_sequence;

-- Bước 4: Bật lại Safe Update Mode
SET SQL_SAFE_UPDATES = 1;


-- 3.9. TẠO TRIP (Lịch chạy từ 14/11/2025 đến 12/12/2025)
-- Số chuyến mỗi buổi ko vượt quá 9 do chỉ có 9 tài xế và ko dưới 5 chuyến
-- *****************************************
-- Tạo bảng tạm để chứa các ngày trong khoảng thời gian (29 ngày)
DROP TEMPORARY TABLE IF EXISTS TempDates;
CREATE TEMPORARY TABLE TempDates (
    tripDate DATE NOT NULL PRIMARY KEY
);

SET @start_date = '2025-11-14';
SET @end_date = '2025-12-12';

INSERT INTO TempDates (tripDate)
SELECT DATE_ADD(@start_date, INTERVAL numbers.num DAY)
FROM (
    SELECT a.n + b.n * 10 AS num
    FROM (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a,
             (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2) b
    LIMIT 30
) numbers
WHERE DATE_ADD(@start_date, INTERVAL numbers.num DAY) <= @end_date;

-- Tạo bảng tạm để chứa lịch trình thô
DROP TEMPORARY TABLE IF EXISTS ScheduledTrips;
CREATE TEMPORARY TABLE ScheduledTrips (
    tripDate DATE NOT NULL,
    session ENUM('Morning', 'Afternoon') NOT NULL,
    driverID INT NULL,
    routeID INT NULL,
    busID INT NULL
);

-- Tạo lịch trình cho mỗi ngày (5 chuyến sáng)
INSERT INTO ScheduledTrips (tripDate, session, driverID, routeID, busID)
SELECT
    td.tripDate,
    'Morning' AS session,
    d.userID AS driverID,
    (SELECT routeID FROM Route ORDER BY RAND() LIMIT 1) AS routeID,
    (SELECT busID FROM Bus ORDER BY RAND() LIMIT 1) AS busID
FROM TempDates td
JOIN Users d ON d.role = 'driver'
ORDER BY td.tripDate, RAND()
LIMIT 150;

-- Tạo lịch trình cho mỗi ngày (5 chuyến chiều)
INSERT INTO ScheduledTrips (tripDate, session, driverID, routeID, busID)
SELECT
    td.tripDate,
    'Afternoon' AS session,
    d.userID AS driverID,
    (SELECT routeID FROM Route ORDER BY RAND() LIMIT 1) AS routeID,
    (SELECT busID FROM Bus ORDER BY RAND() LIMIT 1) AS busID
FROM TempDates td
JOIN Users d ON d.role = 'driver'
ORDER BY td.tripDate, RAND()
LIMIT 150;


-- Insert actual trips into Trip table
INSERT INTO Trip (routeID, tripDate, startTime, endTime, assignedBusID, assignedDriverID, status)
SELECT
    st.routeID,
    st.tripDate,
    CASE st.session
        WHEN 'Morning' THEN '07:00:00'
        ELSE '16:30:00'
    END AS startTime,
    CASE st.session
        WHEN 'Morning' THEN '08:00:00'
        ELSE '17:30:00'
    END AS endTime,
    st.busID AS assignedBusID,
    d.driverID AS assignedDriverID,
    'PLANNED' AS status
FROM ScheduledTrips st
JOIN Driver d ON st.driverID = d.userID
ORDER BY st.tripDate, st.session;


-- 3.10. TẠO DRIVERASSIGNMENT (Dựa trên Trip)
-- *****************************************
-- LƯU Ý: Mỗi Trip sẽ tạo ra một DriverAssignment tương ứng.
INSERT INTO DriverAssignment (driverID, busID, routeID, assignmentDate, note)
SELECT
    t.assignedDriverID AS driverID,
    t.assignedBusID AS busID,
    t.routeID,
    t.tripDate AS assignmentDate,
    CONCAT(
        CASE
            WHEN t.startTime < '12:00:00' THEN 'Ca sáng' -- Xác định Ca sáng/chiều dựa vào startTime
            ELSE 'Ca chiều'
        END,
        ' - ',
        SUBSTRING_INDEX(r.routeName, ':', 1) -- Lấy 'Tuyến XX' từ RouteName
    ) AS note
FROM Trip t
JOIN Route r ON t.routeID = r.routeID
-- Đảm bảo thứ tự khi chèn: driverID -> ngày -> startTime (Ca sáng trước Ca chiều)
ORDER BY t.assignedDriverID, t.tripDate, t.startTime;


-- 3.11. TẠO BOARDINGRECORD (Ghi nhận đón trả học sinh cho các chuyến đã 'COMPLETED' hoặc 'RUNNING')
-- *****************************************

-- Tạo bảng tạm để chứa các chuyến hợp lệ
DROP TEMPORARY TABLE IF EXISTS AvailableTrips;
CREATE TEMPORARY TABLE AvailableTrips AS
SELECT tripID, routeID, assignedDriverID, tripDate
FROM Trip
WHERE status IN ('COMPLETED', 'RUNNING') AND tripDate < '2025-11-14'; -- Chỉ lấy chuyến đã chạy trước ngày hiện tại (14/11/2025)

-- Lấy ra danh sách (TripID, StudentID) cho việc chèn
INSERT INTO BoardingRecord (tripID, studentID, busStopID, pickupTime, dropoffTime, status, reportedBy)
SELECT
    t.tripID,
    s.studentID,
    bs.busStopID AS busStopID,
    CASE WHEN RAND() > 0.1 THEN DATE_ADD(t.tripDate, INTERVAL 7 HOUR) ELSE NULL END AS pickupTime,
    CASE WHEN RAND() > 0.5 THEN DATE_ADD(t.tripDate, INTERVAL 8 HOUR) ELSE NULL END AS dropoffTime,
    ELT(FLOOR(1 + RAND() * 4), 'NOT_PICKED', 'PICKED', 'DROPPED', 'ABSENT') AS status, -- Random trạng thái
    t.assignedDriverID AS reportedBy
FROM AvailableTrips t
-- Kỹ thuật JOIN với truy vấn con để lấy ngẫu nhiên một nhóm học sinh cho chuyến đi
JOIN (
    SELECT studentID, parentUserID, (SELECT routeID FROM Route ORDER BY RAND() LIMIT 1) AS randomRouteID
    FROM Student
    ORDER BY RAND()
    LIMIT 1000
) s ON s.randomRouteID = t.routeID
LEFT JOIN BusStop bs ON bs.parentID = s.parentUserID AND bs.routeID = t.routeID
GROUP BY t.tripID, s.studentID
ORDER BY t.tripID, s.studentID
LIMIT 2000;

-- ĐỐI VỚI CÁC CHUYẾN TRONG TƯƠNG LAI (từ 14/11/2025 trở đi)
DROP TEMPORARY TABLE IF EXISTS FutureTrips;
CREATE TEMPORARY TABLE FutureTrips AS
SELECT tripID, routeID, assignedDriverID, tripDate
FROM Trip
WHERE tripDate >= '2025-11-14';

INSERT INTO BoardingRecord (tripID, studentID, busStopID, status, reportedBy)
SELECT
    t.tripID,
    s.studentID,
    bs.busStopID AS busStopID,
    'NOT_PICKED' AS status, -- TRẠNG THÁI MẶC ĐỊNH CHO TƯƠNG LAI
    t.assignedDriverID AS reportedBy
FROM FutureTrips t
JOIN (
    SELECT studentID, parentUserID, (SELECT routeID FROM Route ORDER BY RAND() LIMIT 1) AS randomRouteID
    FROM Student
    ORDER BY RAND()
    LIMIT 1000
) s ON s.randomRouteID = t.routeID
LEFT JOIN BusStop bs ON bs.parentID = s.parentUserID AND bs.routeID = t.routeID
GROUP BY t.tripID, s.studentID
ORDER BY t.tripID, s.studentID
LIMIT 2000;


-- 4. KẾT THÚC VÀ KIỂM TRA DỮ LIỆU
-- *********************************************************************************
SET FOREIGN_KEY_CHECKS = 1;

-- DỌN DẸP
DROP TEMPORARY TABLE IF EXISTS TempDates;
DROP TEMPORARY TABLE IF EXISTS ScheduledTrips;
DROP TEMPORARY TABLE IF EXISTS AvailableTrips;
DROP TEMPORARY TABLE IF EXISTS FutureTrips;