
import db from "./db.js";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import initTrackingSocket from "./sockets/trackingSocket.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from 'path';
import fs from "fs";

// Routes
import authRoutes from "./routes/authRoutes.js";
import busRoutes from "./routes/busRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import studentsRoutes from "./routes/studentsRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import overviewRoutes from "./routes/overviewRoutes.js";
import driverAlertRoutes from "./routes/driverAlertRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import routePythonService from "./routes/routePythonService.js";

const app = express();
const PORT = 8888;

// ---------- Middleware ----------
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true, // quan trọng để gửi cookie
}));

app.use(cookieParser());
app.use(express.json());

// --------- Serve static uploads ----------
const uploadDir = path.join('public', 'uploads', 'students');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join('public', 'uploads')));

// ---------- Session ----------
app.use(session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000, // 2 giờ
        httpOnly: true,
        secure: false,   // true nếu HTTPS
        sameSite: "lax" // bắt buộc để cookie cross-origin
    }
}));

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/routes", routeRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/driver-alerts', driverAlertRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/test-python", routePythonService);

// ---------- HTTP + Socket ----------
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*" }
});
initTrackingSocket(io);

// ---------- Start server ----------
httpServer.listen(PORT, () => {
    console.log(`Server + Socket running at http://localhost:${PORT}`);
});





// ----------------------------------------- OLD VERSION ----------------------------------------- \\

// // 1. Import 
// import db from "./db.js"
// import express from "express";      // Nếu Node chưa cấu hình, có thể dùng: const express = require('express')
// import { createServer } from "http";
// import { Server } from "socket.io";
// import initTrackingSocket from "./sockets/trackingSocket.js";
// // Route:
// import busRoutes from './routes/busRoutes.js'
// import scheduleRoutes from "./routes/scheduleRoutes.js"
// import studentsRoutes from "./routes/studentsRoutes.js"
// import routeRoutes from "./routes/routeRoutes.js"
// import cors from "cors";
// import authRoutes from "./routes/authRoutes.js";
// import cookieParser from "cookie-parser";


// import parentRoutes from './routes/parentRoutes.js';
// import driverRoutes from './routes/driverRoutes.js';
// import assignmentRoutes from './routes/assignmentRoutes.js';
// import overviewRoutes from './routes/overviewRoutes.js';
// import driverAlertRoutes from './routes/driverAlertRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';


// // TESTING:
// import routePythonService from "./routes/routePythonService.js"

// // 2. Tạo object, ứng dụng Express, thực hiện route, middleware,..
// const app = express();
// app.use(cors({
//   origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

// // 3. Cấu hình port để server lister
// // - Có thể đặt cố định (8888) hoặc dùng biến môi trường: 
// //          const PORT = process.env.PORT || 8888;
// const PORT = 8888;

// // 4. middleware: chạy giữa lúc server nhận request và trả response
// // 
// // Đọc body dạng JSON từ request
// // - Khi client gửi request POST/PUT với header `Content-Type: application/json`, middleware này sẽ parse JSON
// //   và gán kết quả vào req.body (vd: req.body = { name: "A" }).
// // - Middleware chạy BEFORE các route để mọi route sau đó có thể sử dụng req.body.
// app.use(cookieParser());
// app.use(express.json())
// // 4.1 Add route API for buses
// app.use('/api/buses', busRoutes)
// // 4.2 Add route API for schedule 
// app.use("/api/schedules", scheduleRoutes)
// // 4.3 Add route API for students
// app.use("/api/students", studentsRoutes)
// // 4.4 Add route API for routes (tuyến đường)
// app.use("/api/routes", routeRoutes)
// app.use("/api/auth", authRoutes);


// app.use('/api/parents', parentRoutes);
// app.use('/api/drivers', driverRoutes);
// app.use('/api/assignments', assignmentRoutes);
// app.use('/api/overview', overviewRoutes);
// app.use('/api/driver-alerts', driverAlertRoutes);
// app.use('/api/notifications', notificationRoutes);
import adminNotificationRoutes from './routes/adminNotificationRoutes.js';
app.use('/api/admin', adminNotificationRoutes);


// // Testing
// app.use("/test-python", routePythonService);

// // 5. route: là đuòng dẫn API (e.g: /api/students), mỗi route gắn vơi một HTTP method (GET, POST, PUT, PATCH DELETE)
// //    endpoint: GET - /api/students -> Lấy danh sách học sinh 
// // Cho method GET ở đường dẫn "/"
// // - app.get(path, handler): khi có HTTP GET request tới path "/", Express sẽ gọi handler.
// // - handler có 2 tham số chính:
// //     req: đối tượng Request (chứa thông tin request: headers, params, query, body, v.v.)
// //          + req.params — tham số đường dẫn (/users/:id)
// //          + req.query — query string (?page=2)
// //          + req.body — body request (khi dùng middleware parse JSON)
// //          + req.headers — header gửi kèm
// //     res: đối tượng Response (dùng để trả về dữ liệu cho client)
// //          + res.send() — trả text/html
// //          + res.json() — trả JSON (tự set header Content-Type: application/json)
// //          + res.status(code) — set HTTP status code
// // - res.send(...) gửi response dạng text (Express tự set Content-Type phù hợp).
// // - Thay vì res.send, ta có thể dùng res.json({ msg: "..." }) để trả JSON,
// //   hoặc res.status(200).send(...)/res.status(201).json(... ) để đặt mã trạng thái rõ ràng.

// // -----------------------------------------
// // app.get("/", (req, res) => {
// //     res.send("Express server run successfully!")
// // });

// // 5. Tạo http server và socket server
// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//     // CORS: để client có thể fetch tới đc (không bị chặn bởi khác port)
//     cors: {
//         origin: "*",    // tất cả domain (local dev - client)
//     }
// });

// // 6. Init socket tracking
// initTrackingSocket(io);

// // 7. Run server, lắng nghe client trên port
// // - app.listen(port, callback) khởi động HTTP server.
// // - callback chạy khi server đã sẵn sàng (thường dùng để log).
// // - Nếu port bị chiếm (đã có chương trình chạy), Node sẽ báo lỗi — khi đó đổi port hoặc tắt app khác.

// // -----------------------------------------
// // app.listen(PORT, () =>{
// //     console.log(`Server running at http://localhost:${PORT}`)
// // });

// // 7. Start server
// httpServer.listen(PORT, () => {
//     console.log(`\n🖥 Server + Socket: running at http://localhost:${PORT}`);
// })
// server.js