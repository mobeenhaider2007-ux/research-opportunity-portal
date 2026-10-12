const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'research_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// If a custom socket path is defined in environment, attach it
if (process.env.DB_SOCKET_PATH) {
  poolConfig.socketPath = process.env.DB_SOCKET_PATH;
}

const pool = mysql.createPool(poolConfig);

/**
 * Tests database connectivity on app startup
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`Connected to MySQL Database: ${poolConfig.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL Connection Failed:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
