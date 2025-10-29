// 1. Import Express framework
import express from "express";
// Nếu Node chưa cấu hình, có thể dùng 
//          const express = require('express')

// 2. Tạo object, ứng dụng Express, thực hiện route, mIddleware,..
const app = express();

// 3. Cấu hình port để server lister
// - Có thể đặt cố định (8888) hoặc dùng biến môi trường: 
//          const PORT = process.env.PORT || 8888;
const PORT = 8888;

// 4. middleware: chạy giữa lúc server nhận request và trả response
// 
// Đọc body dạng JSON từ request
// - Khi client gửi request POST/PUT với header `Content-Type: application/json`, middleware này sẽ parse JSON
//   và gán kết quả vào req.body (vd: req.body = { name: "A" }).
// - Middleware được đăng ký BEFORE các route để mọi route sau đó có thể sử dụng req.body.
app.use(express.json())

// 5. route: là đuòng dẫn API (e.g: /api/students), mỗi route gắn vơi một HTTP method (GET, POST, PUT, PATCH DELETE)
//    endpoint: GET - /api/students -> Lấy danh sách học sinh 
// Cho method GET ở đường dẫn "/"
// - app.get(path, handler): khi có HTTP GET request tới path "/", Express sẽ gọi handler.
// - handler có 2 tham số chính:
//     req: đối tượng Request (chứa thông tin request: headers, params, query, body, v.v.)
//          + req.params — tham số đường dẫn (/users/:id)
//          + req.query — query string (?page=2)
//          + req.body — body request (khi dùng middleware parse JSON)
//          + req.headers — header gửi kèm
//     res: đối tượng Response (dùng để trả về dữ liệu cho client)
//          + res.send() — trả text/html
//          + res.json() — trả JSON (tự set header Content-Type: application/json)
//          + res.status(code) — set HTTP status code
// - res.send(...) gửi response dạng text (Express tự set Content-Type phù hợp).
// - Thay vì res.send, ta có thể dùng res.json({ msg: "..." }) để trả JSON,
//   hoặc res.status(200).send(...)/res.status(201).json(... ) để đặt mã trạng thái rõ ràng.
app.get("/", (req, res) => {
    res.send("Express server run successfully!")
});

// 6. Run server, lắng nghe client trên port
// - app.listen(port, callback) khởi động HTTP server.
// - callback chạy khi server đã sẵn sàng (thường dùng để log).
// - Nếu port bị chiếm (đã có chương trình chạy), Node sẽ báo lỗi — khi đó đổi port hoặc tắt app khác.
app.listen(PORT, () =>{
    console.log(`Server running at http://localhost:${PORT}`)
});