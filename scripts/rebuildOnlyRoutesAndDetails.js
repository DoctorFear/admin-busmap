/**
 * Rebuild ONLY Route and RouteDetail based on Parent (+ optional BusStop lat/lng).
 * - DOES NOT touch BusStop, Trip or any other tables.
 * - Deletes RouteDetail and Route (FK checks disabled during delete/insert).
 * - Groups parents by district and creates up to 50 routes.
 * - RouteDetail rows are created from parent addresses, with lat/lng taken
 *   from BusStop if available; otherwise left NULL.
 * Mean: 
 * Xóa RouteDetail và Route với FOREIGN_KEY_CHECKS tắt trong lúc xóa/chèn.
 * Đọc Parent JOIN BusStop (nếu có) để lấy lat/lng; nhóm theo quận như bạn yêu cầu.
 * Tạo tối đa 50 Route theo quận và chèn RouteDetail theo thứ tự, dùng streetName từ phần đầu địa chỉ; lat/lng lấy từ BusStop nếu có, nếu không sẽ để NULL. 
 *
 */

import dotenv from "dotenv";
import path from "path";
import mysql from "mysql2/promise";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SQL_DATABASE_NAME = "SchoolBusManagement";
const SQL_USER = "root";
const SQL_PASSWORD = "";

const MAX_ROUTES = 50;
const MAX_STOPS_PER_ROUTE = 11;

const db = await mysql.createConnection({
  host: "localhost",
  user: SQL_USER,
  password: SQL_PASSWORD,
  database: SQL_DATABASE_NAME,
});

function detectDistrict(address) {
  if (!address) return "Khác";
  const a = address.toLowerCase();
  const mQuan = a.match(/quận\s*\d+/i);
  if (mQuan) return mQuan[0].replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase());
  if (a.includes("bình thạnh")) return "Bình Thạnh";
  if (a.includes("phú nhuận")) return "Phú Nhuận";
  if (a.includes("tân bình")) return "Tân Bình";
  if (a.includes("gò vấp")) return "Gò Vấp";
  if (a.includes("quận 1")) return "Quận 1";
  if (a.includes("quận 3")) return "Quận 3";
  if (a.includes("quận 5")) return "Quận 5";
  if (a.includes("quận 7")) return "Quận 7";
  if (a.includes("quận 8")) return "Quận 8";
  if (a.includes("quận 10")) return "Quận 10";
  return "Khác";
}

function streetFromAddress(address) {
  if (!address) return "Địa chỉ";
  return address.split(",")[0].trim();
}

async function fetchParentsWithOptionalCoords() {
  const [rows] = await db.execute(`
    SELECT p.parentID, p.address, bs.lat, bs.lng
    FROM Parent p
    LEFT JOIN BusStop bs ON bs.parentID = p.parentID
    WHERE p.address IS NOT NULL AND p.address <> ''
  `);
  return rows.map((r) => ({
    parentID: r.parentID,
    address: r.address,
    lat: r.lat !== null ? Number(r.lat) : null,
    lng: r.lng !== null ? Number(r.lng) : null,
    district: detectDistrict(r.address),
  }));
}

async function clearOnlyRoutes() {
  await db.execute("SET FOREIGN_KEY_CHECKS = 0");
  try {
    await db.execute("DELETE FROM RouteDetail");
    await db.execute("DELETE FROM Route");
  } finally {
    await db.execute("SET FOREIGN_KEY_CHECKS = 1");
  }
}

async function insertRoute(routeName, description = null) {
  const [res] = await db.execute(
    "INSERT INTO Route (routeName, description, estimatedTime, createdAt) VALUES (?, ?, ?, NOW())",
    [routeName, description, null]
  );
  // @ts-ignore
  return res.insertId;
}

async function insertRouteDetail(routeID, orderNumber, streetName, note, lat, lng) {
  await db.execute(
    `INSERT INTO RouteDetail (routeID, orderNumber, streetName, note, lat, lng)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [routeID, orderNumber, streetName, note, lat, lng]
  );
}

async function main() {
  console.log(" Rebuilding ONLY Route & RouteDetail from Parent addresses...");
  const parents = await fetchParentsWithOptionalCoords();

  // Group by district
  const byDistrict = new Map();
  for (const p of parents) {
    const key = p.district || "Khác";
    if (!byDistrict.has(key)) byDistrict.set(key, []);
    byDistrict.get(key).push(p);
  }

  await clearOnlyRoutes();

  // Create routes per district
  const districts = Array.from(byDistrict.keys()).sort();
  let createdRoutes = 0;

  for (const district of districts) {
    if (createdRoutes >= MAX_ROUTES) break;
    const group = byDistrict.get(district);
    if (!group || group.length === 0) continue;

    for (let i = 0; i < group.length && createdRoutes < MAX_ROUTES; i += MAX_STOPS_PER_ROUTE) {
      const slice = group.slice(i, i + MAX_STOPS_PER_ROUTE);
      const routeName = `Tuyến ${createdRoutes + 1}: ${district}`;
      const routeID = await insertRoute(routeName, `Tuyến theo quận ${district}`);

      // Use Parent order as-is; write RouteDetail with available lat/lng
      let order = 1;
      for (const p of slice) {
        await insertRouteDetail(
          routeID,
          order,
          streetFromAddress(p.address),
          null,
          p.lat,
          p.lng
        );
        order++;
      }
      createdRoutes++;
      console.log(`${routeName}: ${order - 1} details`);
    }
  }

  console.log(` Done. Created ${createdRoutes} routes (max ${MAX_ROUTES}).`);
  await db.end();
}

main().catch(async (err) => {
  console.error("Fatal:", err);
  try {
    await db.end();
  } catch {}
  process.exit(1);
});


