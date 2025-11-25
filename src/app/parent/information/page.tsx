'use client';

import React, { useState, useEffect, ChangeEvent, JSX } from 'react';
import { Upload } from 'lucide-react';
import styles from './page.module.css';
import { useRouter } from "next/navigation";

interface StudentInfo {
  studentID: number;
  studentName: string;
  schoolName: string;
  pickupPoint: string;
  photoUrl: string;
}

export default function Information(): JSX.Element {
  const router = useRouter();
  const PORT_SERVER = 8888;
  // Lấy parentID từ localStorage
  const [parentID, setParentID] = useState<number | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [preview, setPreview] = useState<string>('/default-avatar.png'); // ảnh mặc định
  const [pickupPoint, setPickupPoint] = useState<string>('');
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  
  // Lấy parentID
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const storedParentID = localStorage.getItem('userID');

    if (role !== "parent" || !storedParentID) {
      alert("Vui lòng đăng nhập bằng tài khoản phụ huynh!");
      router.push("/login");
      return;
    }
    setParentID(parseInt(storedParentID));
    setIsAuthLoading(false);
  }, [router]);

  // Lấy thông tin học sinh theo parentID
  useEffect(() => {
    if (!parentID) return;

    const fetchStudentInfo = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:${PORT_SERVER}/api/students/parent/${parentID}`);
        if (!res.ok) {
          const errorText = await res.text();
          console.log("Backend returned (NOT JSON):", errorText);
          throw new Error("Không thể tải thông tin học sinh (response không phải JSON)");
        }
        const data: StudentInfo = await res.json();
        setStudent(data);
        setPickupPoint(data.pickupPoint || "");
        if (data.photoUrl) setPreview(data.photoUrl);

        setError(null);
      } catch (err: any) {
        console.error("Lỗi fetch student:", err);
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInfo();
  }, [parentID]);

  // Upload ảnh
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file || !student) return;

  const formData = new FormData();
  formData.append('photo', file);

  try {
    const res = await fetch(`http://localhost:8888/api/students/photo/${student.studentID}`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error("Không thể upload ảnh");

    const data = await res.json();
    
    // Cập nhật preview và state student
    const newPhotoUrl = `${data.photoUrl}?t=${Date.now()}`;
    
    setPreview(newPhotoUrl);
    setStudent(prev => prev ? { ...prev, photoUrl: data.photoUrl } : prev);

  } catch (err: any) {
    alert(err.message);
  }
};

  const handlePickupChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPickupPoint(e.target.value);
  };

  const handleUpdate = async () => {
    if (!parentID) {
      alert('Không tìm thấy thông tin parent!');
      return;
    }
  
    try {
      setUpdating(true);
      // Fetch profile hiện tại
      const profileRes = await fetch(`http://localhost:${PORT_SERVER}/api/parents/profile/${parentID}`);
      const currentProfile = await profileRes.json();
      // Merge với address mới
      const res = await fetch(`http://localhost:${PORT_SERVER}/api/parents/profile/${parentID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: currentProfile.fullName,
          email: currentProfile.email,
          phone: currentProfile.phone,
          address: pickupPoint, // CHỈ ĐỔI ADDRESS
          workInfo: currentProfile.workInfo
        })
      });
    
      if (!res.ok) throw new Error('Không thể cập nhật');
      alert('Cập nhật điểm đón thành công!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (isAuthLoading) return <div className={styles.mainContent}><p>Đang tải thông tin phụ huynh...</p></div>;
  if (loading) return <div className={styles.mainContent}><p>Đang tải thông tin học sinh...</p></div>;
  if (error) return <div className={styles.mainContent}><p style={{ color: 'red' }}>Lỗi: {error}</p></div>;
  if (!student) return <div className={styles.mainContent}><p>Không tìm thấy thông tin học sinh.</p></div>;

  return (
    <div className={styles.mainContent}>
      <div className={styles.informationCard}>
        <h3 className={styles.title}>Thông tin học sinh</h3>
        <div className={styles.infoContainer}>
          {/* Bên trái: ảnh */}
          <div className={styles.avatarSection}>
            <img src={preview} alt="Ảnh học sinh" className={styles.studentAvatar} />
            <label htmlFor="avatar-upload" className={styles.uploadBtn}>
              <Upload size={18} /> Tải ảnh lên
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </div>
          {/* Bên phải: thông tin */}
          <div className={styles.studentDetails}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", color: "#374151" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <span style={{ fontWeight: "bold" }}>Tên:</span>
                <span data-no-translate>{student.studentName}</span>
              </div>
              <div style={{ marginTop: '0.3rem', display: "flex", gap: "1rem" }}>
                <span style={{ fontWeight: "bold" }}>Điểm đón:</span>
                <span data-no-translate>{pickupPoint}</span>
              </div>
              <div style={{ marginTop: '0.3rem', display: "flex", gap: "1rem" }}>
                <span style={{ fontWeight: "bold" }}>Điểm trả:</span>
                <span data-no-translate>{student.schoolName}</span>
              </div>
            </div>
            {/* Form cập nhật điểm đón ở phía dưới */}
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="pickup" style={{ fontWeight: 'bold' }}>Cập nhật điểm đón:</label>
              <input
                id="pickup"
                type="text"
                value={pickupPoint}
                onChange={handlePickupChange}
                placeholder="Nhập điểm đón mới"
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <button
                className={styles.submitBtn}
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật điểm đón'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
