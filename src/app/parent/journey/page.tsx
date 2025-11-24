'use client';

const PORT_SERVER = 8888;

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import BusMap_GG from '@/components/BusMap_GG_Parent';
import BusInfoPanel from '@/components/BusInfoPanel';
import { Bus } from '@/lib/data_buses';
import styles from './page.module.css';
import { useRouter } from "next/navigation";

/**
 * Trang theo dõi hành trình dành cho Parent
 * - Parent chỉ thấy bus của con mình đang đi (filter theo parentID)
 * - Tái sử dụng BusMap_GG component từ admin
 * - Socket.IO realtime updates
 */
export default function ParentJourneyPage() {
  const router = useRouter();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allowedBusIDs, setAllowedBusIDs] = useState<Set<number>>(new Set()); // Bus IDs của parent
  
  // Lấy parentID từ localStorage
  const [parentID, setParentID] = useState<number | null>(null);



  useEffect(() => {

    // From localStorage: 
    // Lưu thông tin vào localStorage
      // localStorage.setItem('userRole', data.role);
      // Convert userID to string to avoid null issue
      // localStorage.setItem('userID', data.userID ? data.userID.toString() : "");
      // localStorage.setItem('fullName', data.fullName);

    const role = localStorage.getItem('userRole');
    const storedParentID = localStorage.getItem('userID');  // use 'userID', NOT parentID

    // const role = localStorage.getItem('userRole') || 'parent';
    // const storedParentID = localStorage.getItem('parentID') || "11";

    console.log('->_<- Retrieved from localStorage - role:', role, 'parentID:', storedParentID);   

    if (role !== 'parent' || !storedParentID) {
      alert('Vui lòng đăng nhập với tài khoản phụ huynh!');
      router.push('/login');
      return;
    }

    setParentID(parseInt(storedParentID));
  }, [router]);

  // --- 1. Fetch danh sách buses của con parent ---
  useEffect(() => {
    // Chỉ fetch khi đã có parentID (không null)
    if (!parentID) {
      // console.log('[ParentJourneyPage] Chưa có parentID, bỏ qua fetch');
      return;
    }

    const fetchStudentBuses = async () => {
      try {
        setLoading(true);
        console.log('[ParentJourneyPage] Fetching buses for parent:', parentID);
        
        const response = await fetch(`http://localhost:${PORT_SERVER}/api/parents/${parentID}/student-buses`);
        
        if (!response.ok) {
          throw new Error('Không thể tải thông tin xe buýt');
        }
        
        const data = await response.json();
        
        console.log('✅ API Response:', data);
        
        if (!data || data.length === 0) {
          console.warn('⚠️ API trả về empty array - không có chuyến xe nào');
          setBuses([]);
          setAllowedBusIDs(new Set());
          setError(null);
          setLoading(false);
          return;
        }
        
        // Lưu danh sách busIDs được phép xem
        const busIDsSet = new Set<number>(data.map((item: any) => item.busID));
        setAllowedBusIDs(busIDsSet);
        
        console.log('----------- Parent được xem buses -----------\n', Array.from(busIDsSet), '\n----------------------');
        
        // Convert sang định dạng Bus cho BusMap_GG
        const busesData: Bus[] = data.map((item: any) => ({
          id: item.busID.toString(),
          busNumber: item.licensePlate || `Xe ${item.busID}`, // Dùng licensePlate thay vì busNumber
          driverName: `Tài xế xe ${item.busID}`,
          route: item.routeName || `Tuyến ${item.routeID}`,
          routeID: item.routeID, // Thêm routeID để BusMap_GG có thể auto-select
          status: item.tripStatus === 'RUNNING' ? 'moving' : 'stopped',
          eta: new Date(Date.now() + 30 * 60000).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          x: 0,
          y: 0,
          lat: 10.759983082120561, // Default SGU, sẽ được cập nhật bởi Socket.IO
          lng: 106.68225725256899,
          lastUpdate: new Date(),
          isTracking: true,
          isOnline: true,
          alerts: [],
        }));
        
        console.log('✅ Đã tạo buses data:', busesData);
        console.log('✅ Route names từ buses:', busesData.map(b => b.route));
        setBuses(busesData);
        setError(null);
      } catch (err) {
        console.error('❌ Lỗi fetch student buses:', err);
        setError('Không thể tải thông tin xe buýt. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentBuses();
  }, [parentID]);
  
  // --- 2. Socket.IO realtime updates (với filtering) ---
  useEffect(() => {
    // Chỉ connect socket khi đã có allowedBusIDs
    if (allowedBusIDs.size === 0) return;

    const socket = io(`http://localhost:${PORT_SERVER}`);

    socket.on('connect', () => {
      console.log('->_<- Parent kết nối Socket.IO:', socket.id);
      console.log('->LOCK<- Parent chỉ xem buses:', Array.from(allowedBusIDs));
    });

    socket.on('updateBusLocation', (data) => {
      // FILTER: Chỉ xử lý nếu busID thuộc danh sách của parent
      if (!allowedBusIDs.has(data.busID)) {
        console.log('!X! Bỏ qua bus không thuộc parent:', data.busID);
        return;
      }

      console.log('->_<- Parent nhận realtime bus location:', data);

      setBuses((prevBuses) => {
        const updatedBuses = prevBuses.map((bus) =>
          bus.id === data.busID.toString()
            ? { 
                ...bus, 
                lat: data.lat, 
                lng: data.lng, 
                isOnline: true,
                lastUpdate: new Date(),
                status: (data.speed > 5 ? 'moving' : 'stopped') as 'moving' | 'stopped',
              }
            : bus
        );
        return updatedBuses;
      });
    });

    socket.on('disconnect', () => {
      console.warn('->WARNING<- Parent mất kết nối Socket.IO');
    });

    return () => { 
      socket.disconnect();
    };
  }, [allowedBusIDs]); // Re-connect khi allowedBusIDs thay đổi

  // --- 3. Toggle tracking ---
  const toggleTracking = (id: string) => {
    console.log('[ParentJourneyPage] Toggle tracking:', id);
    setSelectedBus(null);
    window.dispatchEvent(new Event('busUnselected'));
    
    setBuses((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, isTracking: !b.isTracking } : b
      )
    );
  };
  
  // --- 4. Handle bus selection ---
  const handleBusSelect = (bus: any) => {
    console.log('[ParentJourneyPage] Bus selected:', bus);
    setSelectedBus(bus);
  };
  
  const handleBusUnselect = () => {
    console.log('[ParentJourneyPage] handleBusUnselect');
    setSelectedBus(null);
  };

  // --- 6. Render ---
  if (loading) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.loading}>
          <p>Đang tải thông tin xe buýt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.mainContent}>
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // if (buses.length === 0) {
  //   return (
  //     <div className={styles.mainContent}>
  //       <div className={styles.empty}>
  //         <p>Con bạn hiện chưa có chuyến xe nào đang hoạt động.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={styles.mainContent}>
      <div className={styles.overview}>
        <div className={styles.overviewHeader}>
          <h3>Theo dõi xe buýt của con</h3>
          <p className={styles.subtitle}>
            Xe buýt: <strong>{buses[0]?.busNumber}</strong> - Tuyến: <strong>{buses[0]?.route}</strong>
          </p>
        </div>

        <div className={styles.mapContainer}>
          {/* Google Maps với BusMap_GG */}
          <BusMap_GG 
            buses={buses} 
            onBusSelect={handleBusSelect}
            onBusUnselect={handleBusUnselect}
            isMoving={false}
            hideRoutePanel={true}
          />
        </div>

        {/* Bus Info Panel */}
        {selectedBus && (
          <div className={styles.infoPanelContainer}>
            <BusInfoPanel
              bus={selectedBus}
              onToggleTracking={toggleTracking}
            />
          </div>
        )}
      </div>
    </div>
  );
}
