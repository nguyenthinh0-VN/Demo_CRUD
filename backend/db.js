const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '1234',
    database: 'demo',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
async function testConnectionAndFetchUser() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Kết nối cơ sở dữ liệu thành công!');

    } catch (error) {
        console.error('Lỗi kết nối hoặc truy vấn cơ sở dữ liệu:', error);
    } finally {
        if (connection) connection.release();
    }
}


// Gọi hàm kiểm tra kết nối khi file này được require
testConnectionAndFetchUser();
module.exports = pool;