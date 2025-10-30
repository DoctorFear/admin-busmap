/** Express methods:
 * 1. app.get       (R)     Handle GET request from client
        app.get('/route', (req, res) => {
        // req = thông tin request
        // res = đối tượng gửi phản hồi
        })
        - E.g:
        app.get('/', (req, res) => {
            res.send('🏠 Home Page')
        })

 * 2. app.post      (C)     Get data from client (via from, JSON, or body) and create new data
        app.use(express.json()) // cho phép đọc JSON trong body

        app.post('/login', (req, res) => {
            const { username, password } = req.body
            res.send(`Đã nhận username=${username}, password=${password}`)
        })


 * 3. app.put       (U)     Update existed data, 
        app.put('/user/:id', (req, res) => {
            const { id } = req.params
            const { name } = req.body
            res.send(`Đã cập nhật user có id=${id} thành tên=${name}`)
        })

 * 4. app.delete    (D)     Delete existed data
        app.delete('/user/:id', (req, res) => {
            const { id } = req.params
            res.send(`Đã xóa user có id=${id}`)
        })

 * 5. app.all               Handle all request type (GET, POST, PUT, ...) in 1 path
        app.all('/api/check', (req, res) => {
            res.send(`Phương thức bạn dùng là: ${req.method}`)
        })

 * 6. app.use (middleware)  Add middleware - function run before go to main route
        app.use((req, res, next) => {
            console.log(`[${req.method}] ${req.url}`)
            next() // bắt buộc để chuyển sang bước tiếp theo
        })
        - E.g for detail branch:
        app.use('/api', (req, res, next) => {
            console.log('API middleware chạy!')
            next()
        })
        app.get('/api/user', (req, res) => res.send('Danh sách user'))

 * 7. app.listen            Listen for connect HTTP on port [8888]
        app.listen(5555, () => {
            console.log('Server đang chạy tại http://localhost:8888')
        })

    | Method           | Mục đích                  | Khi nào dùng                                   | Ví dụ thực tế                   |
    | ---------------- | ------------------------- | ---------------------------------------------- | ------------------------------- |
    | **app.get()**    | Lấy dữ liệu (Read)        | Khi user truy cập hoặc đọc thông tin           | Trang chủ, xem user             |
    | **app.post()**   | Tạo dữ liệu mới (Create)  | Khi gửi form, đăng ký tài khoản, thêm sản phẩm | `/register`, `/api/addProduct`  |
    | **app.put()**    | Cập nhật dữ liệu (Update) | Khi chỉnh sửa thông tin                        | `/api/updateUser/:id`           |
    | **app.delete()** | Xóa dữ liệu (Delete)      | Khi cần xóa                                    | `/api/deleteUser/:id`           |
    | **app.all()**    | Xử lý mọi method          | Kiểm tra / log / chặn                          | `/api/*`                        |
    | **app.use()**    | Middleware (lọc trước)    | Gắn logic chung cho nhiều route                | Log, xác thực token, parse JSON |
    | **app.listen()** | Khởi động server          | Mở port cho client truy cập                    | `app.listen(5555)`              |

 */
