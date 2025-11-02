"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";

interface ScheduleItem {
  driverID: number;
  date: string;
  route: string;
  startTime: string;
  endTime: string;
}

const PORT_SERVER = 8888;

export default function DriverSchedulePage() {
  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleItem[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const driverID = 1; // Giả định đăng nhập tài xế ID = 1

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch(`http://localhost:${PORT_SERVER}/api/schedules/driver/${driverID}`);
        if (!res.ok) throw new Error("Không thể kết nối máy chủ");

        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("Dữ liệu trả về không hợp lệ");

        // Cập nhật lịch tuần
        setWeeklySchedule(data);

        // Tìm lịch hôm nay
        const today = new Date().toISOString().split("T")[0];
        const todayItem = data.find((item) => item.date.split("T")[0] === today);
        setTodaySchedule(todayItem || null);
      } catch (err: any) {
        console.error(" Lỗi fetch:", err);
        setError("Không thể tải dữ liệu từ máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [driverID]);

  // ================== HÀM HỖ TRỢ ==================
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (startTime: string, endTime: string) => {
    const formatHour = (time: string) => {
      if (!time) return "";
      const [hour, minute] = time.split(":").slice(0, 2);
      const h = parseInt(hour);
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayHour}:${minute} ${period}`;
    };
    return `${formatHour(startTime)} - ${formatHour(endTime)}`;
  };

  // ================== GIAO DIỆN HIỂN THỊ ==================
  if (loading) return <p>⏳ Đang tải dữ liệu...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.driverContainer}>
      {/* LỊCH TUẦN */}
      <div className={styles.schedule}>
        <h3>Lịch làm việc tuần này</h3>
        {weeklySchedule.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Tuyến đường</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {weeklySchedule.map((item, index) => (
                <tr key={index}>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.route}</td>
                  <td>{formatTime(item.startTime, item.endTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Không có lịch làm việc trong tuần.</p>
        )}
      </div>

      {/* LỊCH HÔM NAY */}
      <div className={styles.schedule}>
        <h3>Lịch làm việc hôm nay</h3>
        {todaySchedule ? (
          <>
            <p><strong>Tuyến đường:</strong> {todaySchedule.route}</p>
            <p>
              <strong>Thời gian:</strong>{" "}
              {formatTime(todaySchedule.startTime, todaySchedule.endTime)},{" "}
              {formatDate(todaySchedule.date)}
            </p>
          </>
        ) : (
          <p>Hôm nay không có lịch làm việc.</p>
        )}
        <p>
          <a href="mailto:manager@ssb1.0.edu.vn">Liên hệ quản lý</a>
        </p>
      </div>
    </div>
  );
}
