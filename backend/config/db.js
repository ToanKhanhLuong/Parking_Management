const mysql = require('mysql2/promise'); // Bắt buộc phải có chữ /promise ở đây
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Thêm đoạn này để test kết nối cho bạn yên tâm
pool.getConnection()
    .then(() => {
        console.log("✅ Đã kết nối thành công tới MySQL database!");
    })
    .catch((err) => {
        console.error("❌ Lỗi kết nối database:", err);
    });

module.exports = pool;