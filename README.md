# Busmap admin

---

## Run (from `root` directory of project, e.g: ~/Documents/Busmap_admin)

```
npm run dev
npm run server
```

## SERVER (BE)

---

### Structures

```
src/server/
│
├── server.js
├── db.js                   // kết nối MySQL
├── controllers/
│   └── scheduleController.js
├── models/
│   ├── routeModel.js
│   ├── routeDetailModel.js
│   └── tripModel.js
├── routes/
│   ├── scheduleRoutes.js   // quản lý lịch trình 
│   ├── busRoutes.js        // quản lý xe buýt
│   ├── driverRoutes.js     // quản lý tài xế
│   └── trackingRoutes.js   // theo dõi vị trí
└── sockets/
    └── trackingSocket.js   // nhận & phát vị trí qua WebSocket
```

- Operation of socket:
```
Driver(Client)           Server(Node + Socket.IO)           OtherClients (Admin/Parent) 
    |                           |                                    |
    | -- socket.connect() --->  |                                    |
    |                           |  (connection established)           |
    |                           | <--- socket.on('connect') --------- |
    |                           |                                    |
    | -- emit 'busLocation' --> |                                    |
    |    {busID, lat, lng...}   |                                    |
    |                           |  console.log("📍 Nhận vị trí")     |
    |                           |  -> optionally save DB             |
    |                           |                                    |
    |                           | -- io.emit('updateBusLocation') -->|
    |                           |    {busID, lat, lng...}            |
    |                           |                                    |
    |                           |                                    | -- update UI (move marker)
    |                           |                                    |    update local state
    | <--- optional ACK --------|                                    |
    |                           |                                    |
```


## UI

### Tổng quan kiến trúc

```
src/
├── app/ → App Router (Next.js 13+)
├── components/ → Component UI tái sử dụng
├── lib/ → Dữ liệu giả lập & hàm tiện ích
└── server/ → Server Actions / API Routes (tương lai)
```

### Chi tiết cấu trúc thư mục

#### `src/app/`

Mỗi thư mục là **một route** trong ứng dụng.

| Route         | Mục đích                             | File chính                     |
| ------------- | ------------------------------------ | ------------------------------ |
| `assignment/` | Phân công tài xế cho tuyến xe        | `page.tsx` + `page.module.css` |
| `contact/`    | Gửi tin nhắn / thông báo             | `page.tsx` + `page.module.css` |
| `dashboard/`  | Tổng quan hệ thống (thống kê)        | `page.tsx` + `page.module.css` |
| `list/`       | Danh sách (tài xế, phụ huynh, xe...) | `page.tsx`                     |
| `messenger/`  | Hệ thống chat nội bộ                 | `page.tsx`                     |
| `schedule/`   | Quản lý lịch xe buýt                 | `page.tsx`                     |
| `track/`      | Theo dõi vị trí xe (real-time)       | `page.tsx`                     |

> **Mỗi trang chính có file CSS riêng** → **CSS Modules** → tránh xung đột style.

---

#### `src/components/`

Các component **tái sử dụng** trên nhiều trang. / có css riêng ở phần styles (css cho các component)

| Component               | Mục đích                             | Dùng ở               |
| ----------------------- | ------------------------------------ | -------------------- |
| `Navbar.tsx`            | Thanh điều hướng chính               | `layout.tsx`         |
| `Notification.tsx`      | Hiển thị thông báo                   | Dashboard, Messenger |
| `OverviewTable.tsx`     | Bảng tổng quan (thống kê)            | Dashboard            |
| `PaginationControl.tsx` | Phân trang                           | List, Schedule       |
| `ParentDriverForm.tsx`  | Form thêm/sửa phụ huynh/tài xế       | List                 |
| `ParentDriverTable.tsx` | Bảng danh sách                       | List                 |
| `ScheduleForm.tsx`      | Tạo/sửa lịch trình                   | Schedule             |
| `ScheduleTable.tsx`     | Hiển thị lịch xe                     | Schedule             |
| `SearchBar.tsx`         | Tìm kiếm nhanh                       | List, Dashboard      |
| `RoadInput.tsx`         | Nhập tuyến đường (tọa độ, điểm dừng) | Schedule             |

---

#### `src/lib/`

Dữ liệu **giả lập (mock data)** và hàm tiện ích.

| File                      | Mục đích                                 |
| ------------------------- | ---------------------------------------- |
| `data_assignment.ts`      | Dữ liệu phân công (tài xế ↔ tuyến xe)    |
| `data_bus.ts`             | Danh sách xe buýt                        |
| `data_dashboard.ts`       | Dữ liệu thống kê cho dashboard           |
| `data_messaging.ts`       | Tin nhắn mẫu                             |
| `data_parents_drivers.ts` | Danh sách phụ huynh & tài xế             |
| `data_schedule.ts`        | Lịch trình xe                            |
| `util.ts`                 | Hàm hỗ trợ: format date, filter, sort... |

> **Sau này**: thay bằng gọi API từ backend.

---

## INSTALL AND UTILS


### 1. Expresss: [Install express](https://www.npmjs.com/package/express), in path with contain package.json:

`npm install express`

- Add this code to package.json to run server Express with cmd: `npm run server`

```
"scripts": {
  "server": "node src/server/server.js"
}

```

### 2. mysql2 (connect MySQL): `npm install mysql2`

### 3. socket.io (tracking realtime)

`npm install socket.io`
`npm install socket.io-client`

### 4. Google Maps API: `npm install react-google-maps/api`

### 5. cookie-parser: `npm install cookie-parser`

### Utils

1. To kill port: `npx kill-port [PORT]`

2. All port we use:

- BE, server(express): 8888
- FE: 3000

---
---
---

## Documents of NextJS

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
