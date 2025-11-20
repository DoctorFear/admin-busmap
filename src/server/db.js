// --- CONNECT MYSQL DATABASE --- \\
// - Mọi người có thể chỉnh các constant cho phù hợp với MySQL của máy mình
import mysql from 'mysql2';

const SQL_DATABASE_NAME = 'SchoolBusManagement_VFinal';
const SQL_USER = 'root';
const SQL_PASSWORD = '';



const db = mysql.createConnection({
    host: 'localhost',
    user: SQL_USER,
    password: SQL_PASSWORD,       // đổi nếu bạn đặt mật khẩu MySQL
    database: SQL_DATABASE_NAME  // tên DB của bạn
});

db.connect((err) => {
    if (err) {
        console.error('❌ Lỗi kết nối MySQL:', err);
    } else {
        console.log('✅ Đã kết nối MySQL thành công');
    }
});

export default db;