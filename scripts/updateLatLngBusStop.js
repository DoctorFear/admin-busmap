import dotenv from "dotenv";
import path from "path";

//  Load file `.env.local` thay vì `.env`
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import mysql from "mysql2/promise";
import axios from "axios";

const SQL_DATABASE_NAME = "SchoolBusManagement";
const SQL_USER = "root";
const SQL_PASSWORD = "";

const googleApiKey = process.env.NEXT_PUBLIC_GG_MAPS_KEY;

// ======================
// 1. Kết nối database
// ======================
const db = await mysql.createConnection({
  host: 'localhost',
  user: SQL_USER,
  password: SQL_PASSWORD,
  database: SQL_DATABASE_NAME,
});

const GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

// ======================
// 2. Hàm gọi API Google
// ======================
async function getLatLng(address) {
  try {
    const response = await axios.get(GEOCODE_URL, {
      params: {
        address,
        key: googleApiKey,
      },
    });

    console.log("- Status response:",response.data.status)
    
    if (response.data.status === "OK") {
      const { lat, lng } = response.data.results[0].geometry.location;
      console.log("- Location from API: ", lat, lng);
      return { lat, lng };
    } else {
      console.warn(`- Không tìm thấy tọa độ cho địa chỉ: ${address}`);
      return null;
    }
  } catch (err) {
    console.error("- Lỗi khi gọi Google Maps API:", err.message);
    return null;
  }
}

// ======================
// 3. Hàm chính
// ======================
async function main() {
  // console.log("- Bắt đầu cập nhật tọa độ từ bảng Parent...");

  // // Lấy danh sách các BusStop chưa có lat/lng
  // const [rows] = await db.execute(`
  //   SELECT bs.busStopID, bs.parentID, p.address
  //   FROM BusStop bs
  //   JOIN Parent p ON bs.parentID = p.parentID
  //   WHERE (bs.lat IS NULL OR bs.lng IS NULL)
  //     AND p.address IS NOT NULL
  // `);

  // console.log(`- Có ${rows.length} điểm cần cập nhật tọa độ`);

  // for (const row of rows) {
  //   const { busStopID, address } = row;
  //   const coords = await getLatLng(address);

  //   if (coords) {
  //     const { lat, lng } = coords;
  //     await db.execute(
  //       "UPDATE BusStop SET lat = ?, lng = ? WHERE busStopID = ?",
  //       [lat, lng, busStopID]
  //     );
  //     console.log(`- Đã cập nhật BusStopID=${busStopID} (${lat}, ${lng})`);
  //   } else {
  //     console.warn(`- Bỏ qua BusStopID=${busStopID}, không có kết quả hợp lệ`);
  //   }

  //   // Chờ 400ms giữa các request để tránh bị giới hạn
  //   await new Promise((resolve) => setTimeout(resolve, 400));
  // }

    // TESTING
    const address1 = "394 Nguyễn Tất Thành, Phường 15, Quận 7, Thành phố Hồ Chí Minh, Việt Nam"
    // const address2 = "14 Nguyễn Tất Thành, Phường 15, Quận 7, Thành phố Hồ Chí Minh, Việt Nam"
    const address2 = "997 Đồng Khởi, Phường 7, Quận 1, Thành phố Hồ Chí Minh, Việt Nam"
    
    const coords1 = await getLatLng(address1);
    const coords2 = await getLatLng(address2);
    console.log(coords1, "-", coords2)

  console.log("- Hoàn thành cập nhật toàn bộ tọa độ!");
  await db.end();
}

// ======================
// 4. Chạy script
// ======================
main().catch((err) => {
  console.error("- Lỗi toàn cục:", err);
});
