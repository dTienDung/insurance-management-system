const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'QuanlyHDBaoHiem',
  user: process.env.DB_USER || 'insurance_admin',
  password: process.env.DB_PASSWORD || 'Insurance@123',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

const getConnection = async () => {
  try {
    if (!poolPromise) {
      poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then(pool => {
          console.log('✅ Kết nối SQL Server thành công!');
          return pool;
        })
        .catch(err => {
          console.error('❌ Lỗi kết nối SQL Server:', err);
          poolPromise = null;
          throw err;
        });
    }
    return await poolPromise;
  } catch (error) {
    throw error;
  }
};

const closeConnection = async () => {
  try {
    if (poolPromise) {
      const pool = await poolPromise;
      await pool.close();
      poolPromise = null;
      console.log('🔌 Đã đóng kết nối SQL Server');
    }
  } catch (error) {
    console.error('❌ Lỗi khi đóng kết nối:', error);
  }
};

module.exports = {
  sql,
  getConnection,
  closeConnection
};