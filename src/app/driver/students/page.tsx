"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";

export default function DriverStudentsPage() {
  const [studentList, setStudentList] = useState<any[]>([]);
  const [tripInfo, setTripInfo] = useState<any>(null);
  const [allCompleted, setAllCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const driverID = 1;
  const PORT_SERVER = 8888;

  // Fetch danh sách học sinh
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:${PORT_SERVER}/api/students/driver/${driverID}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Không thể kết nối máy chủ");
      const data = await res.json();
      
      console.log("Data từ server:", data); // Debug
      
      // Kiểm tra nếu đã hoàn thành tất cả chuyến
      if (data.allCompleted) {
        setAllCompleted(true);
        setStudentList([]);
        setTripInfo(null);
        setError(null);
        setLoading(false);
        return;
      }
      
      // Tách thông tin chuyến xe và danh sách học sinh
      if (data.length > 0) {
        const firstStudent = data[0];
        const tripData = {
          tripID: firstStudent.tripID,
          tripDate: firstStudent.tripDate, // Đã là "YYYY-MM-DD" từ backend
          tripStartTime: firstStudent.tripStartTime,
          tripEndTime: firstStudent.tripEndTime,
          routeName: firstStudent.routeName,
          tripStatus: firstStudent.tripStatus
        };
        
        console.log("Trip date:", tripData.tripDate); // Debug
        
        setTripInfo(tripData);
        setStudentList(data);
        setAllCompleted(false);
      } else {
        setAllCompleted(true);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Kiểm tra trạng thái có được phép chuyển không
  const canChangeStatus = (currentStatus: string, newStatus: string): boolean => {
    const statusOrder = ["chua-don", "da-don", "da-tra", "vang-mat"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);
    
    if (newStatus === "vang-mat") return true;
    if (currentStatus === "vang-mat") return false;
    
    return newIndex > currentIndex;
  };

  // Cập nhật trạng thái học sinh
  const updateStudentStatus = async (studentID: number, currentStatus: string, newStatus: string) => {
    if (!canChangeStatus(currentStatus, newStatus)) {
      alert("Không thể quay lại trạng thái trước đó!");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:${PORT_SERVER}/api/students/status/${studentID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      console.log("✅ Server phản hồi:", data);

      // Kiểm tra chuyến đã hoàn thành
      if (data.tripCompleted) {
        alert("✅ Chuyến xe đã hoàn thành! Đang chuyển sang chuyến tiếp theo...");
        await fetchStudents();
      } else {
        // Cập nhật UI
        setStudentList((prev) =>
          prev.map((s) =>
            s.studentID === studentID ? { ...s, status: newStatus } : s
          )
        );
      }
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert("Không thể cập nhật trạng thái!");
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      "chua-don": "#6b7280",
      "da-don": "#3b82f6",
      "da-tra": "#22c55e",
      "vang-mat": "#f59e0b",
    };
    return colorMap[status] || "#000";
  };

  // Format ngày và giờ
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    // dateStr dạng "YYYY-MM-DD" 
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}`; // Hiển thị DD-MM
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5); // HH:MM
  };

  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;
  if (error) return <p style={{ color: "red" }}>❌ Lỗi: {error}</p>;
  
  // Hiển thị khi đã hoàn thành tất cả chuyến
  if (allCompleted) {
    return (
      <div className={styles.driverContainer}>
        <div className={styles.studentList}>
          <h3>🎉 Đã hoàn thành tất cả chuyến trong ngày</h3>
          <p style={{ color: "#22c55e", fontSize: "1.2rem", marginTop: "2rem" }}>
            Bạn đã hoàn thành xuất sắc công việc hôm nay!
          </p>
          <p style={{ marginTop: "1rem" }}>
            <a href="/driver/schedule">📅 Xem lịch làm việc tuần này</a>
          </p>
        </div>
      </div>
    );
  }
  
  // Kiểm tra không có chuyến xe
  if (!tripInfo) {
    return (
      <div className={styles.driverContainer}>
        <p>📭 Không có chuyến xe nào hôm nay.</p>
      </div>
    );
  }

  const completedStudents = studentList.filter(
    (s) => s.status === "da-don" || s.status === "da-tra"
  ).length;
  const absentStudents = studentList.filter(
    (s) => s.status === "vang-mat"
  ).length;

  return ( 
    <div className={styles.driverContainer}>
      <div className={styles.studentList}>
        <h3>
          Danh sách học sinh ngày {formatDate(tripInfo.tripDate)} ({formatTime(tripInfo.tripStartTime)} - {formatTime(tripInfo.tripEndTime)})
        </h3>
        <p style={{ marginBottom: "0.5rem", color: "#374151" }}>
          <strong>Tuyến:</strong> {tripInfo.routeName}
        </p>
        <p style={{ marginBottom: "1rem", color: "#374151" }}>
          <strong>Trạng thái:</strong> Đã đón {completedStudents}/
          {studentList.length} học sinh, {absentStudents} vắng mặt
        </p>

        {studentList.map((student) => (
          <div key={student.studentID} className={styles.studentItem}>
            <p>
              {student.studentName} – Lớp: {student.grade}
            </p>
            <select
              value={student.status}
              onChange={(e) =>
                updateStudentStatus(student.studentID, student.status, e.target.value)
              }
              style={{ 
                color: getStatusColor(student.status),
                fontWeight: "bold"
              }}
            >
              <option value="chua-don">Chưa đón</option>
              <option value="da-don">Đã đón</option>
              <option value="da-tra">Đã trả</option>
              <option value="vang-mat">Vắng mặt</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}