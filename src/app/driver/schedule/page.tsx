"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";

interface ScheduleItem {
  tripID: number;
  date: string;
  route: string;
  startTime: string;
  endTime: string;
  status: string;
}

const PORT_SERVER = 8888;

export default function DriverSchedulePage() {
  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleItem[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const driverID = 1;

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/schedules/driver/${driverID}`);
      if (!res.ok) throw new Error("Không thể kết nối máy chủ");

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Dữ liệu trả về không hợp lệ");
      setWeeklySchedule(data);

      // So sánh ngày
      const today = new Date();
      const todayStr = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
      
      const todayItems = data.filter((item) => item.date === todayStr);
      setTodaySchedule(todayItems);
    } catch (err: any) {
      console.error("Lỗi fetch:", err);
      setError("Không thể tải dữ liệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [driverID]);

  // Hàm bắt đầu chuyến
  const handleStartTrip = async (tripID: number) => {
    if (!confirm("Xác nhận bắt đầu chuyến xe này?")) return;

    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/schedules/start/${tripID}`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Không thể bắt đầu chuyến");
      }

      const data = await res.json();
      alert(`${data.message}`);
      
      // Reload lại lịch
      await fetchSchedule();
    } catch (err: any) {
      console.error("Lỗi:", err);
      alert(`${err.message}`);
    }
  };

  // Hàm format 
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
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

  if (loading) return <p>Đang tải dữ liệu...</p>;
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
        {todaySchedule.length > 0 ? (
          <>
            {todaySchedule.map((schedule, index) => (
              <div 
                key={schedule.tripID} 
                style={{ 
                  marginBottom: "1rem", 
                  padding: "1rem", 
                  background: schedule.status === 'RUNNING' ? '#eff6ff' : '#f3f4f6',
                  borderRadius: "8px",
                  border: schedule.status === 'RUNNING' ? '2px solid #3b82f6' : '1px solid #e5e7eb'
                }}
              >
                <p><strong>Chuyến {index + 1}:</strong> {schedule.route}</p>
                <p>
                  <strong>Thời gian:</strong>{" "}
                  {formatTime(schedule.startTime, schedule.endTime)},{" "}
                  {formatDate(schedule.date)}
                </p>
                <p style={{ marginBottom: "0.5rem" }}>
                  <strong>Trạng thái:</strong>{" "}
                  <span style={{ 
                    color: schedule.status === 'COMPLETED' ? '#22c55e' : 
                           schedule.status === 'RUNNING' ? '#3b82f6' : '#6b7280',
                    fontWeight: "bold"
                  }}>
                    {schedule.status === 'COMPLETED' ? 'Đã hoàn thành' :
                     schedule.status === 'RUNNING' ? 'Đang chạy' : 'Đã lên lịch'}
                  </span>
                </p>
                
                {/* Button bắt đầu chuyến */}
                {schedule.status === 'PLANNED' && (
                  <button
                    onClick={() => handleStartTrip(schedule.tripID)}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.6rem 1.2rem",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "0.95rem"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
                  >
                    Bắt đầu
                  </button>
                )}
              </div>
            ))}
          </>
        ) : (
          <p>Hôm nay không có lịch làm việc.</p>
        )}
        <p style={{ marginTop: "1rem" }}>
          <a href="mailto:manager@ssb1.0.edu.vn">Liên hệ quản lý</a>
        </p>
      </div>
    </div>
  );
}