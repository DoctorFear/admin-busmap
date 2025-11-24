"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";

export default function DriverStudentsPage() {
  const router = useRouter();
  
  // Lấy driverID từ localStorage
  const [driverID, setDriverID] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [studentList, setStudentList] = useState<any[]>([]);
  const [tripInfo, setTripInfo] = useState<any>(null);
  const [allCompleted, setAllCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const PORT_SERVER = 8888;

  // Kiểm tra authentication và lấy driverID
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const storedDriverID = localStorage.getItem('userID');
    
    if (role !== 'driver' || !storedDriverID) {
      alert('Vui lòng đăng nhập với tài khoản tài xế!');
      router.push('/login');
      return;
    }
    
    setDriverID(parseInt(storedDriverID));
    setIsAuthLoading(false);
  }, [router]);

  // Lấy danh sách học sinh của tài xế
  const fetchStudents = async () => {
    if (!driverID) return; // THÊM: Đợi có driverID
    
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:${PORT_SERVER}/api/students/driver/${driverID}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Không thể kết nối máy chủ");

      const data = await res.json();

      // Kiểm tra nếu chuyến xe đã hoàn thành hết
      if (data.allCompleted === true) {
        setAllCompleted(true);
        setStudentList([]);
        setTripInfo(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Tách thông tin chuyến xe và danh sách học sinh
      if (Array.isArray(data) && data.length > 0) {
        const firstStudent = data[0];
        const tripData = {
          tripID: firstStudent.tripID,
          tripDate: firstStudent.tripDate,
          tripStartTime: firstStudent.tripStartTime,
          tripEndTime: firstStudent.tripEndTime,
          routeName: firstStudent.routeName,
          tripStatus: firstStudent.tripStatus,
        };
        setTripInfo(tripData);
        setStudentList(data);
        setAllCompleted(false);
      } else {
        setAllCompleted(true);
      }

      setError(null);
    } catch (err: any) {
      console.error("Lỗi fetch:", err);
      setError(err.message || "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  // THÊM: useEffect chỉ chạy khi có driverID
  useEffect(() => {
    if (driverID) {
      fetchStudents();
    }
  }, [driverID]);

  // Kiểm tra trạng thái có thể chuyển đổi hợp lệ hay không
  const canChangeStatus = (currentStatus: string, newStatus: string): boolean => {
    const statusOrder = ["chua-don", "da-don", "da-tra", "vang-mat"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);

    if (currentStatus === "vang-mat" || currentStatus === "da-tra") return false;
    if (currentStatus === "chua-don" && newStatus === "da-tra") return false;
    if (currentStatus === "da-don" && newStatus === "vang-mat") return false;
    return newIndex > currentIndex;
  };

  // Cập nhật trạng thái học sinh
  const updateStudentStatus = async (
    studentID: number,
    currentStatus: string,
    newStatus: string
  ) => {
    if (!canChangeStatus(currentStatus, newStatus)) {
      alert("Trạng thái được chọn không hợp lệ!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/students/status/${studentID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      console.log("Server phản hồi:", data);

      // Nếu chuyến xe đã hoàn thành
      if (data.tripCompleted === true) {
        alert("Chuyến xe đã hoàn thành! Đang chuyển sang chuyến tiếp theo...");
        await fetchStudents();
      } else {
        // Cập nhật giao diện nếu chuyến chưa hoàn thành
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

  // Trả về màu sắc dựa theo trạng thái
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
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}`;
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5);
  };

  // THÊM: Loading khi kiểm tra auth
  if (isAuthLoading) {
    return <p>Đang tải thông tin tài xế...</p>;
  }

  // Hiển thị khi đang tải
  if (loading) return <p>Đang tải dữ liệu...</p>;

  // Hiển thị lỗi nếu có
  if (error) return <p style={{ color: "red" }}>Lỗi: {error}</p>;

  // Khi đã hoàn thành tất cả chuyến
  if (allCompleted) {
    return (
      <div className={styles.driverContainer}>
        <div className={styles.studentList}>
          <h3>Đã hoàn thành tất cả chuyến trong ngày</h3>
          <p
            style={{
              color: "#22c55e",
              fontSize: "1.2rem",
              marginTop: "2rem",
            }}
          >
            Bạn đã hoàn thành xuất sắc công việc hôm nay!
          </p>
          <p style={{ marginTop: "1rem" }}>
            <a href="/driver/schedule">Xem lịch làm việc tuần này</a>
          </p>
        </div>
      </div>
    );
  }

  // Khi không có chuyến xe nào trong ngày
  if (!tripInfo) {
    return (
      <div className={styles.driverContainer}>
        <p>Không có chuyến xe nào hôm nay.</p>
      </div>
    );
  }

  // Tính số học sinh đã đón và vắng mặt
  const completedStudents = studentList.filter(
    (s) => s.status === "da-don" || s.status === "da-tra"
  ).length;
  const absentStudents = studentList.filter(
    (s) => s.status === "vang-mat"
  ).length;

  // Hiển thị danh sách học sinh
  return (<div className={styles.driverContainer}>
      <div className={styles.studentList}>
        <h3>
          Danh sách học sinh ngày {formatDate(tripInfo.tripDate)} (
          {formatTime(tripInfo.tripStartTime)} -{" "}
          {formatTime(tripInfo.tripEndTime)})
        </h3>

        <p style={{ marginBottom: "0.5rem", color: "#374151" }}>
          <strong>Tuyến đường:</strong> {tripInfo.routeName}
        </p>

        <p style={{ marginBottom: "1rem", color: "#374151" }}>
          <strong>Trạng thái:</strong> Đã đón {completedStudents}/
          {studentList.length} học sinh, {absentStudents} vắng mặt
        </p>

        {studentList.map((student) => (
          <div key={student.studentID} className={styles.studentItem}>
            <p>
              {student.studentName}  –  {student.grade}  –  {student.address}
            <img></img></p>

            <select
              value={student.status}
              onChange={(e) =>
                updateStudentStatus(
                  student.studentID,
                  student.status,
                  e.target.value
                )
              }
              style={{
                color: getStatusColor(student.status),
                fontWeight: "bold",
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