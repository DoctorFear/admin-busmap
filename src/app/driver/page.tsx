"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface ScheduleItem {
  tripID: number;
  date: string;
  route: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface DriverStudent {
  studentID: number;
  studentName: string;
  grade: string;
  address: string;
  pickupLocation: string;
  status: string;
  tripID: number;
  tripDate: string;
  tripStartTime: string;
  tripEndTime: string;
  routeName: string;
  tripStatus: string;
}

const PORT_SERVER = 8888;

export default function DriverPage() {
  const router = useRouter();
  
  // Lấy driverID từ localStorage
  const [driverID, setDriverID] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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

  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleItem[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState("");

  const fetchSchedule = async () => {
    if (!driverID) return;
    
    setScheduleLoading(true);
    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/schedules/driver/${driverID}`);
      if (!res.ok) throw new Error("Không thể kết nối máy chủ");
      const data: ScheduleItem[] = await res.json();
      setWeeklySchedule(data);

      const today = new Date();
      const todayStr =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");

      const todayItems = data.filter(item => item.date === todayStr);
      setTodaySchedule(todayItems);
      setScheduleError("");
    } catch (err: any) {
      console.error("Lỗi fetch lịch:", err);
      setScheduleError(err.message || "Lỗi không xác định");
    } finally {
      setScheduleLoading(false);
    }
  };

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
      await fetchSchedule();
    } catch (err: any) {
      console.error("Lỗi:", err);
      alert(err.message);
    }
  };

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

  const [studentList, setStudentList] = useState<DriverStudent[]>([]);
  const [tripInfo, setTripInfo] = useState<DriverStudent | null>(null);
  const [allCompleted, setAllCompleted] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");

  const fetchStudents = async () => {
    if (!driverID) return;
    
    setStudentsLoading(true);
    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/students/driver/${driverID}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Không thể kết nối máy chủ");
      const data = await res.json();

      if (data.allCompleted === true) {
        setAllCompleted(true);
        setStudentList([]);
        setTripInfo(null);
        setStudentsError("");
        return;
      }

      if (Array.isArray(data) && data.length > 0) {
        setTripInfo(data[0]);
        setStudentList(data);
        setAllCompleted(false);
      } else {
        setAllCompleted(true);
      }
      setStudentsError("");
    } catch (err: any) {
      console.error("Lỗi fetch học sinh:", err);
      setStudentsError(err.message || "Lỗi không xác định");
    } finally {
      setStudentsLoading(false);
    }
  };

  // useEffect chỉ chạy khi có driverID
  useEffect(() => {
    if (driverID) {
      fetchSchedule();
      fetchStudents();
    }
  }, [driverID]);

  const canChangeStatus = (current: string, next: string) => {
    const order = ["chua-don", "da-don", "da-tra", "vang-mat"];
    const currentIndex = order.indexOf(current);
    const nextIndex = order.indexOf(next);
  
    if (current === "vang-mat" || current === "da-tra") return false;
    if (current === "chua-don" && next === "da-tra") return false;
    if (current === "da-don" && next === "vang-mat") return false;

    return nextIndex > currentIndex;
  };

  const updateStudentStatus = async (studentID: number, currentStatus: string, newStatus: string) => {
    if (!canChangeStatus(currentStatus, newStatus)) {
      alert("Trạng thái được chọn không hợp lệ!");
      return;
    }
    try {
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/students/status/${studentID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      if (data.tripCompleted) {
        alert("Chuyến xe đã hoàn thành! Đang chuyển sang chuyến tiếp theo...");
        await fetchStudents();
      } else {
        setStudentList(prev => prev.map(s => s.studentID === studentID ? { ...s, status: newStatus } : s));
      }
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert("Không thể cập nhật trạng thái!");
    }
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'chua-don': '#6b7280',
      'da-don': '#3b82f6',
      'da-tra': '#22c55e',
      'vang-mat': '#f59e0b'
    };
    return colorMap[status] || '#000';
  };

  const completedStudents = studentList.filter(s => s.status === 'da-don' || s.status === 'da-tra').length;
  const absentStudents = studentList.filter(s => s.status === 'vang-mat').length;

  const [alertMessage, setAlertMessage] = useState('');
  const [alerts, setAlerts] = useState(['Kẹt xe tại ngã tư Lê Lợi - 6:45 AM, 19/09/2025']);

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertMessage.trim()) {
      const newAlert = `${alertMessage} - ${new Date().toLocaleString('vi-VN')}`;
      setAlerts(prev => [newAlert, ...prev]);
      setAlertMessage('');
    }
  };

  // Loading khi kiểm tra auth
  if (isAuthLoading) {
    return (
      <div className={styles.driverContainer}>
        <p>Đang tải thông tin tài xế...</p>
      </div>
    );
  }

  return (
    <div className={styles.driverContainer}>
      <div className={styles.mapSection}>
        <h3>Theo dõi hành trình</h3>
        <div className={styles.mapPlaceholder}>
          Bản đồ thời gian thực (Google Maps API sẽ được tích hợp)
          <div className={styles.mapControls}>
            <button>Phóng to</button>
            <button>Thu nhỏ</button>
            <button>Tắt theo dõi</button>
          </div>
        </div>

        <div className={styles.schedule}>
          <h3>Lịch làm việc hôm nay</h3>
          {scheduleLoading ? <p>Đang tải dữ liệu...</p> :
            scheduleError ? <p style={{ color: 'red' }}>{scheduleError}</p> :
            todaySchedule.length > 0 ? todaySchedule.map((item,index) => (
              <div key={item.tripID} style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: item.status === 'RUNNING' ? '#eff6ff' : '#f3f4f6',
                borderRadius: 8,
                border: item.status === 'RUNNING' ? '2px solid #3b82f6' : '1px solid #e5e7eb'
              }}>
                <div style={{ marginBottom: "0.8rem",display: "flex", gap: "0.3rem" }}>
                  <p style={{ margin: 0 }}>
                    <strong>Chuyến {index + 1}:</strong>
                  </p>
                  <p style={{ margin: 0 }}>{item.route}<img></img></p>
                </div>

                <p><strong>Thời gian: </strong>{formatTime(item.startTime, item.endTime)}, {formatDate(item.date)}</p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <span style={{
                    color: item.status === 'COMPLETED' ? '#22c55e' :
                           item.status === 'RUNNING' ? '#3b82f6' : '#6b7280',
                    fontWeight: 'bold'
                  }}>
                    {item.status === 'COMPLETED' ? 'Đã hoàn thành' :
                     item.status === 'RUNNING' ? 'Đang chạy' : 'Đã lên lịch'}
                  </span>
                </p>
                {item.status === 'PLANNED' && (
                  <button onClick={() => handleStartTrip(item.tripID)} style={{
                    marginTop: '0.5rem',
                    padding: '0.6rem 1.2rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#2563eb'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#3b82f6'}
                  >
                    Bắt đầu
                  </button>
                )}
              </div>
            )) : <p>Hôm nay không có lịch làm việc.</p>
          }
        </div>
      </div>

      <div className={styles.schedule}>
        <h3>Lịch làm việc tuần này</h3>
        {scheduleLoading ? <p>Đang tải dữ liệu...</p> :
          scheduleError ? <p style={{ color: 'red' }}>{scheduleError}</p> :
          weeklySchedule.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Tuyến đường</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {weeklySchedule.map(item => (
                  <tr key={item.tripID}>
                    <td>{formatDate(item.date)}<a></a></td>
                    <td>{item.route}<a></a></td>
                    <td>{formatTime(item.startTime, item.endTime)}<a></a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Không có lịch làm việc trong tuần.</p>
        }
      </div>

      <div className={styles.studentList}>
        <h3>Danh sách học sinh</h3>
        {studentsLoading ? <p>Đang tải dữ liệu...</p> :
          studentsError ? <p style={{ color: 'red' }}>Lỗi: {studentsError}</p> :
          allCompleted ? (
            <p style={{ color: "#22c55e", fontSize: '1.2rem' }}>Đã hoàn thành tất cả chuyến trong ngày</p>
          ) : tripInfo ? (
            <>
              <p style={{ marginBottom: '0.5rem', color: '#374151' }}>
                <strong>Tuyến đường:</strong> {tripInfo.routeName}
              </p>
              <p style={{ marginBottom: '1rem', color: '#374151' }}>
                <strong>Trạng thái:</strong> Đã đón {completedStudents}/{studentList.length} học sinh, {absentStudents} vắng mặt
              </p>
              {studentList.map(student => (
                <div key={student.studentID} className={styles.studentItem}>
                  <p>{student.studentName} – {student.grade} – {student.address}<img></img></p>
                  <select
                    value={student.status}
                    onChange={(e) => updateStudentStatus(student.studentID, student.status, e.target.value)}
                    style={{ color: getStatusColor(student.status), fontWeight: 'bold' }}
                  >
                    <option value="chua-don">Chưa đón</option>
                    <option value="da-don">Đã đón</option>
                    <option value="da-tra">Đã trả</option>
                    <option value="vang-mat">Vắng mặt</option>
                  </select>
                </div>
              ))}
            </>
          ) : <p>Không có chuyến xe hôm nay.</p>
        }
      </div>

      <div className={styles.alerts}>
        <h3>Gửi cảnh báo</h3>
        <form className={styles.alertForm} onSubmit={handleAlertSubmit}>
          <label htmlFor="alert-message">Mô tả sự cố:</label>
          <textarea
            id="alert-message"
            placeholder="Ví dụ: Kẹt xe, hỏng xe"
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
          />
          <button type="submit">Gửi cảnh báo</button>
        </form>
        <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Lịch sử cảnh báo</h3>
        {alerts.map((alert, index) => (
          <div key={index} className={styles.alertItem}>{alert}</div>
        ))}
      </div>

    </div>
  );
}