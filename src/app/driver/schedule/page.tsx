"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  
  // Lấy driverID từ localStorage
  const [driverID, setDriverID] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleItem[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Kiểm tra authentication và lấy driverID
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const storedDriverID = localStorage.getItem('driverID');
    
    if (role !== 'driver' || !storedDriverID) {
      alert('Vui lòng đăng nhập với tài khoản tài xế!');
      router.push('/login');
      return;
    }
    
    setDriverID(parseInt(storedDriverID));
    setIsAuthLoading(false);
  }, [router]);

  // Lấy dữ liệu lịch trình
  const fetchSchedule = async () => {
    if (!driverID) return; // THÊM: Đợi có driverID
    
    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/schedules/driver/${driverID}`);
      if (!res.ok) throw new Error("Không thể kết nối máy chủ");

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Dữ liệu trả về không hợp lệ");

      setWeeklySchedule(data);

      // Lọc ra lịch hôm nay
      const today = new Date();
      const todayStr =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

      const todayItems = data.filter((item) => item.date === todayStr);
      setTodaySchedule(todayItems);
    } catch (err: any) {
      console.error("Lỗi fetch:", err);
      setError("Không thể tải dữ liệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  // THÊM: useEffect chỉ chạy khi có driverID
  useEffect(() => {
    if (driverID) {
      fetchSchedule();
    }
  }, [driverID]);

  // Hàm bắt đầu chuyến xe
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

      // Tải lại lịch sau khi bắt đầu chuyến
      await fetchSchedule();
    } catch (err: any) {
      console.error("Lỗi:", err);
      alert(`${err.message}`);
    }
  };

  // Hàm format ngày
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // Hàm format thời gian
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

  // THÊM: Loading khi kiểm tra auth
  if (isAuthLoading) {
    return <p>Đang tải thông tin tài xế...</p>;
  }

  // Hiển thị giao diện
  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.driverContainer}>
      {/* Lịch tuần */}
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
                  <td>{formatDate(item.date)}<a></a></td>
                  <td>{item.route}<a></a></td>
                  <td>{formatTime(item.startTime, item.endTime)}<a></a></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Không có lịch làm việc trong tuần.</p>
        )}
      </div>

      {/* Lịch hôm nay */}
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
                  background: schedule.status === "RUNNING" ? "#eff6ff" : "#f3f4f6",
                  borderRadius: "8px",
                  border:
                    schedule.status === "RUNNING"
                      ? "2px solid #3b82f6"
                      : "1px solid #e5e7eb",
                }}
              >
                <div style={{ marginBottom: "0.8rem",display: "flex", gap: "0.3rem" }}>
                  <p style={{ margin: 0 }}>
                    <strong>Chuyến {index + 1}:</strong>
                  </p>
                  <p style={{ margin: 0 }}>{schedule.route}<img></img></p>
                </div>

                <p>
                  <strong>Thời gian:</strong>{" "}
                  {formatTime(schedule.startTime, schedule.endTime)},{" "}
                  {formatDate(schedule.date)}
                </p>
                <p style={{ marginBottom: "0.5rem" }}>
                  <strong>Trạng thái:</strong>{" "}
                  <span
                    style={{
                      color:
                        schedule.status === "COMPLETED"
                          ? "#22c55e"
                          : schedule.status === "RUNNING"
                          ? "#3b82f6"
                          : "#6b7280",
                      fontWeight: "bold",
                    }}
                  >
                    {schedule.status === "COMPLETED"
                      ? "Đã hoàn thành"
                      : schedule.status === "RUNNING"
                      ? "Đang chạy"
                      : "Đã lên lịch"}
                  </span>
                </p>

                {/* Nút bắt đầu chuyến */}
                {schedule.status === "PLANNED" && (
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
                      fontSize: "0.95rem",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2563eb")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#3b82f6")
                    }
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

      </div>
    </div>
  );
}