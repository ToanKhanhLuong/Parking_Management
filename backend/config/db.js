const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // thêm dòng này
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(() => {
        console.log("✅ Đã kết nối thành công tới MySQL database!");
    })
    .catch((err) => {
        console.error("❌ Lỗi kết nối database:", err);
    });

module.exports = pool;