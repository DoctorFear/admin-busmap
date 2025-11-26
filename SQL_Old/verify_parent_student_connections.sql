-- ============================================================
-- Database Verification Script for Parent-Student Connections
-- ============================================================
-- Run these queries to verify parent-student relationships

-- 1. QUICK CHECK: Are all parents connected to students?
SELECT 
  'Parent-Student Connection Status' as 'Kiểm tra',
  COUNT(DISTINCT p.parentID) as 'Tổng phụ huynh',
  SUM(CASE WHEN s.studentID IS NOT NULL THEN 1 ELSE 0 END) as 'Phụ huynh có học sinh',
  SUM(CASE WHEN s.studentID IS NULL THEN 1 ELSE 0 END) as 'Phụ huynh KHÔNG có học sinh'
FROM Parent p
LEFT JOIN Student s ON p.parentID = s.parentUserID;

-- 2. Show parents WITH and WITHOUT students
SELECT 
  p.parentID,
  u.fullName as 'Tên phụ huynh',
  u.email,
  u.phone,
  u.role,
  s.studentID,
  s.fullName as 'Tên học sinh',
  CASE 
    WHEN s.studentID IS NULL THEN 'KHÔNG CÓ'
    ELSE 'CÓ'
  END as 'Trạng thái'
FROM Parent p
JOIN Users u ON p.parentID = u.userID
LEFT JOIN Student s ON p.parentID = s.parentUserID
ORDER BY u.fullName
LIMIT 20;

-- 3. Sample: Get 5 parents with full student details
SELECT 
  u.userID as 'User ID',
  u.fullName as 'Tên phụ huynh',
  u.email,
  u.phone,
  s.studentID,
  s.fullName as 'Tên học sinh',
  s.grade as 'Lớp',
  s.schoolName as 'Trường'
FROM Parent p
JOIN Users u ON p.parentID = u.userID
LEFT JOIN Student s ON p.parentID = s.parentUserID
WHERE s.studentID IS NOT NULL
LIMIT 5;

-- 4. For a specific trip, show all students and their parents
SELECT 
  t.tripID,
  t.tripDate,
  r.routeName,
  COUNT(DISTINCT s.studentID) as 'Số học sinh',
  GROUP_CONCAT(DISTINCT s.fullName ORDER BY s.fullName) as 'Danh sách học sinh',
  GROUP_CONCAT(DISTINCT u.fullName ORDER BY u.fullName) as 'Danh sách phụ huynh',
  GROUP_CONCAT(DISTINCT u.email) as 'Email phụ huynh'
FROM Trip t
LEFT JOIN Route r ON t.routeID = r.routeID
LEFT JOIN BoardingRecord br ON t.tripID = br.tripID
LEFT JOIN Student s ON br.studentID = s.studentID
LEFT JOIN Parent p ON s.parentUserID = p.parentID
LEFT JOIN Users u ON p.parentID = u.userID
WHERE t.tripID = 5
GROUP BY t.tripID;

-- 5. Count students per trip to verify BoardingRecord is populated
SELECT 
  t.tripID,
  t.tripDate,
  r.routeName,
  COUNT(br.recordID) as 'Số học sinh đã ghi danh',
  COUNT(DISTINCT u.userID) as 'Số phụ huynh sẽ nhận thông báo'
FROM Trip t
LEFT JOIN Route r ON t.routeID = r.routeID
LEFT JOIN BoardingRecord br ON t.tripID = br.tripID
LEFT JOIN Student s ON br.studentID = s.studentID
LEFT JOIN Parent p ON s.parentUserID = p.parentID
LEFT JOIN Users u ON p.parentID = u.userID
WHERE t.tripDate >= CURDATE()
GROUP BY t.tripID
ORDER BY t.tripDate, t.startTime
LIMIT 20;

-- 6. Verify parent contact information is complete
SELECT 
  COUNT(*) as 'Tổng phụ huynh',
  SUM(CASE WHEN u.email IS NOT NULL THEN 1 ELSE 0 END) as 'Có email',
  SUM(CASE WHEN u.phone IS NOT NULL THEN 1 ELSE 0 END) as 'Có số điện thoại',
  SUM(CASE WHEN u.email IS NOT NULL AND u.phone IS NOT NULL THEN 1 ELSE 0 END) as 'Có cả email và SĐT'
FROM Parent p
JOIN Users u ON p.parentID = u.userID;

-- 7. Check for duplicate parent-student relationships (should be 0)
SELECT 
  s.parentUserID,
  COUNT(*) as 'Số học sinh',
  GROUP_CONCAT(s.studentID) as 'Student IDs'
FROM Student s
WHERE s.parentUserID IS NOT NULL
GROUP BY s.parentUserID
HAVING COUNT(*) > 1;

-- 8. Verify all drivers are assigned to trips
SELECT 
  d.driverID,
  u.fullName as 'Tên tài xế',
  COUNT(t.tripID) as 'Số chuyến xe',
  COUNT(DISTINCT br.studentID) as 'Tổng số học sinh'
FROM Driver d
JOIN Users u ON d.userID = u.userID
LEFT JOIN Trip t ON d.driverID = t.assignedDriverID AND t.tripDate >= CURDATE()
LEFT JOIN BoardingRecord br ON t.tripID = br.tripID
GROUP BY d.driverID
ORDER BY COUNT(t.tripID) DESC
LIMIT 10;

-- 9. Test: Find all parents who should receive alert for Trip 5
SELECT 
  br.tripID,
  s.studentID,
  s.fullName as 'Học sinh',
  p.parentID,
  u.userID as 'Parent User ID',
  u.fullName as 'Phụ huynh',
  u.email,
  u.phone,
  u.role
FROM BoardingRecord br
JOIN Student s ON br.studentID = s.studentID
JOIN Parent p ON s.parentUserID = p.parentID
JOIN Users u ON p.parentID = u.userID
WHERE br.tripID = 5 AND s.parentUserID IS NOT NULL
ORDER BY s.fullName;

-- 10. Summary Report
SELECT 
  '==== DATABASE SUMMARY REPORT ====' as '',
  '' as ''
UNION ALL
SELECT CONCAT('Total Users: ', COUNT(*)), '' FROM Users
UNION ALL
SELECT CONCAT('Total Parents: ', COUNT(*)), '' FROM Parent
UNION ALL
SELECT CONCAT('Total Students: ', COUNT(*)), '' FROM Student
UNION ALL
SELECT CONCAT('Total Drivers: ', COUNT(*)), '' FROM Driver
UNION ALL
SELECT CONCAT('Total Trips: ', COUNT(*)), '' FROM Trip
UNION ALL
SELECT CONCAT('Total BoardingRecords: ', COUNT(*)), '' FROM BoardingRecord
UNION ALL
SELECT CONCAT('Total Notifications: ', COUNT(*)), '' FROM Notification
UNION ALL
SELECT CONCAT('Total Alerts: ', COUNT(*)), '' FROM Alert;
