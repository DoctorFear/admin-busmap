"use client";

import { useState, useEffect } from "react";
import styles from "../page.module.css";

export default function DriverStudentsPage() {
  const [studentList, setStudentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const driverID = 1; 
  const PORT_SERVER = 8888; 

  // Lấy danh sách học sinh từ server
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `http://localhost:${PORT_SERVER}/api/students/driver/${driverID}`
        );

        if (!res.ok) throw new Error("Không thể kết nối máy chủ");
        const data = await res.json();
        setStudentList(data);
      } catch (err: any) {
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const updateStudentStatus = (studentID: number, newStatus: string) => {
    setStudentList((prev) =>
      prev.map((student) =>
        student.studentID === studentID
          ? { ...student, status: newStatus }
          : student
      )
    );
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      "chua-don": "#6b7280",
      "da-don": "#16a34a",
      "dang-tren-xe": "#3b82f6",
      "da-tra": "#22c55e",
      "vang-mat": "#f59e0b",
      "su-co": "#dc2626",
    };
    return colorMap[status] || "#000";
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p style={{ color: "red" }}>Lỗi: {error}</p>;

  const completedStudents = studentList.filter(
    (s) =>
      s.status === "da-don" ||
      s.status === "dang-tren-xe" ||
      s.status === "da-tra"
  ).length;
  const absentStudents = studentList.filter((s) => s.status === "vang-mat").length;

  return (
    <div className={styles.driverContainer}>
      <div className={styles.studentList}>
        <h3>Danh sách học sinh</h3>
        <p style={{ marginBottom: "1rem", color: "#374151" }}>
          <strong>Trạng thái:</strong> Đã đón {completedStudents}/{studentList.length} học sinh,{" "}
          {absentStudents} vắng mặt
        </p>

        {studentList.map((student) => (
          <div key={student.studentID} className={styles.studentItem}>
            <p>
              {student.studentName} - Điểm đón: {student.routeName || "Chưa xác định"}
            </p>
            <select
              value={student.status || "chua-don"}
              onChange={(e) =>
                updateStudentStatus(student.studentID, e.target.value)
              }
              style={{ color: getStatusColor(student.status) }}
            >
              <option value="chua-don">Chưa đón</option>
              <option value="da-don">Đã đón</option>
              <option value="dang-tren-xe">Đang trên xe</option>
              <option value="da-tra">Đã trả</option>
              <option value="vang-mat">Vắng mặt</option>
              <option value="su-co">Sự cố</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
